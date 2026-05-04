from core.runner import AgentRunner
from db.models import AgentRun, ExecutionLog
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AgentService:
    def __init__(self):
        self.runner = AgentRunner()

    async def execute(
        self,
        agent: dict,
        input_text: str,
        run_id: str,
        db: AsyncSession,
    ) -> dict:
        await self._log(db, agent["id"], "INFO",
                        f"[{agent['id']}] Run {run_id[:8]} started · input: {input_text[:80]}")

        try:
            result = await self.runner.run(agent, input_text)

            await self._log(db, agent["id"], "OK",
                            f"[{agent['id']}] Run complete · {result.latency_ms}ms · {result.tool_calls} tool calls")

            # Update run record
            run = await db.get(AgentRun, run_id)
            if run:
                run.output_text = result.output
                run.tool_calls  = result.tool_calls
                run.latency_ms  = result.latency_ms
                run.status      = "done"
                run.finished_at = datetime.utcnow()
                await db.commit()

            return {
                "output":     result.output,
                "tool_calls": result.tool_calls,
                "latency_ms": result.latency_ms,
            }

        except Exception as exc:
            logger.exception("Run failed for agent %s", agent["id"])
            await self._log(db, agent["id"], "ERROR", f"[{agent['id']}] Run failed: {exc}")

            run = await db.get(AgentRun, run_id)
            if run:
                run.status = "error"
                await db.commit()

            return {"output": f"Error: {exc}", "tool_calls": 0, "latency_ms": 0}

    async def _log(self, db: AsyncSession, agent_id: str, level: str, message: str):
        db.add(ExecutionLog(agent_id=agent_id, level=level, message=message))
        await db.commit()