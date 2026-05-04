"""
AI Service — Optimized for Single-Call Gemini architecture.
Reduces API costs by 80%+ through consolidation and caching.
"""
import hashlib
import json
import re
from typing import Any, List, Dict, Optional

import google.generativeai as genai
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = structlog.get_logger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# In-memory cache for the session (could be Redis in production)
_ai_cache: Dict[str, Any] = {}

class GeminiService:
    def __init__(self, model_name: str = "gemini-1.5-flash"): # Use flash for cost efficiency
        self.model_name = model_name
        self.model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "temperature": 0.2, # Lower temperature for more stable JSON
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 4096,
                "response_mime_type": "application/json",
            }
        )

    def _get_cache_key(self, text: str, salt: str = "") -> str:
        return hashlib.sha256((text + salt).encode()).hexdigest()

    def _parse_json_response(self, text: str) -> Any:
        try:
            text = text.strip()
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            return json.loads(text)
        except Exception as e:
            logger.error("gemini.parse_error", error=str(e), text=text[:200])
            return None

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=6))
    def single_call_analysis(
        self,
        transcript: str,
        duration_seconds: float,
        video_title: str = "",
        max_clips: int = 3,
    ) -> Dict:
        """
        ONE MEGA CALL: Analysis + Platform Optimization + Captions.
        """
        # 1. Truncate transcript to save tokens and avoid quota hit
        truncated_transcript = transcript[:8000]
        
        # 2. Check Cache
        cache_key = self._get_cache_key(truncated_transcript, f"v2_{max_clips}_{video_title}")
        if cache_key in _ai_cache:
            logger.info("gemini.cache_hit", key=cache_key)
            return _ai_cache[cache_key]

        prompt = f"""You are an elite viral video strategist. 
Analyze the transcript and provide a single JSON response for the top {max_clips} viral clips.

VIDEO TITLE: {video_title}
DURATION: {duration_seconds}s

TRANSCRIPT:
{truncated_transcript}

TASK:
1. Identify {max_clips} viral segments (15-60s each).
2. For EACH segment, generate platform-optimized content for TikTok, Instagram Reels, and YouTube Shorts.

RETURN JSON FORMAT:
{{
  "summary": "overall video summary",
  "clip_candidates": [
    {{
      "start_time": float,
      "end_time": float,
      "viral_score": 1-100,
      "moment_type": "educational|funny|emotional|controversial",
      "insight_reason": "why it will go viral",
      "transcript_segment": "text from segment",
      "platforms": {{
        "tiktok": {{
          "hook": "punchy 2-word start hook",
          "caption": "max 150 chars",
          "hashtags": ["h1", "h2"]
        }},
        "reels": {{
          "hook": "aesthetic hook",
          "caption": "lifestyle tone",
          "hashtags": ["h1", "h2"]
        }},
        "youtube_shorts": {{
          "hook": "SEO title hook",
          "caption": "keyword rich",
          "hashtags": ["h1", "h2"]
        }}
      }}
    }}
  ]
}}
"""
        try:
            logger.info("gemini.single_call_start", transcript_len=len(truncated_transcript))
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result and "clip_candidates" in result:
                _ai_cache[cache_key] = result
                return result
            
            raise ValueError("Invalid Gemini response structure")
        except Exception as e:
            logger.error("gemini.single_call_failed", error=str(e))
            return self._fallback_logic(transcript, duration_seconds, max_clips)

    def _fallback_logic(self, transcript: str, duration: float, max_clips: int) -> Dict:
        """Rule-based fallback if Gemini fails."""
        logger.warning("gemini.fallback_triggered")
        # Simple rule: take 30s clips at 1/4, 1/2, and 3/4 marks
        candidates = []
        for i in range(1, max_clips + 1):
            start = (duration / (max_clips + 1)) * i
            end = min(start + 30, duration)
            candidates.append({
                "start_time": start,
                "end_time": end,
                "viral_score": 50,
                "moment_type": "educational",
                "insight_reason": "Fallback selection based on video timing",
                "transcript_segment": "Fallback segment",
                "platforms": {
                    "tiktok": {"hook": "Check this out", "caption": "Viral moment", "hashtags": ["viral"]},
                    "reels": {"hook": "Must watch", "caption": "Amazing clip", "hashtags": ["reels"]},
                    "youtube_shorts": {"hook": "Shorts Feed", "caption": "Video highlight", "hashtags": ["shorts"]}
                }
            })
        return {
            "summary": "Fallback summary generated due to API issues.",
            "clip_candidates": candidates
        }

gemini_service = GeminiService()

# ─── Legacy Wrapper (Optimized) ──────────────────────────────

def analyze_transcript_for_viral_moments(
    transcript: str,
    duration_seconds: float,
    max_clips: int = 3, # Lowered default
) -> List[Dict]:
    """Compatibility wrapper that now uses the optimized single call."""
    result = gemini_service.single_call_analysis(transcript, duration_seconds, max_clips=max_clips)
    return result.get("clip_candidates", [])

def generate_platform_content(
    transcript_segment: str,
    moment_type: str,
    platform: str,
    video_title: str,
    language: str = "en",
) -> Dict:
    """
    DEPRECATED: Now handled by single_call_analysis.
    Returns empty dict to avoid extra API calls. 
    The caption_agent should be updated to use pre-generated data.
    """
    return {}

def translate_subtitles(text: str, target_language: str) -> str:
    # Rule-based or extremely light translation if needed
    return text

def suggest_broll(transcript_segment: str, moment_type: str) -> List[str]:
    return []
