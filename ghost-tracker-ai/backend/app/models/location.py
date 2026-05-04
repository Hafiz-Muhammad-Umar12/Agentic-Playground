from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Location(Base):
    __tablename__ = "locations"

    id             = Column(Integer, primary_key=True, index=True)
    device_id      = Column(String(100), ForeignKey("devices.device_id"), nullable=False, index=True)
    latitude       = Column(Float, nullable=False)
    longitude      = Column(Float, nullable=False)
    altitude       = Column(Float, nullable=True)
    accuracy       = Column(Float, nullable=True)   # meters
    speed          = Column(Float, nullable=True)   # m/s
    battery_level  = Column(Integer, nullable=True) # 0-100
    is_aggressive  = Column(Boolean, default=False) # fake shutdown mode
    event_type     = Column(String(30), default="update")  # update | boot | shutdown | fake_shutdown
    timestamp      = Column(DateTime(timezone=True), server_default=func.now())

    device         = relationship("Device", back_populates="locations")
