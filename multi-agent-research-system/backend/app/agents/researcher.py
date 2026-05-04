from app.core.prompts import RESEARCHER_PROMPT
from app.utils.helpers import call_llm
from app.agents.web_agent import WebAgent

class ResearcherAgent:
    def __init__(self):
        self.web_agent = WebAgent()
        
    async def research(self, sub_topic: str) -> str:
        # Fetch data using web agent
        web_data = await self.web_agent.fetch(sub_topic)
        
        prompt = RESEARCHER_PROMPT.format(sub_topic=sub_topic) + f"\nContext:\n{web_data}"
        return await call_llm(prompt)