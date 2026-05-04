from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.logging import setup_logging
from app.core.config import settings

# Initialize logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME if hasattr(settings, "PROJECT_NAME") else "Multi-Agent Research System",
    version=settings.VERSION if hasattr(settings, "VERSION") else "1.0.0",
    description="Multi-Agent Research & Report Generator System"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")


# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "running",
        "message": "Multi-Agent System is Live 🚀",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1/research"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "system": "multi-agent-research-system"
    }   