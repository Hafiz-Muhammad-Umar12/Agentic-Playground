from app.core.prompts import SUMMARIZER_PROMPT
from app.utils.helpers import call_llm

class SummarizerAgent:
    async def summarize(self, notes: str) -> str:
        prompt = SUMMARIZER_PROMPT.format(notes=notes)
        return await call_llm(prompt)