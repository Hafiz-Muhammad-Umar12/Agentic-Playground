from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.blood_request import BloodRequest, RequestStatus
from app.models.donation import Donation, DonationStatus
from app.models.notification import Notification, NotificationType
from app.schemas.donation import DonationCreate, DonationUpdate, DonationResponse

router = APIRouter(prefix="/donations", tags=["Donations"])


def notify(db, user_id, title, message, notif_type, request_id=None, donation_id=None):
    db.add(Notification(
        user_id=user_id, title=title, message=message,
        notification_type=notif_type,
        related_request_id=request_id,
        related_donation_id=donation_id,
    ))


@router.post("/", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
def accept_donation_request(
    data: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Donor accepts a blood request"""
    req = db.query(BloodRequest).filter(BloodRequest.id == data.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Blood request not found")
    if req.status != RequestStatus.OPEN:
        raise HTTPException(status_code=400, detail="This request is no longer open")
    if req.requester_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot donate for your own request")

    # Check if donor already accepted this request
    existing = db.query(Donation).filter(
        Donation.donor_id == current_user.id,
        Donation.request_id == data.request_id,
        Donation.status.in_([DonationStatus.PENDING, DonationStatus.CONFIRMED])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already accepted this request")

    donation = Donation(
        donor_id=current_user.id,
        request_id=data.request_id,
        units_donated=data.units_donated,
        scheduled_date=data.scheduled_date,
        notes=data.notes,
    )
    db.add(donation)

    # Update request status
    req.status = RequestStatus.IN_PROGRESS
    db.flush()

    # Notify the requester
    notify(
        db, req.requester_id,
        title="✅ Donor Found!",
        message=f"{current_user.full_name} ({current_user.blood_group}) has accepted your blood request.",
        notif_type=NotificationType.REQUEST_ACCEPTED,
        request_id=req.id,
        donation_id=donation.id,
    )

    db.commit()
    db.refresh(donation)
    return donation


@router.get("/my", response_model=List[DonationResponse])
def get_my_donations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return (
        db.query(Donation)
        .filter(Donation.donor_id == current_user.id)
        .order_by(Donation.created_at.desc())
        .all()
    )


@router.get("/request/{request_id}", response_model=List[DonationResponse])
def get_donations_for_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(Donation).filter(Donation.request_id == request_id).all()


@router.patch("/{donation_id}", response_model=DonationResponse)
def update_donation_status(
    donation_id: int,
    update_data: DonationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    req = db.query(BloodRequest).filter(BloodRequest.id == donation.request_id).first()

    # Only donor or requester can update
    if donation.donor_id != current_user.id and req.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(donation, field, value)

    # If marked completed, update request units fulfilled
    if update_data.status == DonationStatus.COMPLETED:
        donation.donated_at = datetime.utcnow()
        req.units_fulfilled += donation.units_donated

        if req.units_fulfilled >= req.units_needed:
            req.status = RequestStatus.FULFILLED
            notify(db, req.requester_id,
                   title="🎉 Request Fulfilled!",
                   message="Your blood request has been fully fulfilled.",
                   notif_type=NotificationType.REQUEST_FULFILLED,
                   request_id=req.id)

        notify(db, donation.donor_id,
               title="✅ Donation Completed",
               message="Thank you for your donation! You may have saved a life.",
               notif_type=NotificationType.DONATION_COMPLETED,
               donation_id=donation.id)

    db.commit()
    db.refresh(donation)
    return donation
