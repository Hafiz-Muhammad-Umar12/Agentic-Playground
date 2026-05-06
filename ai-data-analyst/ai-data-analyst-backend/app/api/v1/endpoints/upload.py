from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def upload_file():
    return {"message": "File upload endpoint"}
