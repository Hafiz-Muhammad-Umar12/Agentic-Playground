"""
Celery worker — processes async agent run jobs from the Redis queue.
Start with: celery -A queue.worker worker --loglevel=info
"""
import os
import asyncio
from celery import Celery
from db.session import AsyncSessionLocal
from services.agent_service import AgentService

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "agentforge",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


def run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=5)
def execute_agent_task(self, agent: dict, input_text: str, run_id: str):
    """
    Celery task: runs an agent asynchronously from the Redis queue.
    Called when a run request arrives but the container prefers queue-based execution.
    """
    async def _run():
        async with AsyncSessionLocal() as db:
            service = AgentService()
            return await service.execute(
                agent=agent,
                input_text=input_text,
                run_id=run_id,
                db=db,
            )

    try:
        return run_async(_run())
    except Exception as exc:
        raise self.retry(exc=exc)