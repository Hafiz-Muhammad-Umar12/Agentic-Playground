from fastapi import APIRouter, HTTPException
from app.schemas.requests import IngestRequest
from app.memory.vector_store import store_memory
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/")
async def ingest_data(data: IngestRequest, session_id: str, user_id: str):
    """
    Ingest text data into the Knowledge OS with session/user context.
    """
    try:
        await store_memory(data.text, session_id, user_id)
        return {"status": "success", "message": "Data ingested successfully"}
    except Exception as e:
        logger.error(f"Ingest Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
