from groq import AsyncGroq
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize the Async client
client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def generate_completion(messages: list[dict], model: str = "llama-3.3-70b-versatile", temperature: float = 0.7) -> str:
    """
    Generates a completion using Groq's async client.
    """
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API Error: {str(e)}")
        raise RuntimeError(f"LLM Generation failed: {str(e)}")
