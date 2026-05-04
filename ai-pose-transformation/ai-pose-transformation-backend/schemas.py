from pydantic import BaseModel
from typing import List


# 👤 USER SCHEMAS
class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


# 🧍 POSE SCHEMAS
class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float


class PoseRequest(BaseModel):
    landmarks: List[LandmarkPoint]


class PoseResponse(BaseModel):
    status: str
    score: float
    suggestion: str