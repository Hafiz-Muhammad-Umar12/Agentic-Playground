from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, device, location
from app.db.session import engine, Base
from app.core.websocket import router as ws_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GhostTrack API",
    description="Anti-Theft Real-Time Device Tracking System",
    version="1.0.0"
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production me specific origins lagao
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,     prefix="/auth",     tags=["Authentication"])
app.include_router(device.router,   prefix="/device",   tags=["Device"])
app.include_router(location.router, prefix="/location", tags=["Location"])
app.include_router(ws_router,                           tags=["WebSocket"])

@app.get("/")
def root():
    return {"message": "GhostTrack API is running 🚀"}
