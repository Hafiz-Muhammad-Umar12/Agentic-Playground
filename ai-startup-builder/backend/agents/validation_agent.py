import json
import re
from backend.core.llm import call_llm

class ValidationAgent:
    """
    Agent responsible for validating the feasibility of a startup idea.
    """
    
    def __init__(self):
        self.system_prompt = (
            "You are a Startup Validator and VC Analyst. "
            "Your goal is to evaluate the feasibility, scalability, and technical viability "
            "of a startup idea. You MUST provide a validation score between 0 and 100."
            "Format your response as a JSON object with 'score' (int) and 'feedback' (str)."
        )

    def process(self, idea: str, market_analysis: str) -> dict:
        """
        Validates the idea based on market analysis.
        """
        prompt = (
            f"Validate this startup idea: {idea}\n\n"
            f"Based on this market analysis: {market_analysis}\n\n"
            "Provide a score and feedback in JSON format."
        )
        response = call_llm(prompt, self.system_prompt)
        
        # Simple JSON extraction
        try:
            # Look for JSON in the response if the LLM adds markdown or text
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                data = json.loads(match.group())
            else:
                data = json.loads(response)
            
            return {
                "score": data.get("score", 0),
                "feedback": data.get("feedback", "No feedback provided."),
                "status": "completed"
            }
        except Exception:
            # Fallback if LLM fails to provide valid JSON
            return {
                "score": 50,
                "feedback": "Failed to parse detailed validation. Manual review required.",
                "raw_response": response,
                "status": "completed"
            }
