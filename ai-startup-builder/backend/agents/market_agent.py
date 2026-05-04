from backend.core.llm import call_llm

class MarketAgent:
    """
    Agent responsible for market research and competitive analysis.
    """
    
    def __init__(self):
        self.system_prompt = (
            "You are a Market Research Analyst. "
            "Your goal is to analyze the market potential for a given startup idea, "
            "identifying target markets, competitors, and potential risks."
        )

    def process(self, idea: str) -> dict:
        """
        Analyzes the market for a given idea.
        """
        prompt = f"Analyze the market for this startup idea: {idea}"
        market_analysis = call_llm(prompt, self.system_prompt)
        return {
            "market_analysis": market_analysis,
            "status": "completed"
        }
