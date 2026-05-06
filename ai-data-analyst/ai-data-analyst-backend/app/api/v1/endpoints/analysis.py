from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def start_analysis():
    return {"message": "Analysis started"}
