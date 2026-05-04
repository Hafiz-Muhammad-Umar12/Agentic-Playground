from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserRegister, UserLogin
from models.user import User

router = APIRouter(prefix="/user", tags=["User"])


# 👤 REGISTER
@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):

    # check if user exists (optional but professional)
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {"error": "User already exists"}

    new_user = User(
        email=user.email,
        password=user.password  # (later hash karna)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "email": new_user.email
    }


# 🔐 LOGIN
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        return {"error": "User not found"}

    if db_user.password != user.password:
        return {"error": "Incorrect password"}

    # later: JWT token generate karna
    return {
        "message": "Login successful",
        "token": "jwt-token-placeholder"
    }