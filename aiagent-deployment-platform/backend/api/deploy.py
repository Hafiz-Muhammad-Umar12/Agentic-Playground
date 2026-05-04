from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.session import get_db
from db.models import Agent, AgentStatus, AgentFramework
from services.deploy_service import DeployService
import uuid

router = APIRouter()


class DeployRequest(BaseModel):
    name:       str
    framework:  str = "LangGraph"
    model:      str = "gpt-4o"
    container_size: str = "small"
    config:     dict = {}


class DeployResponse(BaseModel):
    agent_id:  str
    endpoint:  str
    status:    str
    message:   str


@router.post("/deploy", response_model=DeployResponse)
async def deploy_agent(
    req: DeployRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    agent_id = f"agt_{uuid.uuid4().hex[:4]}"
    endpoint = f"/api/v1/run/{agent_id}"

    # Validate framework
    fw_map = {"LangGraph": AgentFramework.langgraph, "CrewAI": AgentFramework.crewai, "Custom": AgentFramework.custom}
    fw = fw_map.get(req.framework, AgentFramework.custom)

    agent = Agent(
        id=agent_id,
        name=req.name,
        framework=fw,
        model=req.model,
        status=AgentStatus.building,
        endpoint=endpoint,
        config={**req.config, "container_size": req.container_size},
    )
    db.add(agent)
    await db.commit()

    # Kick off async build
    background_tasks.add_task(
        DeployService().build_and_deploy, agent_id, {
            "name": req.name, "model": req.model,
            "framework": req.framework, "config": req.config,
        }
    )

    return DeployResponse(
        agent_id=agent_id,
        endpoint=endpoint,
        status="building",
        message=f"Agent '{req.name}' is being built. Poll GET /api/v1/agents/{agent_id} for status.",
    )


@router.get("/agents")
async def list_agents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).order_by(Agent.created_at.desc()))
    agents = result.scalars().all()
    return [
        {
            "id": a.id, "name": a.name, "framework": a.framework,
            "model": a.model, "status": a.status, "endpoint": a.endpoint,
            "created_at": a.created_at,
        }
        for a in agents
    ]


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {
        "id": agent.id, "name": agent.name, "framework": agent.framework,
        "model": agent.model, "status": agent.status, "endpoint": agent.endpoint,
        "config": agent.config, "created_at": agent.created_at,
    }


@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    await DeployService().teardown(agent_id, agent.container_id)
    await db.delete(agent)
    await db.commit()
    return {"message": f"Agent {agent_id} deleted"}