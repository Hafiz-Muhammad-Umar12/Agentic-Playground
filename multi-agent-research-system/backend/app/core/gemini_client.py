import google.generativeai as genai
from google.api_core import exceptions
from app.core.config import settings
import structlog
import asyncio
import time
import re

logger = structlog.get_logger()

# In-memory caches
_success_cache = {}
_failure_cache = {}  # {prompt_hash: expiry_timestamp}
_FAILURE_TTL = 60    # Skip retrying known failures for 60 seconds

# Reliability pacing (5 RPM safety)
_last_call_time = 0
_MIN_INTER_CALL_DELAY = 12.1 

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

model_identifier = settings.GEMINI_MODEL
if not model_identifier.startswith("models/"):
    model_identifier = f"models/{model_identifier}"

model = genai.GenerativeModel(model_identifier)

def extract_retry_delay(error: Exception) -> float:
    error_msg = str(error)
    match = re.search(r"retry after (\d+)\s*s", error_msg, re.IGNORECASE)
    return float(match.group(1)) if match else 0.0

async def call_gemini_async(prompt: str, use_cache: bool = True) -> str:
    global _last_call_time
    prompt_hash = hash(prompt)

    # 1. Caching & Optimization
    if use_cache:
        if prompt_hash in _success_cache:
            logger.info("Reliability Handler: Success cache hit")
            return _success_cache[prompt_hash]
        
        if prompt_hash in _failure_cache:
            if time.time() < _failure_cache[prompt_hash]:
                logger.warning("Reliability Handler: Failure cache hit. Skipping request.")
                return "Service is temporarily busy (Quota Exceeded). Please try again shortly."
            else:
                del _failure_cache[prompt_hash]

    # 2. Parallel Burst Prevention (Pacing)
    async with asyncio.Lock():
        backoff_schedule = [5, 15, 30]  # Sequence requested
        max_attempts = len(backoff_schedule) + 1
        
        for attempt in range(1, max_attempts + 1):
            # Pre-emptive RPM Pacing
            elapsed = time.time() - _last_call_time
            if elapsed < _MIN_INTER_CALL_DELAY:
                await asyncio.sleep(_MIN_INTER_CALL_DELAY - elapsed)

            try:
                logger.info("API Call Attempt", attempt=attempt, model=model_identifier)
                loop = asyncio.get_running_loop()
                response = await loop.run_in_executor(None, lambda: model.generate_content(prompt))
                
                _last_call_time = time.time()
                result = response.text
                
                if use_cache:
                    _success_cache[prompt_hash] = result
                return result

            except Exception as e:
                error_msg = str(e)
                is_quota_error = "429" in error_msg or "ResourceExhausted" in error_msg
                
                # Hard Failure / Quota Handling
                if is_quota_error and attempt == max_attempts:
                    logger.error("Reliability Handler: Max retries reached or Quota Hard Limit.")
                    _failure_cache[prompt_hash] = time.time() + _FAILURE_TTL
                    return "Service is temporarily busy. Please try again shortly."

                if is_quota_error:
                    # Determine wait duration
                    api_delay = extract_retry_delay(e)
                    wait_duration = api_delay if api_delay > 0 else backoff_schedule[attempt-1]
                    
                    logger.warning("Rate Limit Encountered", 
                                   attempt=attempt, 
                                   waiting_seconds=wait_duration,
                                   error=error_msg)
                    
                    await asyncio.sleep(wait_duration)
                    continue  # Next retry attempt
                
                # Non-retryable error
                logger.error("Reliability Handler: Unrecoverable API Error", error=error_msg)
                return f"API Error: {error_msg}"

        return "Service is temporarily busy. Please try again shortly."