from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(title="AI Data Analyst API")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Data Analyst API"}
