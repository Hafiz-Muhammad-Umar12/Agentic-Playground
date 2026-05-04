from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid

class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None

class StartInterviewRequest(BaseModel):
    topic: str = Field(..., json_schema_extra={"example": "Python Backend Development"})

class InterviewQuestion(BaseModel):
    level: str
    question: str

class InterviewResponse(BaseResponse):
    session_id: str
    questions: List[InterviewQuestion]
    status: str

class AnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str
    topic: str

class EvaluationData(BaseModel):
    score: Dict[str, Any]
    feedback: Dict[str, Any]

class SubmitAnswerResponse(BaseResponse):
    evaluation: EvaluationData
    followups: List[str]
    next_question: Optional[str] = ""
    next_action: str

class ErrorResponse(BaseResponse):
    success: bool = False
    detail: Any
