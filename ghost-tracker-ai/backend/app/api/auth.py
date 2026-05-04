from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.schemas import SignupRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    """Register new user account."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name     = data.name,
        email    = data.email,
        password = hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login with email + password."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name)


@router.get("/me")
def get_me(db: Session = Depends(get_db), current_user: User = Depends(lambda: None)):
    """Get current logged-in user info (use with Authorization header)."""
    from app.core.security import get_current_user
    # Import here to avoid circular; proper DI below
    pass

# Proper /me with auth
from fastapi import Depends as _Depends
from app.core.security import get_current_user as _get_current_user

@router.get("/me/profile")
def profile(user: User = _Depends(_get_current_user)):
    return {
        "id"        : user.id,
        "name"      : user.name,
        "email"     : user.email,
        "is_active" : user.is_active,
        "joined"    : user.created_at.isoformat(),
    }
