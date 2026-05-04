"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator, ConfigDict, Field, computed_field


# ─────────────────────────────
# Request Schemas
# ─────────────────────────────

class RepurposeRequest(BaseModel):
    youtube_url: Optional[str] = None
    platforms: List[str] = ["tiktok", "reels", "youtube_shorts"]
    language: str = "en"
    max_clips: int = 10
    translate_subtitles_to: Optional[str] = None

    @field_validator("max_clips")
    @classmethod
    def clamp_max_clips(cls, v):
        return max(1, min(v, 20))

    @field_validator("platforms")
    @classmethod
    def validate_platforms(cls, v):
        valid = {"tiktok", "reels", "youtube_shorts"}
        return [p for p in v if p in valid] or ["tiktok"]


class PublishRequest(BaseModel):
    job_id: str
    youtube_token: Optional[str] = None
    tiktok_token: Optional[str] = None


# ─────────────────────────────
# Response Schemas
# ─────────────────────────────

class ClipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    start_time: float
    end_time: float
    duration: float
    platform: Optional[str] = None
    viral_score: Optional[float] = None
    hook_text: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[List[str]] = None
    seo_title: Optional[str] = None
    moment_type: Optional[str] = None
    insight_reason: Optional[str] = None
    storage_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    published_url: Optional[str] = None
    transcript_segment: Optional[str] = None
    created_at: datetime


# ─────────────────────────────
# Job Status (SINGLE CLEAN VERSION)
# ─────────────────────────────

class JobStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    job_id: str = Field(validation_alias="id")
    status: str
    progress: int
    video_title: Optional[str] = None
    duration_seconds: Optional[float] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


# ─────────────────────────────
# Job Results (MISSING FIX)
# ─────────────────────────────

class JobResultsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    job_id: str = Field(validation_alias="id")
    status: str
    video_title: Optional[str] = None
    duration_seconds: Optional[float] = None
    clips: List[ClipResponse]

    @computed_field
    @property
    def total_clips(self) -> int:
        return len(self.clips)


# ─────────────────────────────
# Other Responses
# ─────────────────────────────

class SubmitJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    job_id: str = Field(validation_alias="id")
    message: str
    status: str


class DownloadUrlResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    clip_id: str = Field(validation_alias="id")
    download_url: str
    expires_in_seconds: int