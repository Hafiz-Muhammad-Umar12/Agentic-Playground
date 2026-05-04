from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Agent Output Schemas
class AgentOutputBase(BaseModel):
    agent_type: str
    content: str

class AgentOutputResponse(AgentOutputBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    input_concept: str

class ProjectCreate(ProjectBase):
    pass

class StartupRequest(BaseModel):
    concept: str

class ProjectResponse(ProjectBase):
    id: int
    owner_id: Optional[int]
    zip_path: Optional[str]
    created_at: datetime
    agent_outputs: List[AgentOutputResponse] = []

    class Config:
        from_attributes = True

# Task Schemas
class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None
