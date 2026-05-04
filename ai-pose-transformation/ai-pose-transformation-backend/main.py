from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import user, pose, ai, websocket
from database import Base, engine

# 👇 IMPORTANT: DB create on startup (not import time)
def create_tables():
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Pose Transformation API",
    version="1.0.0"
)

# ✅ CORS FIX (VERY IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later restrict kar sakte ho
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚀 Routes
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(pose.router, prefix="/pose", tags=["Pose"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])


# 👇 startup event (FIX for DB issues)
@app.on_event("startup")
def on_startup():
    create_tables()


# Home route
@app.get("/")
def home():
    return {"message": "AI Pose Backend Running 🚀"}