import google.generativeai as genai
from src.core.config import settings
from src.core.prompts import REVIEW_SYSTEM_PROMPT
from fastapi import HTTPException

class AIReviewer:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
        
        # Using Gemini 1.5 Pro for deep analysis
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    async def generate_review(self, repo: str, pr_number: int, diff_content: str) -> str:
        """
        Sends the PR diff to Gemini and returns a structured review.
        """
        if not self.api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

        prompt = f"""
## CONTEXT
Repository: {repo}
Pull Request Number: #{pr_number}

---

{diff_content}
"""
        try:
            # Combining system instructions with the user prompt
            response = self.model.generate_content(
                f"{REVIEW_SYSTEM_PROMPT}\n\n{prompt}"
            )
            
            if not response.text:
                return "AI failed to generate a review."
                
            return response.text

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

ai_reviewer = AIReviewer()
