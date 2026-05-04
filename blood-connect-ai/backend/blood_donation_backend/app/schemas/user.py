from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from app.models.user import BloodGroup, UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    blood_group: BloodGroup
    role: UserRole = UserRole.BOTH
    city: Optional[str] = None
    address: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if not v.replace("+", "").replace("-", "").isdigit():
            raise ValueError("Invalid phone number")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    is_available: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_donation_date: Optional[datetime] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    blood_group: BloodGroup
    role: UserRole
    city: Optional[str]
    address: Optional[str]
    is_active: bool
    is_available: bool
    last_donation_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str
