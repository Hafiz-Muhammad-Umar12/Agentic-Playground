from app.core.config import settings
from app.core.gemini_client import call_gemini_async

async def call_llm(prompt: str) -> str:
    """Abstraction layer for LLM calls (OpenAI/Gemini)."""
    if settings.LLM_PROVIDER.lower() == "gemini":
        return await call_gemini_async(prompt)
    else:
        return await _call_openai(prompt)

async def _call_openai(prompt: str) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content