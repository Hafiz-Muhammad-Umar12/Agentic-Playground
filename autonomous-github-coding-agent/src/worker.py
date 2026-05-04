import logging
from arq.connections import RedisSettings
from src.core.queue import redis_settings
from src.services.orchestrator import orchestrator
from src.models.db import SessionLocal, PRReview, ReviewStatus
from src.models.github import WebhookPayload
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_pr_task(ctx, payload_data: dict):
    """
    Worker task picked up from Redis.
    """
    payload = WebhookPayload(**payload_data)
    db = SessionLocal()
    
    # Update DB status to PROCESSING
    review_record = db.query(PRReview).filter(
        PRReview.repo_name == payload.repository.full_name,
        PRReview.pr_number == payload.pull_request.number
    ).order_by(PRReview.created_at.desc()).first()

    if review_record:
        review_record.status = ReviewStatus.PROCESSING.value
        db.commit()
        logger.info(f"PR #{payload.pull_request.number} moved to PROCESSING")

    try:
        # Run orchestrator logic
        result = await orchestrator.process_pull_request(payload)
        
        # Update DB status to COMPLETED
        if review_record:
            review_record.status = ReviewStatus.COMPLETED.value
            review_record.review_content = result.get("review")
            db.commit()
            logger.info(f"PR #{payload.pull_request.number} COMPLETED")
            
    except Exception as e:
        logger.error(f"Worker task failed: {str(e)}")
        if review_record:
            review_record.status = ReviewStatus.FAILED.value
            review_record.error_message = str(e)
            db.commit()
    finally:
        db.close()

async def startup(ctx):
    logger.info("Worker starting up...")

async def shutdown(ctx):
    logger.info("Worker shutting down...")

class WorkerSettings:
    functions = [process_pr_task]
    redis_settings = redis_settings
    on_startup = startup
    on_shutdown = shutdown
