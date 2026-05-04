from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.device import Device
from app.models.user import User
from app.schemas.schemas import LocationUpdate, LocationResponse, LocationHistory
from app.services.location_service import save_location, get_location_history, get_last_location
from app.core.security import get_current_user

router = APIRouter()


@router.post("/update", response_model=LocationResponse, status_code=201)
async def update_location(
    data: LocationUpdate,
    db: Session = Depends(get_db)
):
    """
    Mobile app calls this every few seconds to push GPS coordinates.
    No auth required here so the background service can post freely.
    (Add device token auth in production for extra security.)
    """
    # Verify device exists
    device = db.query(Device).filter(Device.device_id == data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")

    loc = await save_location(db, data)
    return loc


@router.post("/shutdown", response_model=LocationResponse)
async def report_shutdown(
    data: LocationUpdate,
    db: Session = Depends(get_db)
):
    """
    Called by ShutdownReceiver — saves last location before phone powers off.
    Sets event_type = 'shutdown'.
    """
    device = db.query(Device).filter(Device.device_id == data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")

    data.event_type = "shutdown"
    loc = await save_location(db, data)
    return loc


@router.post("/boot", response_model=LocationResponse)
async def report_boot(
    data: LocationUpdate,
    db: Session = Depends(get_db)
):
    """
    Called by BootReceiver when phone restarts.
    Sets event_type = 'boot'.
    """
    device = db.query(Device).filter(Device.device_id == data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")

    data.event_type = "boot"
    loc = await save_location(db, data)
    return loc


@router.get("/last/{device_id}", response_model=LocationResponse)
def last_location(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the last known location of a device."""
    loc = get_last_location(db, device_id)
    if not loc:
        raise HTTPException(status_code=404, detail="No location data found")
    return loc


@router.get("/history/{device_id}", response_model=LocationHistory)
def location_history(
    device_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated location history for a device."""
    locs = get_location_history(db, device_id, limit=limit, offset=offset)
    return LocationHistory(
        device_id = device_id,
        total     = len(locs),
        locations = locs,
    )
