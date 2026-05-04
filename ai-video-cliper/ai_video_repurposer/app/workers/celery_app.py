"""
Celery Application Configuration
"""
import os
from celery import Celery
from app.core.config import settings

# 🔥 FORCE FFMPEG (STRONG FIX)
if settings.FFMPEG_PATH:
    ffmpeg_bin = os.path.join(settings.FFMPEG_PATH, "ffmpeg.exe")

    if os.path.exists(ffmpeg_bin):
        os.environ["PATH"] = settings.FFMPEG_PATH + os.pathsep + os.environ.get("PATH", "")
        print("✅ FFmpeg loaded from:", settings.FFMPEG_PATH)
    else:
        print("❌ FFmpeg NOT found at:", ffmpeg_bin)

celery_app = Celery(
    "video_repurposer",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_send_sent_event=True, # Better visibility
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True, # Prevent jobs getting stuck in PENDING on crash
    broker_connection_retry_on_startup=True,
    task_default_retry_delay=300, # 5 mins
    task_max_retries=3,
    task_routes={
        "app.workers.tasks.process_video_job": {"queue": "video"},
        "app.workers.tasks.publish_clips_task": {"queue": "publish"},
    },
)

# Auto-discover tasks from the workers package
celery_app.autodiscover_tasks(["app.workers"])