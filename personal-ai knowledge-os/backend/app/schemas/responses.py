from pydantic import BaseModel
from typing import Optional

class ChatResponse(BaseModel):
    intent: str
    answer: str
    context_used: bool
    error: Optional[str] = None
