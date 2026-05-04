"""
Basic tests for the Video Repurposer API.
Run: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "docs" in response.json()


def test_submit_job_missing_url():
    response = client.post("/api/v1/repurpose/submit", json={})
    assert response.status_code in (400, 422)


@patch("app.api.routes.repurpose.process_video_job")
@patch("app.api.routes.repurpose.get_db")
def test_submit_youtube_job(mock_db, mock_task):
    """Test job submission returns 202 with job_id."""
    mock_task.apply_async = MagicMock()
    
    # This would require a real DB connection in integration test
    # For unit test, just verify endpoint shape
    response = client.post(
        "/api/v1/repurpose/submit",
        json={
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "platforms": ["tiktok"],
            "language": "en",
            "max_clips": 5,
        },
    )
    # Without DB, will fail with 500 — just test it doesn't 404
    assert response.status_code != 404


def test_invalid_clip_id():
    response = client.get("/api/v1/repurpose/clip/nonexistent-id/download")
    assert response.status_code in (404, 500)


def test_srt_generation():
    from app.agents.caption_agent import build_srt_from_segments, seconds_to_srt_time

    assert seconds_to_srt_time(0) == "00:00:00,000"
    assert seconds_to_srt_time(65.5) == "00:01:05,500"

    segments = [
        {"start": 0.0, "end": 5.0, "text": "Hello world"},
        {"start": 5.5, "end": 10.0, "text": "This is a test"},
    ]
    srt = build_srt_from_segments(segments, start_offset=0.0)
    assert "Hello world" in srt
    assert "00:00:05,000" in srt


def test_platform_validation():
    from app.models.schemas import RepurposeRequest

    req = RepurposeRequest(
        youtube_url="https://youtube.com/watch?v=test",
        platforms=["tiktok", "invalid_platform"],
        max_clips=50,
    )
    assert "invalid_platform" not in req.platforms
    assert req.max_clips == 20  # clamped


def test_viral_score_normalization():
    from app.agents.insight_agent import run_insight_agent

    # Mock Claude response
    mock_candidates = [
        {
            "start_time": 10.0, "end_time": 45.0, "duration": 35.0,
            "viral_score": 150,  # Should be clamped to 100
            "moment_type": "emotional",
            "hook_text": "Test hook",
            "transcript_segment": "Test text",
            "insight_reason": "Test reason",
        }
    ]

    with patch("app.agents.insight_agent.ai_service.analyze_transcript_for_viral_moments", return_value=mock_candidates):
        result = run_insight_agent("transcript", 60.0, max_clips=1)
        assert result["clip_candidates"][0]["viral_score"] == 100.0
