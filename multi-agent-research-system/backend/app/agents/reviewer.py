from app.core.prompts import REVIEWER_PROMPT
from app.utils.helpers import call_llm

class ReviewerAgent:
    async def review(self, draft: str) -> str:
        prompt = REVIEWER_PROMPT.format(draft=draft)
        return await call_llm(prompt)