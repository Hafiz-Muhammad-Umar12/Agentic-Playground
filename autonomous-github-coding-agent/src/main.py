import uvicorn
import logging

from fastapi import FastAPI
from src.api.routes import router

# Optional: if you use CORS (recommended for dashboard/frontend)
from fastapi.middleware.cors import CORSMiddleware


# ---------------------------
# Logging Setup
# ---------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

logger = logging.getLogger("github-pr-agent")


# ---------------------------
# App Initialization
# ---------------------------
app = FastAPI(
    title="Autonomous GitHub PR Fix Agent",
    description="AI-powered system that analyzes and fixes GitHub Pull Requests automatically using AI + queue system.",
    version="0.1.0"
)


# ---------------------------
# CORS (optional but useful)
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------
# Include API Routes
# ---------------------------
app.include_router(router, prefix="/api")


# ---------------------------
# Root Endpoint
# ---------------------------
@app.get("/")
def root():
    return {
        "status": "running",
        "service": "GitHub PR Fix Agent",
        "version": "0.1.0"
    }


# ---------------------------
# Health Check
# ---------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------
# Startup Event
# ---------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 GitHub PR Fix Agent starting up...")


# ---------------------------
# Shutdown Event
# ---------------------------
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 GitHub PR Fix Agent shutting down...")


# ---------------------------
# Entry Point
# ---------------------------
if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,   # dev mode only
        log_level="info"
    )