from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import Base, engine

import app.models.user
import app.models.blood_request
import app.models.donation
import app.models.notification

from app.routers import auth, users, blood_requests, donations, notifications, matching


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database connected & tables created successfully")
    except Exception as e:
        print("❌ DB Error:", e)
        raise e

    yield


app = FastAPI(
    title="Blood Donation Platform API",
    description="A real-time blood donor-receiver connection platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── API ROUTES ──────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router,           prefix=API_PREFIX)
app.include_router(users.router,          prefix=API_PREFIX)
app.include_router(blood_requests.router, prefix=API_PREFIX)
app.include_router(donations.router,      prefix=API_PREFIX)
app.include_router(notifications.router,  prefix=API_PREFIX)
app.include_router(matching.router,       prefix=API_PREFIX)


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Blood Donation Platform API is running 🩸"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}