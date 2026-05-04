from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.session import get_db
from db.models import Agent, AgentRun, AgentStatus
from services.agent_service import AgentService
import uuid

router = APIRouter()


class RunRequest(BaseModel):
    input: str
    stream: bool = False


class RunResponse(BaseModel):
    run_id:    str
    agent_id:  str
    output:    str
    tool_calls: int
    latency_ms: int
    status:    str


@router.post("/run/{agent_id}", response_model=RunResponse)
async def run_agent(
    agent_id: str,
    req: RunRequest,
    db: AsyncSession = Depends(get_db),
):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.status == AgentStatus.error:
        raise HTTPException(status_code=400, detail="Agent is in error state")

    run_id = str(uuid.uuid4())

    # Create run record
    run = AgentRun(
        id=run_id,
        agent_id=agent_id,
        input_text=req.input,
        status="running",
    )
    db.add(run)
    await db.commit()

    # Execute
    result = await AgentService().execute(
        agent={
            "id": agent.id,
            "name": agent.name,
            "model": agent.model,
            "framework": str(agent.framework),
            "config": agent.config or {},
        },
        input_text=req.input,
        run_id=run_id,
        db=db,
    )

    return RunResponse(
        run_id=run_id,
        agent_id=agent_id,
        output=result["output"],
        tool_calls=result["tool_calls"],
        latency_ms=result["latency_ms"],
        status="done",
    )


@router.get("/runs/{agent_id}")
async def list_runs(agent_id: str, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentRun)
        .where(AgentRun.agent_id == agent_id)
        .order_by(AgentRun.created_at.desc())
        .limit(limit)
    )
    runs = result.scalars().all()
    return [
        {
            "id": r.id, "status": r.status, "input": r.input_text[:100],
            "output": (r.output_text or "")[:200], "tool_calls": r.tool_calls,
            "latency_ms": r.latency_ms, "created_at": r.created_at,
        }
        for r in runs
    ]


@router.get("/runs/detail/{run_id}")
async def get_run(run_id: str, db: AsyncSession = Depends(get_db)):
    run = await db.get(AgentRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run