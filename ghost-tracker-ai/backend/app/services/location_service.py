from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import List, Optional
from app.models.location import Location
from app.models.device import Device
from app.schemas.schemas import LocationUpdate, LocationResponse
from app.core.websocket import manager


async def save_location(db: Session, data: LocationUpdate) -> Location:
    """Save new location to DB and broadcast to all WebSocket listeners."""

    # 1. Persist to DB
    loc = Location(
        device_id     = data.device_id,
        latitude      = data.latitude,
        longitude     = data.longitude,
        altitude      = data.altitude,
        accuracy      = data.accuracy,
        speed         = data.speed,
        battery_level = data.battery_level,
        is_aggressive = data.is_aggressive or False,
        event_type    = data.event_type or "update",
    )
    db.add(loc)

    # 2. Update device status + last_seen
    device = db.query(Device).filter(Device.device_id == data.device_id).first()
    if device:
        device.last_seen_at = datetime.utcnow()
        device.is_tracking  = True
        if data.event_type == "fake_shutdown":
            device.status = "fake_shutdown"
        elif data.event_type in ("shutdown", "offline"):
            device.status = "offline"
        else:
            device.status = "online"

    db.commit()
    db.refresh(loc)

    # 3. Broadcast via WebSocket to dashboard
    await manager.broadcast_to_device(data.device_id, {
        "type"          : "location_update",
        "device_id"     : loc.device_id,
        "latitude"      : loc.latitude,
        "longitude"     : loc.longitude,
        "altitude"      : loc.altitude,
        "accuracy"      : loc.accuracy,
        "speed"         : loc.speed,
        "battery_level" : loc.battery_level,
        "is_aggressive" : loc.is_aggressive,
        "event_type"    : loc.event_type,
        "timestamp"     : loc.timestamp.isoformat(),
    })

    return loc


def get_location_history(
    db: Session,
    device_id: str,
    limit: int = 100,
    offset: int = 0
) -> List[Location]:
    return (
        db.query(Location)
        .filter(Location.device_id == device_id)
        .order_by(desc(Location.timestamp))
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_last_location(db: Session, device_id: str) -> Optional[Location]:
    return (
        db.query(Location)
        .filter(Location.device_id == device_id)
        .order_by(desc(Location.timestamp))
        .first()
    )
