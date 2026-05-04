import json
from typing import List, Dict, Any, Literal
from pydantic import BaseModel, Field

class FollowUpQuestion(BaseModel):
    type: Literal["clarification", "deep_dive", "challenge"]
    question: str

class FollowUpResponse(BaseModel):
    original_question: str
    user_answer: str
    followups: List[FollowUpQuestion]

class FollowUpInterviewAgent:
    """
    Agent responsible for analyzing user answers and generating intelligent 
    follow-up questions to probe deeper or clarify concepts.
    """

    def __init__(self, llm_provider: Any = None):
        self.llm_provider = llm_provider

    def _get_analysis_prompt(self, question: str, user_answer: str, topic: str) -> str:
        return f"""
        You are a senior HR and technical interviewer focusing on '{topic}'.
        
        Original Question: {question}
        Candidate's Answer: {user_answer}
        
        Analyze the candidate's response for:
        1. Correctness and technical accuracy.
        2. Depth of explanation and detail.
        3. Missing key concepts or potential red flags.
        
        Generate 1-3 follow-up questions.
        - Use 'clarification' if the answer is vague or incomplete.
        - Use 'deep_dive' to explore a specific technical detail mentioned.
        - Use 'challenge' to test the candidate's understanding under pressure or alternative scenarios.
        
        Simulate a real HR interviewer: be professional, inquisitive, and firm.
        
        Output MUST be a valid JSON object matching this structure:
        {{
          "original_question": "{question}",
          "user_answer": "{user_answer}",
          "followups": [
            {{ "type": "clarification | deep_dive | challenge", "question": "..." }}
          ]
        }}
        """

    def generate_followups(self, question: str, answer: str, topic: str) -> Dict[str, Any]:
        """
        Analyzes the answer and generates structured follow-up questions using the LLM.
        """
        prompt = self._get_analysis_prompt(question, answer, topic)
        
        # Integration logic for LLM provider
        if self.llm_provider:
            response = self.llm_provider.generate(prompt)
            # Assuming response is a JSON string from LLM
            try:
                data = json.loads(response)
            except json.JSONDecodeError:
                # Fallback or error handling logic
                data = self._get_mock_response(question, answer)
        else:
            data = self._get_mock_response(question, answer)

        # Validate and return
        validated_data = FollowUpResponse(**data)
        return validated_data.model_dump()

    def _get_mock_response(self, question: str, answer: str) -> Dict[str, Any]:
        """Provides a fallback/mock response for architectural demonstration."""
        return {
            "original_question": question,
            "user_answer": answer,
            "followups": [
                {
                    "type": "deep_dive",
                    "question": "You mentioned performance optimization; can you elaborate on the specific tools you used for profiling?"
                },
                {
                    "type": "challenge",
                    "question": "How would your approach change if the system had to handle a 10x increase in concurrent users?"
                }
            ]
        }

def generate_followups(question: str, answer: str, topic: str) -> Dict[str, Any]:
    """Utility function to interface with the FollowUpInterviewAgent."""
    agent = FollowUpInterviewAgent()
    return agent.generate_followups(question, answer, topic)
