import json
from app.core.prompts import PLANNER_PROMPT
from app.utils.helpers import call_llm

class PlannerAgent:
    async def plan(self, topic: str) -> list[str]:
        prompt = PLANNER_PROMPT.format(topic=topic)
        response = await call_llm(prompt)
        try:
            # Simple extraction for JSON array from LLM response
            start = response.find('[')
            end = response.rfind(']') + 1
            if start != -1 and end != 0:
                return json.loads(response[start:end])
            return [topic]
        except Exception:
            return [f"Introduction to {topic}", f"Core concepts of {topic}", f"Conclusion of {topic}"]