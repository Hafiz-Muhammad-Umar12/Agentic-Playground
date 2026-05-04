from core.builder import AgentBuilder
from db.session import AsyncSessionLocal
from db.models import Agent, AgentStatus, ExecutionLog
import logging

logger = logging.getLogger(__name__)


class DeployService:
    def __init__(self):
        self.builder = AgentBuilder()

    async def build_and_deploy(self, agent_id: str, config: dict):
        async with AsyncSessionLocal() as db:
            try:
                await self._log(db, agent_id, "INFO", "Deployment started")

                # ----------------------------
                # 1. BUILD IMAGE (SYNC CALL)
                # ----------------------------
                image_tag = self.builder.build(agent_id, config)
                await self._log(db, agent_id, "INFO", f"Image built: {image_tag}")

                # ----------------------------
                # 2. RUN CONTAINER (SYNC CALL)
                # ----------------------------
                container_id = self.builder.deploy_container(agent_id, image_tag)
                await self._log(db, agent_id, "OK", f"Container started: {container_id[:12]}")

                # ----------------------------
                # 3. UPDATE DATABASE
                # ----------------------------
                agent = await db.get(Agent, agent_id)

                if not agent:
                    await self._log(db, agent_id, "ERROR", "Agent not found in DB")
                    return

                agent.status = AgentStatus.running
                agent.image_tag = image_tag
                agent.container_id = container_id

                await db.commit()

                await self._log(
                    db,
                    agent_id,
                    "OK",
                    f"Agent live at /api/v1/run/{agent_id}"
                )

            except Exception as exc:
                logger.exception("Deployment failed: %s", agent_id)

                await self._log(db, agent_id, "ERROR", str(exc))

                agent = await db.get(Agent, agent_id)
                if agent:
                    agent.status = AgentStatus.error
                    await db.commit()

    async def teardown(self, agent_id: str, container_id: str | None):
        try:
            if container_id:
                self.builder.stop_container(container_id)
        except Exception as e:
            logger.error("Teardown failed: %s", str(e))

    async def _log(self, db, agent_id: str, level: str, message: str):
        db.add(
            ExecutionLog(
                agent_id=agent_id,
                level=level,
                message=message
            )
        )
        await db.commit()