from fastapi import APIRouter, HTTPException, Depends
from app.schemas.requests import ChatRequest
from app.schemas.responses import ChatResponse
from app.services.orchestrator import handle_chat_session
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(data: ChatRequest):
    """
    Main entry point for chat interactions.
    """
    try:
        result = await handle_chat_session(
            user_message=data.message,
            session_id=data.session_id,
            user_id=data.user_id
        )
        return ChatResponse(**result)
    except Exception as e:
        logger.error(f"Endpoint Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
