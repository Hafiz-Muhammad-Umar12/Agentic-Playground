"""
Notification Service
Centralized helper to create notifications throughout the app.
"""
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.GENERAL,
    related_request_id: int = None,
    related_donation_id: int = None,
    auto_commit: bool = False,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_request_id=related_request_id,
        related_donation_id=related_donation_id,
    )
    db.add(notif)
    if auto_commit:
        db.commit()
        db.refresh(notif)
    return notif


def notify_matching_donors(db: Session, request, donors: list):
    """Bulk notify donors about a new blood request."""
    for donor in donors:
        create_notification(
            db=db,
            user_id=donor.id,
            title=f"🩸 New Blood Request — {request.blood_group.value}",
            message=(
                f"Urgent: {request.blood_group.value} blood needed at "
                f"{request.hospital_name}, {request.city}. "
                f"Urgency: {request.urgency.value.upper()}"
            ),
            notification_type=NotificationType.NEW_REQUEST,
            related_request_id=request.id,
        )
