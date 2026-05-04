"""
Insight Agent — Optimized for Cost & Quota
Consolidates all AI analysis into a single Gemini call.
"""
from typing import Dict, List, Any
import structlog

from app.services import ai_service

logger = structlog.get_logger(__name__)


def run_insight_agent(
    timestamped_transcript: str,
    duration_seconds: float,
    max_clips: int = 3, # Strict limit
    video_title: str = "",
) -> Dict[str, Any]:
    """
    ONE CALL ONLY. 
    Returns viral clips with platform content already attached.
    """
    # Force strict limits
    max_clips = min(max_clips, 3)
    
    logger.info("insight_agent.start_optimized", duration=duration_seconds, max_clips=max_clips)

    # Single Mega Call to Gemini
    ai_result = ai_service.gemini_service.single_call_analysis(
        transcript=timestamped_transcript,
        duration_seconds=duration_seconds,
        video_title=video_title,
        max_clips=max_clips,
    )

    raw_candidates = ai_result.get("clip_candidates", [])
    summary = ai_result.get("summary", "")

    # Validate and normalize
    validated = []
    for c in raw_candidates:
        try:
            start = float(c["start_time"])
            end = float(c["end_time"])
            duration = end - start

            if duration < 10 or duration > 65:
                end = min(start + 60, duration_seconds)

            validated.append({
                "start_time": round(start, 2),
                "end_time": round(end, 2),
                "duration": round(end - start, 2),
                "viral_score": max(0, min(100, float(c.get("viral_score", 50)))),
                "moment_type": c.get("moment_type", "educational"),
                "hook_text": c.get("hook_text", ""), # Legacy field
                "transcript_segment": c.get("transcript_segment", ""),
                "insight_reason": c.get("insight_reason", ""),
                "platforms_content": c.get("platforms", {}), # New rich content
            })
        except (KeyError, ValueError, TypeError) as e:
            logger.warning("insight_agent.skip_invalid", error=str(e))
            continue

    validated.sort(key=lambda x: x["viral_score"], reverse=True)

    return {
        "clip_candidates": validated[:max_clips],
        "timestamped_transcript": timestamped_transcript,
        "summary": summary
    }
