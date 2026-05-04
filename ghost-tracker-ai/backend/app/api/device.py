from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.device import Device
from app.models.user import User
from app.schemas.schemas import DeviceRegisterRequest, DeviceResponse, DeviceStatusUpdate
from app.core.security import get_current_user

router = APIRouter()


@router.post("/register", response_model=DeviceResponse, status_code=201)
def register_device(
    data: DeviceRegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a mobile device to track. Called once after app install."""
    existing = db.query(Device).filter(Device.device_id == data.device_id).first()
    if existing:
        # Already registered — update metadata and return
        existing.device_name = data.device_name or existing.device_name
        existing.model       = data.model       or existing.model
        existing.os_version  = data.os_version  or existing.os_version
        db.commit()
        db.refresh(existing)
        return existing

    device = Device(
        device_id   = data.device_id,
        device_name = data.device_name,
        model       = data.model,
        os_version  = data.os_version,
        owner_id    = current_user.id,
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.get("/my-devices", response_model=List[DeviceResponse])
def get_my_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all devices belonging to the logged-in user."""
    return db.query(Device).filter(Device.owner_id == current_user.id).all()


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific device by its unique device_id string."""
    device = db.query(Device).filter(
        Device.device_id == device_id,
        Device.owner_id  == current_user.id
    ).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.patch("/{device_id}/status", response_model=DeviceResponse)
def update_device_status(
    device_id: str,
    data: DeviceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update device online/offline/fake_shutdown status."""
    device = db.query(Device).filter(
        Device.device_id == device_id,
        Device.owner_id  == current_user.id
    ).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    device.status      = data.status
    device.is_tracking = data.is_tracking
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=204)
def delete_device(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a device from tracking."""
    device = db.query(Device).filter(
        Device.device_id == device_id,
        Device.owner_id  == current_user.id
    ).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
