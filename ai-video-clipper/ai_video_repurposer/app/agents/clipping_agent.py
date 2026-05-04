"""
Clip Generation Agent
Cuts video clips from the source video using FFmpeg.
Handles aspect ratio conversion, resolution normalization,
and optional face-tracking zoom (premium).
"""
import os
import subprocess
import uuid
from pathlib import Path
from typing import Optional

import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

# Platform output specs
PLATFORM_SPECS = {
    "tiktok":          {"width": 1080, "height": 1920, "fps": 30},  # 9:16
    "reels":           {"width": 1080, "height": 1920, "fps": 30},  # 9:16
    "youtube_shorts":  {"width": 1080, "height": 1920, "fps": 30},  # 9:16
    "default":         {"width": 1080, "height": 1920, "fps": 30},
}


def cut_clip(
    source_path: str,
    start_time: float,
    end_time: float,
    output_path: str,
    platform: str = "default",
) -> str:
    """
    Cut a clip from source video using FFmpeg.
    Auto-converts to vertical 9:16 format for short-form.
    Returns output_path.
    """
    spec = PLATFORM_SPECS.get(platform, PLATFORM_SPECS["default"])
    w, h, fps = spec["width"], spec["height"], spec["fps"]
    duration = end_time - start_time

    # FFmpeg vf filter: scale + pad to 9:16 (add black bars if needed)
    # For landscape → vertical: crop to center, scale to 9:16
    vf_filter = (
        f"scale={w}:{h}:force_original_aspect_ratio=increase,"
        f"crop={w}:{h},"
        f"fps={fps}"
    )

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start_time),
        "-i", source_path,
        "-t", str(duration),
        "-vf", vf_filter,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        output_path,
    ]

    logger.info(
        "clipping.cut_start",
        start=start_time, end=end_time, platform=platform, out=output_path
    )

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode != 0:
        logger.error("clipping.ffmpeg_error", stderr=result.stderr[-500:])
        raise RuntimeError(f"FFmpeg failed: {result.stderr[-300:]}")

    # Validate output file
    if not os.path.exists(output_path) or os.path.getsize(output_path) < 1024:
        raise RuntimeError(f"FFmpeg produced an empty or corrupt file: {output_path}")

    logger.info("clipping.cut_done", path=output_path, size=os.path.getsize(output_path))
    return output_path


def generate_thumbnail(clip_path: str, output_path: Optional[str] = None) -> str:
    """Extract a thumbnail from the middle of a clip."""
    if output_path is None:
        output_path = clip_path.replace(".mp4", "_thumb.jpg")

    cmd = [
        "ffmpeg", "-y",
        "-i", clip_path,
        "-vframes", "1",
        "-ss", "00:00:01",
        "-q:v", "2",
        output_path,
    ]
    subprocess.run(cmd, check=True, capture_output=True, timeout=30)
    return output_path


def run_clipping_agent(
    source_path: str,
    clip_candidates: list[dict],
    job_id: str,
    platforms: list[str],
) -> list[dict]:
    """
    Cut all clip candidates from source video.
    For each candidate × platform, produce one output clip.
    
    Returns list of clip dicts with added 'local_clip_path' field.
    """
    output_dir = Path(settings.TEMP_DIR) / job_id / "clips"
    output_dir.mkdir(parents=True, exist_ok=True)

    results = []

    for idx, candidate in enumerate(clip_candidates):
        start = candidate["start_time"]
        end = candidate["end_time"]

        for platform in platforms:
            clip_id = str(uuid.uuid4())
            output_path = str(output_dir / f"{clip_id}.mp4")

            try:
                cut_clip(
                    source_path=source_path,
                    start_time=start,
                    end_time=end,
                    output_path=output_path,
                    platform=platform,
                )

                # Generate thumbnail
                thumb_path = generate_thumbnail(output_path)

                results.append({
                    **candidate,
                    "clip_id": clip_id,
                    "platform": platform,
                    "local_clip_path": output_path,
                    "local_thumbnail_path": thumb_path,
                })
                logger.info("clipping.clip_done", clip_id=clip_id)

            except Exception as e:
                logger.error("clipping.clip_failed", clip_id=clip_id, error=str(e))
                continue

    logger.info("clipping.agent_done", total_clips=len(results))
    return results
