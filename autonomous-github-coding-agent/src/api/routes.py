from fastapi import APIRouter, Request, Header, HTTPException, BackgroundTasks
from src.core.security import verify_github_signature
from src.models.github import WebhookPayload
from src.models.db import SessionLocal, PRReview, ReviewStatus
from arq import create_pool
from src.core.queue import redis_settings
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok"}

@router.post("/webhook", tags=["GitHub"])
async def handle_webhook(
    request: Request,
    x_hub_signature_256: str = Header(None)
):
    # 1. Signature Verification
    body = await request.body()
    if not verify_github_signature(body, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")

    # 2. Payload Parsing
    try:
        payload_data = json.loads(body)
        if "zen" in payload_data:
            return {"status": "ok", "message": "pong"}
        payload = WebhookPayload(**payload_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payload validation failed: {str(e)}")

    # 3. Filter for specific actions
    if payload.action not in ["opened", "synchronize"]:
        return {"status": "ignored", "reason": f"Action '{payload.action}' is not handled"}

    # 4. Create DB Record (PENDING)
    db = SessionLocal()
    try:
        new_review = PRReview(
            repo_name=payload.repository.full_name,
            pr_number=payload.pull_request.number,
            status=ReviewStatus.PENDING.value
        )
        db.add(new_review)
        db.commit()
        logger.info(f"Review record created for PR #{payload.pull_request.number}")
    except Exception as e:
        logger.error(f"Failed to create DB record: {str(e)}")
    finally:
        db.close()

    # 5. Enqueue to Redis
    try:
        redis = await create_pool(redis_settings)
        await redis.enqueue_job('process_pr_task', payload_data)
        logger.info(f"PR #{payload.pull_request.number} enqueued to Redis")
    except Exception as e:
        logger.error(f"Failed to enqueue to Redis: {str(e)}")
        # In a real system, we might want to handle this more gracefully

    return {
        "status": "queued",
        "pr_number": payload.pull_request.number,
        "repo": payload.repository.full_name
    }
