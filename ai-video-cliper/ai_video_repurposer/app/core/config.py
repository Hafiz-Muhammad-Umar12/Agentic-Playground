"""
Core configuration — all settings loaded from environment variables.
"""
import os
from pathlib import Path
from functools import lru_cache
from typing import List, Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
# Get project root
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # ── App ──────────────────────────────────────────────────
    APP_NAME: str = "AI Video Repurposer PRO"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    API_V1_STR: str = "/api/v1"

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = "mysql+aiomysql://root:password@127.0.0.1:3306/video_repurposer"
    SYNC_DATABASE_URL: str = "mysql+pymysql://root:password@127.0.0.1:3306/video_repurposer"

    # ── Redis / Celery ───────────────────────────────────────
    REDIS_URL: str = "redis://127.0.0.1:6379/0"
    CELERY_BROKER_URL: str = "redis://127.0.0.1:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://127.0.0.1:6379/1"

    # ── AI APIs ──────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # ── Storage ──────────────────────────────────────────────
    STORAGE_PROVIDER: Literal["local", "cloudinary"] = "local"
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ── Publishing ───────────────────────────────────────────
    YOUTUBE_CLIENT_ID: str = ""
    YOUTUBE_CLIENT_SECRET: str = ""
    TIKTOK_APP_ID: str = ""
    TIKTOK_APP_SECRET: str = ""

    # ── Transcription ────────────────────────────────────────
    DEEPGRAM_API_KEY: str = ""

    # ── Feature Flags ────────────────────────────────────────
    ENABLE_PUBLISHING: bool = False
    ENABLE_FACE_TRACKING: bool = False
    MAX_VIDEO_DURATION_MINUTES: int = 120
    MAX_CLIPS_PER_JOB: int = 10

    # ── Computed ─────────────────────────────────────────────
    TEMP_DIR: str = "temp_storage"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # ── Production Hardening ─────────────────────────────────
    FFMPEG_PATH: Optional[str] = None  # Full path to bin folder
    YT_DLP_COOKIES_PATH: Optional[str] = None  # Path to cookies.txt


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
