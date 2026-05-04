import pytest
from app.services.interview_service import InterviewService

def test_start_interview():
    service = InterviewService()
    result = service.start_interview("Python")
    
    assert result["success"] is True
    assert "session_id" in result
    assert len(result["questions"]) > 0

def test_process_answer_continue():
    service = InterviewService(score_threshold=10)
    start = service.start_interview("Python")
    session_id = start["session_id"]
    
    # The mock evaluator inside agent returns total=25 by default in fallback mode
    result = service.process_answer(session_id, "What is Python?", "It's a language.", "Python")
    
    assert result["success"] is True
    assert result["next_action"] == "continue"
    assert result["next_question"] != ""

def test_process_answer_end_on_low_score():
    # Set threshold very high to trigger "end"
    service = InterviewService(score_threshold=100)
    start = service.start_interview("Python")
    session_id = start["session_id"]
    
    result = service.process_answer(session_id, "What is Python?", "I don't know.", "Python")
    
    assert result["next_action"] == "end"

def test_process_answer_error_handling():
    service = InterviewService()
    # Invalid session ID should return success=False but next_action=end
    result = service.process_answer("invalid-id", "q", "a", "t")
    assert result["success"] is False
    assert result["next_action"] == "end"
