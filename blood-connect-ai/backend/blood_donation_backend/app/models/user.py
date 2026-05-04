from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class BloodGroup(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class UserRole(str, enum.Enum):
    DONOR = "donor"
    RECEIVER = "receiver"
    BOTH = "both"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    blood_group = Column(Enum(BloodGroup), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.BOTH)

    city = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)  # donor availability toggle
    last_donation_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    blood_requests = relationship("BloodRequest", back_populates="requester", foreign_keys="BloodRequest.requester_id")
    donations = relationship("Donation", back_populates="donor", foreign_keys="Donation.donor_id")
    notifications = relationship("Notification", back_populates="user")
