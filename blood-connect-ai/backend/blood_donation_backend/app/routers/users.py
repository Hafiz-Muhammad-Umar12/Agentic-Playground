from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, BloodGroup
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    blood_group: Optional[BloodGroup] = None,
    city: Optional[str] = None,
    is_available: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(User).filter(User.is_active == True)

    if blood_group:
        query = query.filter(User.blood_group == blood_group)
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))
    if is_available is not None:
        query = query.filter(User.is_available == is_available)

    return query.offset(skip).limit(limit).all()


@router.get("/donors", response_model=List[UserResponse])
def get_available_donors(
    blood_group: Optional[BloodGroup] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get list of available donors, optionally filtered by blood group and city"""
    from app.models.user import UserRole

    query = db.query(User).filter(
        User.is_active == True,
        User.is_available == True,
        User.role.in_([UserRole.DONOR, UserRole.BOTH]),
    )

    if blood_group:
        query = query.filter(User.blood_group == blood_group)
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))

    return query.all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/me", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me")
def deactivate_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    current_user.is_active = False
    db.commit()
    return {"message": "Account deactivated successfully"}
