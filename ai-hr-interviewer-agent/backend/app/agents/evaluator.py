import json
from typing import Dict, Any, List, Optional

class EvaluatorAgent:
    """
    EvaluatorAgent evaluates user interview answers and provides a structured scoring report.
    """

    def __init__(self, llm_provider: Any = None):
        """
        Initialize with an optional LLM provider.
        """
        self.llm_provider = llm_provider

    def evaluate_answer(self, question: str, answer: str, topic: str) -> Dict[str, Any]:
        """
        Evaluates the provided answer and returns a structured report.
        """
        prompt = f"""
        Evaluate the following interview answer for the topic: {topic}
        
        Question: {question}
        Answer: {answer}
        
        Return a JSON object with scores (0-10) for correctness, clarity, depth, and technical_accuracy.
        Include HR-style feedback (strengths, weaknesses, improvements).
        
        JSON Structure:
        {{
          "question": "{question}",
          "answer": "{answer}",
          "score": {{
            "correctness": 0,
            "clarity": 0,
            "depth": 0,
            "technical_accuracy": 0,
            "total": 0
          }},
          "feedback": {{
            "strengths": [],
            "weaknesses": [],
            "improvements": []
          }}
        }}
        """

        if self.llm_provider and hasattr(self.llm_provider, "generate"):
            try:
                response = self.llm_provider.generate(prompt)
                # Simple JSON extraction in case of markdown or extra text
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                
                data = json.loads(response.strip())
                
                # Ensure total is calculated correctly
                s = data["score"]
                data["score"]["total"] = sum([
                    s.get("correctness", 0),
                    s.get("clarity", 0),
                    s.get("depth", 0),
                    s.get("technical_accuracy", 0)
                ])
                return data
            except Exception:
                return self._get_fallback_evaluation(question, answer)
        
        return self._get_fallback_evaluation(question, answer)

    def _get_fallback_evaluation(self, question: str, answer: str) -> Dict[str, Any]:
        """
        Fallback scoring logic when LLM is unavailable.
        """
        return {
            "question": question,
            "answer": answer,
            "score": {
                "correctness": 7,
                "clarity": 7,
                "depth": 5,
                "technical_accuracy": 6,
                "total": 25
            },
            "feedback": {
                "strengths": ["Initial answer provided"],
                "weaknesses": ["Analysis was performed using fallback logic"],
                "improvements": ["Enable LLM provider for detailed feedback"]
            }
        }

def evaluate_answer(question: str, answer: str, topic: str) -> Dict[str, Any]:
    """
    Standard interface for evaluating an answer.
    """
    agent = EvaluatorAgent()
    return agent.evaluate_answer(question, answer, topic)
