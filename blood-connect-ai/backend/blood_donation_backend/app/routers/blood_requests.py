from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, BloodGroup
from app.models.blood_request import BloodRequest, RequestStatus, UrgencyLevel
from app.models.notification import Notification, NotificationType
from app.schemas.blood_request import (
    BloodRequestCreate, BloodRequestUpdate, BloodRequestResponse
)

router = APIRouter(prefix="/requests", tags=["Blood Requests"])


def create_notification(db: Session, user_id: int, title: str, message: str,
                         notif_type: NotificationType, request_id: int = None):
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notif_type,
        related_request_id=request_id,
    )
    db.add(notif)


@router.post("/", response_model=BloodRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    data: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    request = BloodRequest(
        requester_id=current_user.id,
        **data.model_dump()
    )
    db.add(request)
    db.flush()  # get id before commit

    # Notify matching available donors
    from app.models.user import UserRole
    matching_donors = db.query(User).filter(
        User.blood_group == data.blood_group,
        User.is_available == True,
        User.is_active == True,
        User.id != current_user.id,
        User.role.in_([UserRole.DONOR, UserRole.BOTH]),
    ).all()

    for donor in matching_donors:
        create_notification(
            db, donor.id,
            title=f"🩸 New Blood Request - {data.blood_group}",
            message=f"Urgent request for {data.blood_group} blood at {data.hospital_name}, {data.city}",
            notif_type=NotificationType.NEW_REQUEST,
            request_id=request.id,
        )

    db.commit()
    db.refresh(request)
    return request


@router.get("/", response_model=List[BloodRequestResponse])
def get_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    blood_group: Optional[BloodGroup] = None,
    city: Optional[str] = None,
    urgency: Optional[UrgencyLevel] = None,
    status: Optional[RequestStatus] = RequestStatus.OPEN,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(BloodRequest).options(joinedload(BloodRequest.requester))

    if blood_group:
        query = query.filter(BloodRequest.blood_group == blood_group)
    if city:
        query = query.filter(BloodRequest.city.ilike(f"%{city}%"))
    if urgency:
        query = query.filter(BloodRequest.urgency == urgency)
    if status:
        query = query.filter(BloodRequest.status == status)

    return query.order_by(BloodRequest.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/my", response_model=List[BloodRequestResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return (
        db.query(BloodRequest)
        .filter(BloodRequest.requester_id == current_user.id)
        .order_by(BloodRequest.created_at.desc())
        .all()
    )


@router.get("/{request_id}", response_model=BloodRequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    req = (
        db.query(BloodRequest)
        .options(joinedload(BloodRequest.requester))
        .filter(BloodRequest.id == request_id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Blood request not found")
    return req


@router.patch("/{request_id}", response_model=BloodRequestResponse)
def update_request(
    request_id: int,
    update_data: BloodRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Blood request not found")
    if req.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(req, field, value)

    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}")
def cancel_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Blood request not found")
    if req.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    req.status = RequestStatus.CANCELLED
    db.commit()
    return {"message": "Request cancelled successfully"}
