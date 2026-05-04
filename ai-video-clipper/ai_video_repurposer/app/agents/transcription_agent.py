"""
Transcription Agent
Transcribes video audio using OpenAI Whisper (local) or Deepgram API.
Outputs full transcript + word-level timestamps for clip extraction.
"""
import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)


def extract_audio(video_path: str, output_path: Optional[str] = None) -> str:
    """
    Extract audio from video file using FFmpeg.
    Returns path to extracted .wav file.
    """
    if output_path is None:
        output_path = video_path.replace(".mp4", "_audio.wav").replace(".mkv", "_audio.wav")

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",                    # no video
        "-acodec", "pcm_s16le",   # PCM audio for Whisper
        "-ar", "16000",           # 16kHz sample rate
        "-ac", "1",               # mono
        output_path,
    ]
    logger.info("transcription.extract_audio", video=video_path)
    subprocess.run(cmd, check=True, capture_output=True, timeout=300)
    return output_path


def transcribe_with_whisper(audio_path: str, language: str = "en") -> dict:
    """
    Transcribe audio using OpenAI Whisper (local model).
    Returns {"text": full_text, "segments": [...]} with timestamps.
    """
    import whisper

    logger.info("transcription.whisper_start", audio=audio_path, language=language)

    # Use 'base' for speed, 'small' or 'medium' for better accuracy
    model = whisper.load_model("base")
    result = model.transcribe(
        audio_path,
        language=language if language != "auto" else None,
        verbose=False,
        word_timestamps=True,
    )

    segments = []
    for seg in result.get("segments", []):
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip(),
            "words": [
                {"word": w["word"], "start": w["start"], "end": w["end"]}
                for w in seg.get("words", [])
            ],
        })

    logger.info("transcription.whisper_done", segments=len(segments))
    return {
        "text": result["text"],
        "segments": segments,
        "language": result.get("language", language),
    }


def transcribe_with_deepgram(audio_path: str, language: str = "en") -> dict:
    """
    Transcribe using Deepgram API (faster, cloud-based).
    Requires DEEPGRAM_API_KEY in settings.
    """
    import httpx

    logger.info("transcription.deepgram_start", audio=audio_path)

    with open(audio_path, "rb") as f:
        audio_data = f.read()

    headers = {
        "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
        "Content-Type": "audio/wav",
    }
    params = {
        "model": "nova-2",
        "language": language,
        "smart_format": "true",
        "utterances": "true",
        "words": "true",
        "punctuate": "true",
    }

    response = httpx.post(
        "https://api.deepgram.com/v1/listen",
        headers=headers,
        params=params,
        content=audio_data,
        timeout=300,
    )
    response.raise_for_status()
    data = response.json()

    channel = data["results"]["channels"][0]["alternatives"][0]
    words = channel.get("words", [])

    # Build segments from utterances
    utterances = data["results"].get("utterances", [])
    segments = []
    for utt in utterances:
        segments.append({
            "start": utt["start"],
            "end": utt["end"],
            "text": utt["transcript"].strip(),
            "words": [
                {"word": w["word"], "start": w["start"], "end": w["end"]}
                for w in utt.get("words", [])
            ],
        })

    logger.info("transcription.deepgram_done", segments=len(segments))
    return {
        "text": channel["transcript"],
        "segments": segments,
        "language": language,
    }


def build_timestamped_transcript(segments: list) -> str:
    """
    Build a human-readable timestamped transcript string for the AI prompt.
    Format: [00:01.2 - 00:05.8] Text here
    """
    lines = []
    for seg in segments:
        start = seg["start"]
        end = seg["end"]

        def fmt(t):
            m, s = divmod(t, 60)
            return f"{int(m):02d}:{s:05.2f}"

        lines.append(f"[{fmt(start)} - {fmt(end)}] {seg['text']}")
    return "\n".join(lines)


def run_transcription_agent(
    video_path: str,
    language: str = "en",
    use_deepgram: bool = False,
) -> dict:
    """
    Full transcription pipeline:
    1. Extract audio
    2. Transcribe (Whisper or Deepgram)
    3. Return structured result
    """
    audio_path = extract_audio(video_path)
    try:
        if use_deepgram and settings.DEEPGRAM_API_KEY:
            result = transcribe_with_deepgram(audio_path, language)
        else:
            result = transcribe_with_whisper(audio_path, language)

        result["timestamped_transcript"] = build_timestamped_transcript(result["segments"])
        return result
    finally:
        # Cleanup audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)
