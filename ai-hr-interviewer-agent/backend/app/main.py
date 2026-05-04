import time
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import router as api_router
from app.utils.helpers import setup_logging

# ---------------------------
# Logging Setup
# ---------------------------
setup_logging()
logger = logging.getLogger(__name__)

# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(
    title="AI HR Interviewer Agent",
    version="1.0.0"
)

# ---------------------------
# Middleware: CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Middleware: Request Logger
# ---------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        f"Method: {request.method} | "
        f"Path: {request.url.path} | "
        f"Status: {response.status_code} | "
        f"Duration: {duration:.2f}s"
    )
    return response

# ---------------------------
# Exception Handlers
# ---------------------------

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation Error",
            "detail": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
            "detail": str(exc)
        }
    )

# ---------------------------
# Routes
# ---------------------------
app.include_router(api_router, prefix="/api")

# ---------------------------
# Health Check
# ---------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "success": True,
        "service": "AI HR Interviewer Agent"
    }