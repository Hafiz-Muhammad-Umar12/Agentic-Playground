"""
Production-Grade Celery Tasks (FIXED)
- Safe retries
- No tmp_dir issues
- Clean DB handling
- Stable pipeline execution
"""

import structlog
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.models.models import Job, Clip, JobStatus

from app.services import video_service, storage_service as storage
from app.agents import transcription_agent, insight_agent, clipping_agent, caption_agent

logger = structlog.get_logger(__name__)

# -----------------------------
# DB SESSION (worker safe)
# -----------------------------
engine = create_engine(settings.SYNC_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


# -----------------------------
# JOB STATUS UPDATE
# -----------------------------
def _update_job_status(job_id: str, status: JobStatus, progress: int, error: str = None):
    with SessionLocal() as session:
        job = session.query(Job).filter(Job.id == job_id).first()

        if not job:
            return

        job.status = status
        job.progress = progress

        if error:
            job.error_message = error

        if status == JobStatus.COMPLETED:
            job.completed_at = datetime.now(timezone.utc)
            
        session.commit()


# -----------------------------
# MAIN PIPELINE TASK
# -----------------------------
@celery_app.task(
    bind=True,
    name="app.workers.tasks.process_video_job",
    max_retries=3,
    default_retry_delay=300,
)
def process_video_job(self, job_id: str):
    logger.info("task.start", job_id=job_id, retry=self.request.retries)

    try:
        # -------------------------
        # STEP 1: DOWNLOAD VIDEO
        # -------------------------
        _update_job_status(job_id, JobStatus.DOWNLOADING, 10)

        with SessionLocal() as session:
            job = session.query(Job).filter(Job.id == job_id).first()

            if not job:
                raise ValueError(f"Job not found: {job_id}")

            youtube_url = job.youtube_url
            local_video_path = job.local_video_path
            duration_seconds = job.duration_seconds

        if youtube_url:
            video_info = video_service.download_youtube_video(youtube_url, job_id)
        else:
            video_info = {
                "local_path": local_video_path,
                "duration_seconds": duration_seconds,
                "title": "Uploaded Video"
            }

        # -------------------------
        # STEP 2: TRANSCRIPTION
        # -------------------------
        _update_job_status(job_id, JobStatus.TRANSCRIBING, 30)

        transcript = transcription_agent.run_transcription_agent(
            video_info["local_path"]
        )

        # -------------------------
        # STEP 3: INSIGHT ANALYSIS
        # -------------------------
        _update_job_status(job_id, JobStatus.ANALYZING, 50)

        analysis_result = insight_agent.run_insight_agent(
            timestamped_transcript=transcript["timestamped_transcript"],
            duration_seconds=video_info["duration_seconds"]
        )

        candidates = analysis_result["clip_candidates"]

        # -------------------------
        # STEP 4: CLIPPING
        # -------------------------
        _update_job_status(job_id, JobStatus.CLIPPING, 70)

        clips_data = clipping_agent.run_clipping_agent(
            source_path=video_info["local_path"],
            clip_candidates=candidates,
            job_id=job_id,
            platforms=["tiktok"]
        )

        # -------------------------
        # STEP 5: CAPTIONING
        # -------------------------
        captioned_clips = caption_agent.run_caption_agent(
            clips=clips_data,
            all_segments=transcript["segments"],
            video_title=video_info.get("title", "Video")
        )

        # -------------------------
        # STEP 6: UPLOAD (Idempotent)
        # -------------------------
        _update_job_status(job_id, JobStatus.UPLOADING, 90)

        with SessionLocal() as session:
            # IDEMPOTENCY: Clear previous clips if this is a retry
            session.query(Clip).filter(Clip.job_id == job_id).delete()
            
            for clip_info in captioned_clips:

                storage_key, storage_url = storage.upload_clip(
                    clip_info["final_clip_path"],
                    job_id,
                    clip_info["clip_id"]
                )

                clip = Clip(
                    id=clip_info["clip_id"],
                    job_id=job_id,
                    start_time=clip_info["start_time"],
                    end_time=clip_info["end_time"],
                    duration=clip_info["duration"],
                    storage_key=storage_key,
                    storage_url=storage_url,
                    platform=clip_info.get("platform", "tiktok"),
                    # Store extra metadata
                    hook_text=clip_info.get("hook_text"),
                    caption=clip_info.get("caption"),
                    hashtags=clip_info.get("hashtags"),
                )

                session.add(clip)

            session.commit()

        # -------------------------
        # DONE
        # -------------------------
        _update_job_status(job_id, JobStatus.COMPLETED, 100)

        logger.info("task.success", job_id=job_id)

    except Exception as exc:
        logger.error("task.failed", job_id=job_id, error=str(exc))
        
        # Check if it's the last retry
        if self.request.retries >= self.max_retries:
            _update_job_status(job_id, JobStatus.FAILED, 0, error=str(exc))
            video_service.cleanup_job_files(job_id)
        
        raise self.retry(exc=exc)

    else:
        # Success — cleanup now
        video_service.cleanup_job_files(job_id)