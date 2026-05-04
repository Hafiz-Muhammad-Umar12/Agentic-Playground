from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api import deploy, run, logs
from db.session import init_db
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="AgentForge API",
    description="AI Agent Deployment Platform — deploy, run and manage AI agents",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deploy.router, prefix="/api/v1", tags=["deploy"])
app.include_router(run.router,    prefix="/api/v1", tags=["run"])
app.include_router(logs.router,   prefix="/api/v1", tags=["logs"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "AgentForge"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)