from fastapi import APIRouter
from services.pose_service import pose_engine
from services.ai_service import ai_service

router = APIRouter()

@router.post("/analyze")
def analyze_pose():
    result = {"status": "ok", "score": 75}
    suggestion = ai_service.suggest_next_pose(result)

    return {
        "analysis": result,
        "suggestion": suggestion
    }