import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_start_interview():
    response = client.post(
        "/api/start-interview",
        json={"topic": "Python"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "session_id" in data
    assert "questions" in data

def test_submit_answer():
    # 1. Start session
    start_resp = client.post("/api/start-interview", json={"topic": "Python"})
    start_data = start_resp.json()
    session_id = start_data["session_id"]
    question = start_data["questions"][0]["question"]
    
    # 2. Submit answer with session_id
    response = client.post(
        "/api/submit-answer",
        json={
            "session_id": session_id,
            "question": question,
            "answer": "Python is a high-level programming language.",
            "topic": "Python"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "evaluation" in data
    assert "next_action" in data

def test_submit_answer_invalid_session():
    response = client.post(
        "/api/submit-answer",
        json={
            "session_id": "invalid-id",
            "question": "test",
            "answer": "test",
            "topic": "test"
        }
    )
    assert response.status_code == 404
    assert response.json()["success"] is False
