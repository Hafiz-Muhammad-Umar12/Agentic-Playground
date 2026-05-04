"""
Caption + Hook Agent
1. Generate viral hooks + platform captions using Claude AI
2. Generate SRT subtitle files
3. Burn subtitles into video using FFmpeg
4. Translate subtitles to Urdu/Hindi if requested
"""
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import structlog

from app.core.config import settings
from app.services import ai_service

logger = structlog.get_logger(__name__)


# ─── SRT Generation ──────────────────────────────────────────

def seconds_to_srt_time(seconds: float) -> str:
    """Convert seconds to SRT timestamp format: 00:00:00,000"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def build_srt_from_segments(segments: list, start_offset: float = 0.0) -> str:
    """
    Build SRT subtitle content from transcript segments.
    Adjusts timestamps relative to clip start_offset.
    """
    srt_lines = []
    counter = 1

    for seg in segments:
        seg_start = seg["start"] - start_offset
        seg_end = seg["end"] - start_offset

        if seg_start < 0 or seg_end < 0:
            continue

        text = seg["text"].strip()
        if not text:
            continue

        # Split long lines for readability
        words = text.split()
        if len(words) > 8:
            mid = len(words) // 2
            text = " ".join(words[:mid]) + "\n" + " ".join(words[mid:])

        srt_lines.append(str(counter))
        srt_lines.append(f"{seconds_to_srt_time(seg_start)} --> {seconds_to_srt_time(seg_end)}")
        srt_lines.append(text)
        srt_lines.append("")
        counter += 1

    return "\n".join(srt_lines)


def write_srt_file(srt_content: str, output_path: str) -> str:
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(srt_content)
    return output_path


# ─── Subtitle Burning ────────────────────────────────────────

def burn_subtitles(
    video_path: str,
    srt_path: str,
    output_path: str,
    font_size: int = 24,
    font_color: str = "white",
    outline_color: str = "black",
    position: str = "bottom",  # bottom / center
) -> str:
    """
    Burn SRT subtitles into video using FFmpeg.
    Returns output video path.
    """
    # Subtitle style
    margin_v = 80 if position == "bottom" else 400
    style = (
        f"FontName=Arial,"
        f"FontSize={font_size},"
        f"PrimaryColour=&H00FFFFFF,"  # white
        f"OutlineColour=&H00000000,"  # black outline
        f"Outline=2,"
        f"Shadow=1,"
        f"Alignment=2,"              # bottom center
        f"MarginV={margin_v}"
    )

    # Escape path for ffmpeg subtitle filter
    srt_escaped = srt_path.replace("\\", "\\\\").replace(":", "\\:")

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"subtitles='{srt_escaped}':force_style='{style}'",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        output_path,
    ]

    logger.info("caption.burn_start", video=video_path, srt=srt_path)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode != 0:
        logger.error("caption.burn_failed", stderr=result.stderr[-500:])
        raise RuntimeError(f"Subtitle burn failed: {result.stderr[-300:]}")

    # Validate output file
    if not os.path.exists(output_path) or os.path.getsize(output_path) < 1024:
        raise RuntimeError(f"Subtitle burn produced an empty or corrupt file: {output_path}")

    logger.info("caption.burn_done", output=output_path)
    return output_path


# ─── Main Agent ──────────────────────────────────────────────

def run_caption_agent(
    clips: list[dict],
    all_segments: list[dict],
    video_title: str,
    language: str = "en",
    translate_to: Optional[str] = None,  # "ur", "hi", etc.
) -> list[dict]:
    """
    For each clip:
    1. Generate viral hook + platform caption via Claude
    2. Build SRT from matching transcript segments
    3. Optionally translate subtitles
    4. Burn subtitles into clip video

    Returns updated clips list with hook/caption/srt/captioned_path.
    """
    results = []

    for clip in clips:
        try:
            platform = clip.get("platform", "tiktok")
            clip_path = clip["local_clip_path"]
            clip_dir = str(Path(clip_path).parent)

            # 1. Use pre-generated content from insight agent (single-call architecture)
            platforms_content = clip.get("platforms_content", {})
            platform_content = platforms_content.get(platform, {})
            
            # Fallback if content missing
            if not platform_content:
                logger.warning("caption.missing_pregenerated_content", platform=platform)
                platform_content = {
                    "hook": clip.get("hook_text", "Check this out!"),
                    "caption": f"Amazing clip from {video_title}",
                    "hashtags": ["viral", platform]
                }

            # 2. Find relevant segments for this clip's time range
            start = clip["start_time"]
            end = clip["end_time"]
            clip_segments = [
                s for s in all_segments
                if s["end"] > start and s["start"] < end
            ]

            # 3. Build SRT
            srt_content = build_srt_from_segments(clip_segments, start_offset=start)

            # 4. Translate if needed
            if translate_to and translate_to != "en":
                srt_content = ai_service.translate_subtitles(srt_content, translate_to)

            srt_path = clip_path.replace(".mp4", ".srt")
            write_srt_file(srt_content, srt_path)

            # 5. Burn subtitles
            captioned_path = clip_path.replace(".mp4", "_captioned.mp4")
            burn_subtitles(
                video_path=clip_path,
                srt_path=srt_path,
                output_path=captioned_path,
            )

            results.append({
                **clip,
                "hook_text": platform_content.get("hook", clip.get("hook_text", "")),
                "caption": platform_content.get("caption", ""),
                "hashtags": platform_content.get("hashtags", []),
                "seo_title": platform_content.get("seo_title", ""),
                "cta": platform_content.get("cta", ""),
                "srt_path": srt_path,
                "captioned_clip_path": captioned_path,
                "final_clip_path": captioned_path,
            })

            logger.info("caption.clip_done", platform=platform)

        except Exception as e:
            logger.error("caption.clip_failed", error=str(e))
            # Still include clip without captions
            results.append({**clip, "final_clip_path": clip.get("local_clip_path")})
            continue

    return results
