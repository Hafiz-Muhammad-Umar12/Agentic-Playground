from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., example="How do I use this system?")
    session_id: str = Field(..., example="session-123")
    user_id: str = Field(..., example="user-456")

class IngestRequest(BaseModel):
    text: str
    metadata: dict = {}
