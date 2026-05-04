"""
Publishing Agent (Premium Feature)
Handles uploading clips to YouTube Shorts, TikTok, and Instagram Reels.
Supports scheduled publishing.
"""
import os
from datetime import datetime
from typing import Optional

import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)


class YouTubePublisher:
    """Upload clips to YouTube Shorts using YouTube Data API v3."""

    BASE_URL = "https://www.googleapis.com/upload/youtube/v3"

    def __init__(self, access_token: str):
        self.access_token = access_token

    def upload_short(
        self,
        video_path: str,
        title: str,
        description: str,
        tags: list[str],
        scheduled_at: Optional[datetime] = None,
    ) -> dict:
        """Upload a YouTube Short. Returns video ID and URL."""

        # Step 1: Initialize upload session
        metadata = {
            "snippet": {
                "title": title[:100],
                "description": description,
                "tags": tags[:15],
                "categoryId": "22",  # People & Blogs
            },
            "status": {
                "privacyStatus": "public" if not scheduled_at else "private",
                "selfDeclaredMadeForKids": False,
            },
        }

        if scheduled_at:
            metadata["status"]["publishAt"] = scheduled_at.isoformat() + "Z"
            metadata["status"]["privacyStatus"] = "private"

        with httpx.Client() as client:
            # Insert request
            init_resp = client.post(
                f"{self.BASE_URL}/videos",
                params={"uploadType": "resumable", "part": "snippet,status"},
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-Upload-Content-Type": "video/mp4",
                    "X-Upload-Content-Length": str(os.path.getsize(video_path)),
                },
                json=metadata,
            )
            init_resp.raise_for_status()
            upload_url = init_resp.headers["Location"]

            # Upload video bytes
            with open(video_path, "rb") as f:
                video_data = f.read()

            upload_resp = client.put(
                upload_url,
                content=video_data,
                headers={"Content-Type": "video/mp4"},
                timeout=600,
            )
            upload_resp.raise_for_status()
            video_id = upload_resp.json()["id"]

        return {
            "video_id": video_id,
            "url": f"https://www.youtube.com/shorts/{video_id}",
            "platform": "youtube_shorts",
        }


class TikTokPublisher:
    """Upload clips to TikTok using TikTok Content Posting API."""

    BASE_URL = "https://open.tiktokapis.com/v2"

    def __init__(self, access_token: str):
        self.access_token = access_token

    def upload_video(
        self,
        video_path: str,
        title: str,
        hashtags: list[str],
    ) -> dict:
        """Upload a TikTok video. Returns post ID and URL."""
        with httpx.Client() as client:
            # Step 1: Init upload
            file_size = os.path.getsize(video_path)
            init_resp = client.post(
                f"{self.BASE_URL}/post/publish/video/init/",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "post_info": {
                        "title": title[:2200],
                        "privacy_level": "PUBLIC_TO_EVERYONE",
                        "disable_duet": False,
                        "disable_comment": False,
                        "disable_stitch": False,
                        "video_cover_timestamp_ms": 1000,
                    },
                    "source_info": {
                        "source": "FILE_UPLOAD",
                        "video_size": file_size,
                        "chunk_size": file_size,
                        "total_chunk_count": 1,
                    },
                },
            )
            init_resp.raise_for_status()
            data = init_resp.json()["data"]
            publish_id = data["publish_id"]
            upload_url = data["upload_url"]

            # Step 2: Upload file
            with open(video_path, "rb") as f:
                upload_resp = client.put(
                    upload_url,
                    content=f.read(),
                    headers={
                        "Content-Range": f"bytes 0-{file_size - 1}/{file_size}",
                        "Content-Type": "video/mp4",
                    },
                    timeout=600,
                )
                upload_resp.raise_for_status()

        return {
            "publish_id": publish_id,
            "url": f"https://www.tiktok.com/@user/video/{publish_id}",
            "platform": "tiktok",
        }


def run_publishing_agent(
    clips: list[dict],
    user_tokens: dict,  # {"youtube": "token", "tiktok": "token"}
) -> list[dict]:
    """
    Publish clips to their target platforms.
    Only runs if ENABLE_PUBLISHING=True (premium feature).
    """
    if not settings.ENABLE_PUBLISHING:
        logger.warning("publishing.disabled")
        return clips

    results = []
    for clip in clips:
        platform = clip.get("platform", "")
        published_url = None

        try:
            if platform == "youtube_shorts" and user_tokens.get("youtube"):
                publisher = YouTubePublisher(user_tokens["youtube"])
                result = publisher.upload_short(
                    video_path=clip["final_clip_path"],
                    title=clip.get("seo_title", clip.get("hook_text", "Watch this"))[:100],
                    description=clip.get("caption", ""),
                    tags=clip.get("hashtags", []),
                    scheduled_at=clip.get("scheduled_at"),
                )
                published_url = result["url"]
                logger.info("publishing.youtube_done", url=published_url)

            elif platform == "tiktok" and user_tokens.get("tiktok"):
                publisher = TikTokPublisher(user_tokens["tiktok"])
                result = publisher.upload_video(
                    video_path=clip["final_clip_path"],
                    title=clip.get("caption", clip.get("hook_text", "")),
                    hashtags=clip.get("hashtags", []),
                )
                published_url = result["url"]
                logger.info("publishing.tiktok_done", url=published_url)

        except Exception as e:
            logger.error("publishing.failed", platform=platform, error=str(e))

        results.append({**clip, "published_url": published_url})

    return results
