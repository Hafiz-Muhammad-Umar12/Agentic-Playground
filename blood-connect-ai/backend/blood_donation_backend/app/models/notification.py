from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class NotificationType(str, enum.Enum):
    NEW_REQUEST = "new_request"
    REQUEST_ACCEPTED = "request_accepted"
    DONATION_CONFIRMED = "donation_confirmed"
    DONATION_COMPLETED = "donation_completed"
    REQUEST_FULFILLED = "request_fulfilled"
    REQUEST_EXPIRED = "request_expired"
    GENERAL = "general"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.GENERAL)

    is_read = Column(Boolean, default=False)
    related_request_id = Column(Integer, ForeignKey("blood_requests.id"), nullable=True)
    related_donation_id = Column(Integer, ForeignKey("donations.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")
