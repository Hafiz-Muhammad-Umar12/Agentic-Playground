from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ───────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str


# ─── Device ─────────────────────────────────────────────────────────────────

class DeviceRegisterRequest(BaseModel):
    device_id: str
    device_name: Optional[str] = None
    model: Optional[str] = None
    os_version: Optional[str] = None

class DeviceResponse(BaseModel):
    id: int
    device_id: str
    device_name: Optional[str]
    model: Optional[str]
    os_version: Optional[str]
    status: str
    is_tracking: bool
    registered_at: datetime
    last_seen_at: Optional[datetime]

    class Config:
        from_attributes = True

class DeviceStatusUpdate(BaseModel):
    status: str           # online | offline | fake_shutdown
    is_tracking: bool


# ─── Location ───────────────────────────────────────────────────────────────

class LocationUpdate(BaseModel):
    device_id: str
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    battery_level: Optional[int] = None
    is_aggressive: Optional[bool] = False
    event_type: Optional[str] = "update"  # update | boot | shutdown | fake_shutdown

class LocationResponse(BaseModel):
    id: int
    device_id: str
    latitude: float
    longitude: float
    altitude: Optional[float]
    accuracy: Optional[float]
    speed: Optional[float]
    battery_level: Optional[int]
    is_aggressive: bool
    event_type: str
    timestamp: datetime

    class Config:
        from_attributes = True

class LocationHistory(BaseModel):
    device_id: str
    total: int
    locations: List[LocationResponse]
