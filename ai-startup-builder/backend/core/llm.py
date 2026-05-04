import logging
from openai import OpenAI
from backend.core.config import settings

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def call_llm(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
    """
    Calls the OpenAI LLM with the provided prompt.
    
    Args:
        prompt: The user prompt to send to the LLM.
        system_prompt: The system instructions for the LLM.
        
    Returns:
        The text response from the LLM.
    """
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Error calling LLM: {e}")
        raise
