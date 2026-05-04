"""
Production-Stable Video Service
- yt-dlp reliable downloader
- safe temp handling
- cookie support (optional)
- clean architecture for Celery pipelines
"""

import os
import shutil
from pathlib import Path
from typing import Dict, Any

import structlog
import yt_dlp
from app.core.config import settings

logger = structlog.get_logger(__name__)


# ---------------------------
# TEMP DIR HANDLER
# ---------------------------
def _get_work_dir(job_id: str) -> Path:
    work_dir = Path(settings.TEMP_DIR) / job_id
    work_dir.mkdir(parents=True, exist_ok=True)
    return work_dir


# ---------------------------
# YOUTUBE DOWNLOADER
# ---------------------------
def download_youtube_video(url: str, job_id: str) -> Dict[str, Any]:
    work_dir = _get_work_dir(job_id)

    logger.info("video.download_start", url=url, job_id=job_id)

    ydl_opts = {
        "format": "bestvideo+bestaudio/best",
        "outtmpl": str(work_dir / "input.%(ext)s"),
        "merge_output_format": "mp4",

        # ffmpeg path (important for Windows)
        "ffmpeg_location": settings.FFMPEG_PATH,

        "noplaylist": True,
        "retries": 10,
        "fragment_retries": 10,
        "quiet": True,
    }

    # ---------------------------
    # COOKIE HANDLING (SAFE)
    # ---------------------------
    if settings.YT_DLP_COOKIES_PATH and os.path.exists(settings.YT_DLP_COOKIES_PATH):
        logger.info("video.use_cookies_file", path=settings.YT_DLP_COOKIES_PATH)
        ydl_opts["cookiefile"] = settings.YT_DLP_COOKIES_PATH
    else:
        # fallback (may work for public videos)
        ydl_opts["user_agent"] = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
        )

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)

        # ---------------------------
        # FIND DOWNLOADED FILE
        # ---------------------------
        video_files = list(work_dir.glob("input.*"))

        if not video_files:
            raise RuntimeError("No video file downloaded")

        video_path = video_files[0]

        logger.info("video.download_done", path=str(video_path))

        return {
            "local_path": str(video_path),
            "title": info.get("title", "Untitled"),
            "duration_seconds": float(info.get("duration", 0)),
            "thumbnail": info.get("thumbnail"),
        }

    except Exception as e:
        logger.error("video.download_failed", error=str(e), url=url)
        raise RuntimeError(f"YouTube download failed: {str(e)}")


# ---------------------------
# FILE UPLOAD (LOCAL SAVE)
# ---------------------------
def save_uploaded_video(file_content: bytes, filename: str, job_id: str) -> Dict[str, Any]:
    work_dir = _get_work_dir(job_id)

    dest = work_dir / filename
    dest.write_bytes(file_content)

    logger.info("video.upload_saved", path=str(dest))

    return {
        "local_path": str(dest),
        "title": filename,
        "duration_seconds": 0,
    }


# ---------------------------
# CLEANUP
# ---------------------------
def cleanup_job_files(job_id: str):
    work_dir = Path(settings.TEMP_DIR) / job_id

    if work_dir.exists():
        shutil.rmtree(work_dir, ignore_errors=True)
        logger.info("video.cleanup_done", job_id=job_id)