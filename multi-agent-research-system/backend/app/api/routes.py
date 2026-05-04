from fastapi import APIRouter, HTTPException
from app.api.schema import ResearchRequest, ResearchResponse
from app.workflows.research_flow import run_research_workflow
import structlog

logger = structlog.get_logger()
router = APIRouter()

@router.post("/research", response_model=ResearchResponse)
async def generate_research(request: ResearchRequest):
    """
    Optimized endpoint for Free Tier usage.
    Triggers a single high-context Gemini call to generate a full report.
    """
    try:
        logger.info("Received research request", topic=request.topic)
        report = await run_research_workflow(request.topic)
        return ResearchResponse(status="success", report=report)
    except Exception as e:
        logger.error("Research workflow failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"System error: {str(e)}")