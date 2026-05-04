import asyncio
import logging
from typing import Callable, Any
from src.core.config import settings

logger = logging.getLogger(__name__)

async def run_with_retry(func: Callable, *args: Any, **kwargs: Any) -> Any:
    """
    Executes an async function with exponential backoff retry logic.
    """
    retries = 0
    delay = settings.RETRY_DELAY_SECONDS

    while retries < settings.MAX_RETRIES:
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            retries += 1
            if retries >= settings.MAX_RETRIES:
                logger.error(f"FATAL: Task failed after {retries} retries. Error: {str(e)}")
                raise e
            
            logger.warning(f"Task failed (Attempt {retries}/{settings.MAX_RETRIES}). Retrying in {delay}s... Error: {str(e)}")
            await asyncio.sleep(delay)
            delay *= 2  # Exponential backoff
