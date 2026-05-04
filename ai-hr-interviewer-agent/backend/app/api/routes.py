from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    StartInterviewRequest, 
    InterviewResponse, 
    AnswerRequest, 
    SubmitAnswerResponse
)
from app.services.interview_service import InterviewService

router = APIRouter()
interview_service = InterviewService()

@router.get("/start-interview/test")
async def test_start_interview():
    """Test endpoint for browser verification of start-interview."""
    return {
        "success": True,
        "message": "API is working. Use POST /api/start-interview to start interview."
    }

@router.post("/start-interview", response_model=InterviewResponse)
async def start_interview(request: StartInterviewRequest):
    """
    Initializes an interview session for the given topic.
    """
    result = interview_service.start_interview(request.topic)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("message"))
    return result

@router.get("/submit-answer/test")
async def test_submit_answer():
    """Test endpoint for browser verification of submit-answer."""
    return {
        "success": True,
        "message": "API is working. Use POST /api/submit-answer to submit your answer."
    }

@router.post("/submit-answer", response_model=SubmitAnswerResponse)
async def submit_answer(request: AnswerRequest):
    """
    Submits a candidate's answer for evaluation and retrieves next steps.
    """
    result = interview_service.process_answer(
        session_id=request.session_id,
        question=request.question,
        answer=request.answer,
        topic=request.topic
    )
    if not result.get("success"):
        # Handle specific cases like invalid session ID
        status_code = 404 if result.get("message") == "Invalid session ID" else 500
        raise HTTPException(status_code=status_code, detail=result.get("message"))
    return result
