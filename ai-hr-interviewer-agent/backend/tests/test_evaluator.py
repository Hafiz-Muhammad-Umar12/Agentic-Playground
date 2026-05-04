import pytest
from app.agents.evaluator import EvaluatorAgent, evaluate_answer

class MockLLM:
    def generate(self, prompt: str) -> str:
        return """
        {
          "question": "What is Python?",
          "answer": "A programming language.",
          "score": {
            "correctness": 9,
            "clarity": 8,
            "depth": 7,
            "technical_accuracy": 9
          },
          "feedback": {
            "strengths": ["Clear definition"],
            "weaknesses": ["Could be more detailed"],
            "improvements": ["Mention versatility"]
          }
        }
        """

def test_evaluator_agent_fallback():
    agent = EvaluatorAgent(llm_provider=None)
    result = agent.evaluate_answer("Test question", "Test answer", "Python")
    
    assert "score" in result
    assert result["score"]["total"] == 25
    assert result["score"]["correctness"] == 7
    assert len(result["feedback"]["strengths"]) > 0

def test_evaluator_agent_with_llm():
    mock_llm = MockLLM()
    agent = EvaluatorAgent(llm_provider=mock_llm)
    result = agent.evaluate_answer("What is Python?", "A programming language.", "Python")
    
    assert result["score"]["total"] == 33
    assert result["score"]["correctness"] == 9
    assert result["question"] == "What is Python?"

def test_standalone_evaluate_answer():
    result = evaluate_answer("Test question", "Test answer", "Python")
    assert "score" in result
    assert "total" in result["score"]
