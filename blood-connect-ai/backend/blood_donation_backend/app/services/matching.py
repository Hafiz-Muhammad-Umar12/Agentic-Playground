"""
Donor Matching Service
Finds compatible donors based on blood group compatibility rules.
"""
from sqlalchemy.orm import Session
from app.models.user import User, BloodGroup, UserRole
from app.models.blood_request import BloodRequest


# Blood group compatibility map: who can donate TO whom
COMPATIBLE_DONORS = {
    BloodGroup.A_POS:  [BloodGroup.A_POS, BloodGroup.A_NEG, BloodGroup.O_POS, BloodGroup.O_NEG],
    BloodGroup.A_NEG:  [BloodGroup.A_NEG, BloodGroup.O_NEG],
    BloodGroup.B_POS:  [BloodGroup.B_POS, BloodGroup.B_NEG, BloodGroup.O_POS, BloodGroup.O_NEG],
    BloodGroup.B_NEG:  [BloodGroup.B_NEG, BloodGroup.O_NEG],
    BloodGroup.AB_POS: [BloodGroup.A_POS, BloodGroup.A_NEG, BloodGroup.B_POS, BloodGroup.B_NEG,
                        BloodGroup.AB_POS, BloodGroup.AB_NEG, BloodGroup.O_POS, BloodGroup.O_NEG],
    BloodGroup.AB_NEG: [BloodGroup.A_NEG, BloodGroup.B_NEG, BloodGroup.AB_NEG, BloodGroup.O_NEG],
    BloodGroup.O_POS:  [BloodGroup.O_POS, BloodGroup.O_NEG],
    BloodGroup.O_NEG:  [BloodGroup.O_NEG],
}


def find_matching_donors(
    db: Session,
    blood_group: BloodGroup,
    city: str = None,
    exclude_user_id: int = None,
) -> list[User]:
    """
    Find available donors compatible with the requested blood group.
    Uses universal compatibility rules.
    """
    compatible = COMPATIBLE_DONORS.get(blood_group, [blood_group])

    query = db.query(User).filter(
        User.blood_group.in_(compatible),
        User.is_available == True,
        User.is_active == True,
        User.role.in_([UserRole.DONOR, UserRole.BOTH]),
    )

    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))

    if exclude_user_id:
        query = query.filter(User.id != exclude_user_id)

    return query.all()


def get_compatibility_info(blood_group: BloodGroup) -> dict:
    """Return compatibility info for a blood group."""
    return {
        "blood_group": blood_group,
        "can_receive_from": [bg.value for bg in COMPATIBLE_DONORS.get(blood_group, [])],
    }
