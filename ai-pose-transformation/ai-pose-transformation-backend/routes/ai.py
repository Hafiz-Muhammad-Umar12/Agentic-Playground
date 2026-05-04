from fastapi import APIRouter
from services.ai_service import ai_service

router = APIRouter()

@router.post("/suggest")
def suggest():
    return {"suggestion": "Try Warrior Pose"}