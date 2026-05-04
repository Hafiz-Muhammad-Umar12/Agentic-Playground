from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from db.session import get_db
from db.models import ExecutionLog
import asyncio
import json

router = APIRouter()


@router.get("/logs/{agent_id}")
async def get_logs(
    agent_id: str,
    level: str | None = Query(None, description="Filter: INFO | WARN | ERROR | OK"),
    limit: int = Query(100, le=500),
    db: AsyncSession = Depends(get_db),
):
    q = select(ExecutionLog).where(ExecutionLog.agent_id == agent_id)
    if level:
        q = q.where(ExecutionLog.level == level.upper())
    q = q.order_by(desc(ExecutionLog.created_at)).limit(limit)

    result = await db.execute(q)
    logs   = result.scalars().all()

    return [
        {
            "id": l.id,
            "level": l.level,
            "message": l.message,
            "meta": l.meta,
            "created_at": l.created_at,
        }
        for l in reversed(logs)
    ]


@router.get("/logs/{agent_id}/stream")
async def stream_logs(agent_id: str, db: AsyncSession = Depends(get_db)):
    """SSE endpoint — streams new log lines as they arrive."""

    async def event_generator():
        last_id = 0
        while True:
            result = await db.execute(
                select(ExecutionLog)
                .where(ExecutionLog.agent_id == agent_id, ExecutionLog.id > last_id)
                .order_by(ExecutionLog.id)
                .limit(20)
            )
            rows = result.scalars().all()
            for row in rows:
                last_id = row.id
                data = json.dumps({
                    "level": row.level,
                    "message": row.message,
                    "created_at": str(row.created_at),
                })
                yield f"data: {data}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.delete("/logs/{agent_id}")
async def clear_logs(agent_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExecutionLog).where(ExecutionLog.agent_id == agent_id)
    )
    for log in result.scalars().all():
        await db.delete(log)
    await db.commit()
    return {"message": f"Logs cleared for agent {agent_id}"}