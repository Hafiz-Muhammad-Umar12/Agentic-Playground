"""
AI Video Repurposer PRO — FastAPI Application Entry Point
"""
import os
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import create_tables
from app.api.routes import repurpose, auth

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # Ensure temp directory exists
    os.makedirs(settings.TEMP_DIR, exist_ok=True)

    # Create DB tables (use Alembic for production migrations)
    await create_tables()
    logger.info("app.startup", env=settings.APP_ENV)

    yield

    logger.info("app.shutdown")


app = FastAPI(
    title="AI Video Repurposer PRO",
    description=(
        "Turn 1 long video into 10+ viral short-form contents automatically. "
        "Powered by Claude AI + Whisper + FFmpeg."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routers ──────────────────────────────────────────────────
app.include_router(repurpose.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)


# ── Health Check ─────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return JSONResponse({"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"})


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "AI Video Repurposer PRO API",
        "docs": "/docs",
        "health": "/health",
    }


# ── Global Exception Handler ──────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error("unhandled_exception", error=str(exc), path=str(request.url))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )
