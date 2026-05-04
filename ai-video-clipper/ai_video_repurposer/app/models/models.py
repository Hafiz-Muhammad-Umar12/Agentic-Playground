"""
SQLAlchemy ORM models — Job, Clip, User.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import (
    Boolean, DateTime, Float, ForeignKey,
    Integer, String, Text, JSON, Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    DOWNLOADING = "downloading"
    TRANSCRIBING = "transcribing"
    ANALYZING = "analyzing"
    CLIPPING = "clipping"
    CAPTIONING = "captioning"
    UPLOADING = "uploading"
    COMPLETED = "completed"
    FAILED = "failed"


class Platform(str, enum.Enum):
    TIKTOK = "tiktok"
    REELS = "reels"
    YOUTUBE_SHORTS = "youtube_shorts"


# ─── User ────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="user")


# ─── Job ─────────────────────────────────────────────────────
class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True)

    # Input
    youtube_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    original_filename: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    local_video_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # Metadata
    video_title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en")
    platforms: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    max_clips: Mapped[int] = mapped_column(Integer, default=10)

    # Transcript
    transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    transcript_segments: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # Status
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus), default=JobStatus.PENDING
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    progress: Mapped[int] = mapped_column(Integer, default=0)  # 0–100

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations
    user: Mapped[Optional["User"]] = relationship("User", back_populates="jobs")
    clips: Mapped[List["Clip"]] = relationship("Clip", back_populates="job", cascade="all, delete-orphan")


# ─── Clip ────────────────────────────────────────────────────
class Clip(Base):
    __tablename__ = "clips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), nullable=False)

    # Clip metadata
    start_time: Mapped[float] = mapped_column(Float, nullable=False)
    end_time: Mapped[float] = mapped_column(Float, nullable=False)
    duration: Mapped[float] = mapped_column(Float, nullable=False)
    transcript_segment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # AI analysis
    viral_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)   # 0–100
    hook_text: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    moment_type: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)    # emotional/educational/controversial
    insight_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Platform content
    platform: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hashtags: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    seo_title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Files
    local_clip_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    storage_key: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    storage_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)

    # Publishing
    published_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    job: Mapped["Job"] = relationship("Job", back_populates="clips")
