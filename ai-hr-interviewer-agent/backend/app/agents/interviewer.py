import json
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class InterviewQuestion(BaseModel):
    level: str = Field(..., description="Difficulty level: easy, medium, or hard")
    question: str = Field(..., description="The interview question text")

class InterviewSession(BaseModel):
    topic: str
    questions: List[InterviewQuestion]

class InterviewerAgent:
    """
    Agent responsible for generating structured interview questions based on a topic.
    Designed to be LLM-agnostic and easily integrated into a multi-agent system.
    """

    def __init__(self, llm_provider: Any = None):
        # llm_provider will be used to inject OpenAI/Gemini clients later
        self.llm_provider = llm_provider

    def _get_prompt_template(self, topic: str) -> str:
        """Constructs the prompt for the LLM."""
        return f"""
        You are an expert HR and Technical Interviewer. 
        Generate 6-9 interview questions about '{topic}'.
        
        Requirements:
        1. Mix of HR behavioral and technical questions.
        2. Strict difficulty progression: 2-3 Easy, 2-3 Medium, 2-3 Hard.
        3. Non-repetitive and professional.
        
        Output MUST be a valid JSON object matching this structure:
        {{
          "topic": "{topic}",
          "questions": [
            {{ "level": "easy", "question": "..." }},
            {{ "level": "medium", "question": "..." }},
            {{ "level": "hard", "question": "..." }}
          ]
        }}
        """

    def generate_questions(self, topic: str) -> Dict[str, Any]:
        """
        Generates a set of structured interview questions for a given topic.
        Currently simulates the LLM response to demonstrate the logic.
        """
        # In a real implementation, this would call:
        # response = self.llm_provider.generate(self._get_prompt_template(topic))
        # return json.loads(response)

        # Mock implementation for initial architectural setup
        mock_response = {
            "topic": topic,
            "questions": [
                {"level": "easy", "question": f"Can you explain the basic concept of {topic}?"},
                {"level": "easy", "question": f"What motivated you to specialize in {topic}?"},
                {"level": "medium", "question": f"What are the common challenges when implementing {topic} in a production environment?"},
                {"level": "medium", "question": f"How does {topic} compare to its main alternatives?"},
                {"level": "hard", "question": f"Describe a complex scenario where you had to optimize {topic} for performance."},
                {"level": "hard", "question": f"How would you architect a scalable system using {topic} while maintaining high availability?"}
            ]
        }
        
        # Validate through Pydantic to ensure production-ready data integrity
        session = InterviewSession(**mock_response)
        return session.model_dump()

def generate_questions(topic: str) -> Dict[str, Any]:
    """Utility function to interface with the InterviewerAgent."""
    agent = InterviewerAgent()
    return agent.generate_questions(topic)
