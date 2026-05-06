from fastapi import APIRouter
from app.api.v1.endpoints import upload, analysis, report

api_router = APIRouter()
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(report.router, prefix="/report", tags=["report"])
