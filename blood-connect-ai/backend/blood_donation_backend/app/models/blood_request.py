from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.user import BloodGroup
import enum


class UrgencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RequestStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    patient_name = Column(String(100), nullable=False)
    blood_group = Column(Enum(BloodGroup), nullable=False)
    units_needed = Column(Integer, default=1)
    units_fulfilled = Column(Integer, default=0)

    hospital_name = Column(String(200), nullable=False)
    hospital_address = Column(String(300), nullable=False)
    city = Column(String(100), nullable=False)

    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    status = Column(Enum(RequestStatus), default=RequestStatus.OPEN)

    description = Column(Text, nullable=True)
    contact_number = Column(String(20), nullable=False)

    required_by = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    requester = relationship("User", back_populates="blood_requests", foreign_keys=[requester_id])
    donations = relationship("Donation", back_populates="blood_request")
