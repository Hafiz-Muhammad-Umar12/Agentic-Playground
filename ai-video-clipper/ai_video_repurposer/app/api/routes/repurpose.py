"""
Main Repurpose API Routes
POST /submit      — Submit video URL or upload
GET  /status/{id} — Poll job status
GET  /results/{id}— Get all clips + metadata
GET  /clip/{id}/download — Presigned download URL
POST /publish     — Trigger publishing (premium)
"""
import uuid
from pathlib import Path
from typing import Optional

import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Clip, Job, JobStatus
from app.models.schemas import (
    ClipResponse,
    DownloadUrlResponse,
    JobResultsResponse,
    JobStatusResponse,
    PublishRequest,
    RepurposeRequest,
    SubmitJobResponse,
)
from app.services import storage_service as storage
from app.services import video_service
from app.workers.tasks import process_video_job
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/repurpose", tags=["Repurpose"])
logger = structlog.get_logger(__name__)


# ─── Submit via YouTube URL (JSON) ───────────────────────────

@router.post("/submit", response_model=SubmitJobResponse, status_code=202)
async def submit_repurpose_job(
    request: RepurposeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit a YouTube URL for repurposing."""
    if not request.youtube_url:
        raise HTTPException(400, "youtube_url is required for this endpoint")

    job_id = str(uuid.uuid4())
    job = Job(
        id=job_id,
        youtube_url=request.youtube_url,
        language=request.language,
        platforms=request.platforms,
        max_clips=request.max_clips,
        status=JobStatus.PENDING,
        progress=0,
    )
    db.add(job)
    await db.commit()

    # Dispatch Celery task
    try:
        logger.info("api.dispatch_task", job_id=job_id, queue="video")
        result = process_video_job.apply_async(
            args=[job_id],
            task_id=job_id,
            queue="video"
        )
        logger.info("api.job_submitted", job_id=job_id, task_id=result.id)
    except Exception as e:
        logger.error("api.celery_dispatch_failed", job_id=job_id, error=str(e))
        job.status = JobStatus.FAILED
        # Check settings for debug info
        from app.workers.celery_app import settings as celery_settings
        broker_host = celery_settings.CELERY_BROKER_URL.split('@')[-1]
        job.error_message = f"Worker connection failed (Broker: {broker_host}): {str(e)}"
        await db.commit()
        raise HTTPException(
            status_code=503, 
            detail=f"Background worker is currently unavailable. Connection to {broker_host} failed."
        )

    return SubmitJobResponse(
        job_id=job_id,
        message="Job queued successfully. Poll /status/{job_id} for updates.",
        status="pending",
    )


# ─── Submit via File Upload ───────────────────────────────────

@router.post("/upload", response_model=SubmitJobResponse, status_code=202)
async def submit_upload_job(
    file: UploadFile = File(...),
    platforms: str = Form("tiktok,reels,youtube_shorts"),
    language: str = Form("en"),
    max_clips: int = Form(10),
    db: AsyncSession = Depends(get_db),
):
    """Upload a video file for repurposing."""
    if not file.filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv")):
        raise HTTPException(400, "Only MP4, MOV, AVI, MKV files are supported")

    job_id = str(uuid.uuid4())
    file_content = await file.read()

    # Save to temp storage
    video_info = video_service.save_uploaded_video(file_content, file.filename, job_id)

    platforms_list = [p.strip() for p in platforms.split(",")]
    job = Job(
        id=job_id,
        original_filename=file.filename,
        local_video_path=video_info["local_path"],
        video_title=video_info.get("title", file.filename),
        duration_seconds=video_info.get("duration_seconds"),
        language=language,
        platforms=platforms_list,
        max_clips=min(max_clips, 20),
        status=JobStatus.PENDING,
        progress=0,
    )
    db.add(job)
    await db.commit()

    try:
        logger.info("api.dispatch_task", job_id=job_id, queue="video")
        result = process_video_job.apply_async(
            args=[job_id],
            task_id=job_id,
            queue="video"
        )
        logger.info("api.upload_job_submitted", job_id=job_id, task_id=result.id)
    except Exception as e:
        logger.error("api.celery_dispatch_failed", job_id=job_id, error=str(e))
        job.status = JobStatus.FAILED
        job.error_message = f"Background worker connection failed: {str(e)}"
        await db.commit()
        raise HTTPException(
            status_code=503,
            detail="Background worker is currently unavailable."
        )

    return SubmitJobResponse(
        job_id=job_id,
        message="Upload received. Job queued.",
        status="pending",
    )


# ─── Poll Job Status ──────────────────────────────────────────

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """Poll the status of a repurposing job."""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(404, f"Job {job_id} not found")

    return JobStatusResponse.model_validate(job)


# ─── Get Results ─────────────────────────────────────────────

@router.get("/results/{job_id}", response_model=JobResultsResponse)
async def get_job_results(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get the resulting clips for a completed job."""
    result = await db.execute(
        select(Job)
        .where(Job.id == job_id)
        .options(selectinload(Job.clips))
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(404, f"Job {job_id} not found")

    if job.status != JobStatus.COMPLETED:
        raise HTTPException(400, f"Job is in {job.status} state. Results only available when COMPLETED.")

    return JobResultsResponse.model_validate(job)

# ─── Download URL ─────────────────────────────────────────────

@router.get("/clip/{clip_id}/download", response_model=DownloadUrlResponse)
async def get_clip_download_url(clip_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Clip).where(Clip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(404, f"Clip {clip_id} not found")
    
    # Use storage_url from DB if available, else generate from storage_key
    if clip.storage_url:
        url = clip.storage_url
    elif clip.storage_key:
        url = storage.get_download_url(clip.storage_key, expiry=3600)
    else:
        raise HTTPException(404, "Clip file not yet uploaded")

    return DownloadUrlResponse(
        id=clip_id,
        download_url=url,
        expires_in_seconds=3600,
    )


# ─── Publish (Premium) ────────────────────────────────────────

@router.post("/publish")
async def publish_clips(request: PublishRequest, db: AsyncSession = Depends(get_db)):
    if not settings.ENABLE_PUBLISHING:
        raise HTTPException(403, "Publishing feature is not enabled on this server.")

    result = await db.execute(select(Job).where(Job.id == request.job_id))
    job = result.scalar_one_or_none()
    if not job or job.status != JobStatus.COMPLETED:
        raise HTTPException(400, "Job not found or not completed")

    user_tokens = {}
    if request.youtube_token:
        user_tokens["youtube"] = request.youtube_token
    if request.tiktok_token:
        user_tokens["tiktok"] = request.tiktok_token

    try:
        result = publish_clips_task.apply_async(args=[request.job_id, user_tokens], queue="publish")
        return {"message": "Publishing started", "job_id": request.job_id, "task_id": result.id}
    except Exception as e:
        logger.error("api.celery_publish_failed", job_id=request.job_id, error=str(e))
        raise HTTPException(
            status_code=503,
            detail="Publishing service is currently unavailable."
        )
