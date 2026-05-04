from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.user import BloodGroup
from app.models.blood_request import UrgencyLevel, RequestStatus
from app.schemas.user import UserResponse


class BloodRequestCreate(BaseModel):
    patient_name: str
    blood_group: BloodGroup
    units_needed: int = 1
    hospital_name: str
    hospital_address: str
    city: str
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM
    description: Optional[str] = None
    contact_number: str
    required_by: Optional[datetime] = None


class BloodRequestUpdate(BaseModel):
    patient_name: Optional[str] = None
    units_needed: Optional[int] = None
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    urgency: Optional[UrgencyLevel] = None
    description: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[RequestStatus] = None
    required_by: Optional[datetime] = None


class BloodRequestResponse(BaseModel):
    id: int
    requester_id: int
    patient_name: str
    blood_group: BloodGroup
    units_needed: int
    units_fulfilled: int
    hospital_name: str
    hospital_address: str
    city: str
    urgency: UrgencyLevel
    status: RequestStatus
    description: Optional[str]
    contact_number: str
    required_by: Optional[datetime]
    created_at: datetime
    requester: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class BloodRequestFilter(BaseModel):
    blood_group: Optional[BloodGroup] = None
    city: Optional[str] = None
    urgency: Optional[UrgencyLevel] = None
    status: Optional[RequestStatus] = RequestStatus.OPEN
