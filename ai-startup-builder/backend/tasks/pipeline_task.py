import asyncio
import logging
from celery import Task
from backend.workers.celery_worker import celery_app
from backend.agents.orchestrator import StartupOrchestrator
from backend.db.database import SessionLocal
from backend.db.models import Project, AgentOutput
from backend.core.memory import memory
from backend.tools.file_writer import ProjectFileWriter

logger = logging.getLogger(__name__)

class PipelineTask(Task):
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {task_id} failed: {exc}")

@celery_app.task(bind=True, base=PipelineTask, max_retries=3, default_retry_delay=60)
def run_pipeline_async(self, concept: str, user_id: int):
    """
    Synchronous wrapper for the async pipeline.
    """
    return asyncio.run(process_pipeline(concept, user_id))

async def process_pipeline(concept: str, user_id: int):
    """
    Executes the multi-agent pipeline and persists results for a specific user.
    """
    logger.info(f"Processing pipeline for user {user_id}: {concept}")
    
    # 1. Memory Context
    context = memory.search(concept, limit=2)
    enhanced_prompt = f"Using context from past projects: {context}\n\nOriginal Idea: {concept}" if context else concept
    
    # 2. Run Orchestrator
    orchestrator = StartupOrchestrator()
    result = orchestrator.run_pipeline(enhanced_prompt)
    
    if result.get("status") == "failed":
        raise Exception(f"Pipeline failed: {result.get('error')}")

    # 3. Persist
    async with SessionLocal() as db:
        try:
            new_project = Project(
                title=f"Startup: {concept[:30]}...",
                input_concept=concept,
                owner_id=user_id
            )
            db.add(new_project)
            await db.flush()

            outputs = [
                AgentOutput(project_id=new_project.id, agent_type="idea", content=result["refined_idea"]),
                AgentOutput(project_id=new_project.id, agent_type="market", content=result["market_analysis"]),
                AgentOutput(project_id=new_project.id, agent_type="validation", content=f"Score: {result['validation_score']}\nFeedback: {result['validation_feedback']}")
            ]
            db.add_all(outputs)
            
            # 4. File Gen
            file_writer = ProjectFileWriter(new_project.id)
            await file_writer.generate_scaffold(result["refined_idea"], result["market_analysis"])
            zip_path = file_writer.create_zip()
            
            new_project.zip_path = zip_path
            await db.commit()
            
            # 5. Store in Memory
            memory.store(
                text=result["refined_idea"], 
                metadata={"project_id": new_project.id, "user_id": user_id}
            )

            return {
                "project_id": new_project.id,
                "status": "success"
            }
        except Exception as e:
            await db.rollback()
            logger.error(f"Task Error: {e}")
            raise
