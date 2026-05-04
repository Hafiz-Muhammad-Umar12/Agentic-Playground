from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from celery.result import AsyncResult
from fastapi.responses import FileResponse
from pathlib import Path

from backend.db.database import get_db
from backend.db.models import Project, User
from backend.db.schemas import ProjectResponse, StartupRequest, TaskStatusResponse
from backend.tasks.pipeline_task import run_pipeline_async
from backend.workers.celery_worker import celery_app
from backend.core.config import settings

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/generate", response_model=dict)
async def generate_startup(
    request: StartupRequest, 
    user_id: int = Header(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger the multi-agent pipeline asynchronously.
    """
    # Verify user exists
    user_result = await db.execute(select(User).where(User.id == user_id))
    if not user_result.scalars().first():
        raise HTTPException(status_code=404, detail="User not found")

    try:
        task = run_pipeline_async.delay(request.concept, user_id)
        return {"task_id": task.id, "status": "PENDING"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    Check the status of a background task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    response = {"task_id": task_id, "status": task_result.status}
    
    if task_result.ready():
        if task_result.successful():
            response["result"] = task_result.result
        else:
            response["error"] = str(task_result.result)
    return response

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(user_id: int = Header(...), db: AsyncSession = Depends(get_db)):
    """
    List all generated startup projects for the current user.
    """
    result = await db.execute(
        select(Project)
        .where(Project.owner_id == user_id)
        .order_by(Project.created_at.desc())
    )
    return result.scalars().all()

@router.get("/download/{project_id}")
async def download_project(project_id: int, user_id: int = Header(...), db: AsyncSession = Depends(get_db)):
    """
    Download the generated project as a ZIP file.
    """
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    project = result.scalars().first()
    if not project or not project.zip_path:
        raise HTTPException(status_code=404, detail="Project or archive not found")
    
    path = Path(project.zip_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing on server")
    
    return FileResponse(path=path, filename=f"project_{project_id}.zip", media_type="application/zip")
