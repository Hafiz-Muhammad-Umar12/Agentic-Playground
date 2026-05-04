from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, BloodGroup
from app.schemas.user import UserResponse
from app.services.matching import find_matching_donors, get_compatibility_info

router = APIRouter(prefix="/matching", tags=["Donor Matching"])


@router.get("/donors", response_model=list[UserResponse])
def match_donors(
    blood_group: BloodGroup,
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Find all compatible available donors for a given blood group.
    Uses blood compatibility rules (e.g., O- can donate to all).
    """
    donors = find_matching_donors(
        db=db,
        blood_group=blood_group,
        city=city,
        exclude_user_id=current_user.id,
    )
    return donors


@router.get("/compatibility/{blood_group}")
def check_compatibility(blood_group: BloodGroup):
    """Get which blood groups are compatible with the requested group."""
    return get_compatibility_info(blood_group)
