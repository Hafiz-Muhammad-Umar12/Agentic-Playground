from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class DeviceStatus(str, enum.Enum):
    online        = "online"
    offline       = "offline"
    fake_shutdown = "fake_shutdown"


class Device(Base):
    __tablename__ = "devices"

    id           = Column(Integer, primary_key=True, index=True)
    device_id    = Column(String(100), unique=True, index=True, nullable=False)  # UUID from mobile
    device_name  = Column(String(100), nullable=True)
    model        = Column(String(100), nullable=True)
    os_version   = Column(String(50),  nullable=True)
    status       = Column(String(20),  default=DeviceStatus.offline)
    is_tracking  = Column(Boolean,     default=False)
    owner_id     = Column(Integer,     ForeignKey("users.id"))
    registered_at= Column(DateTime(timezone=True), server_default=func.now())
    last_seen_at = Column(DateTime(timezone=True), nullable=True)

    owner        = relationship("User",     back_populates="devices")
    locations    = relationship("Location", back_populates="device", cascade="all, delete-orphan")
