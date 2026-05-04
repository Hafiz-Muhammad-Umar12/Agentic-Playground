from app.core.prompts import WRITER_PROMPT
from app.utils.helpers import call_llm

class WriterAgent:
    async def write(self, summary: str) -> str:
        prompt = WRITER_PROMPT.format(summary=summary)
        return await call_llm(prompt)