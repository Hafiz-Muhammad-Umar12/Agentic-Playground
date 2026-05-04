from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.donation import DonationStatus
from app.models.notification import NotificationType


# ─── Donation Schemas ───────────────────────────────────────────────
class DonationCreate(BaseModel):
    request_id: int
    units_donated: int = 1
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None


class DonationUpdate(BaseModel):
    status: Optional[DonationStatus] = None
    units_donated: Optional[int] = None
    scheduled_date: Optional[datetime] = None
    donated_at: Optional[datetime] = None
    notes: Optional[str] = None


class DonationResponse(BaseModel):
    id: int
    donor_id: int
    request_id: int
    status: DonationStatus
    units_donated: int
    scheduled_date: Optional[datetime]
    donated_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Notification Schemas ────────────────────────────────────────────
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool
    related_request_id: Optional[int]
    related_donation_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    notification_ids: list[int]
