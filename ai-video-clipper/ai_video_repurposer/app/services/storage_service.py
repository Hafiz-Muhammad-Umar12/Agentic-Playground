"""
Cloudinary Storage Service
Exclusively handles video uploads for the production pipeline.
"""
import cloudinary
import cloudinary.uploader
import structlog
from typing import Tuple
from app.core.config import settings

logger = structlog.get_logger(__name__)

# Configure Cloudinary globally
if settings.CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

def upload_clip(local_path: str, job_id: str, clip_id: str) -> Tuple[str, str]:
    """
    Unified upload function for Cloudinary.
    Returns (public_id, secure_url).
    """
    # Cloudinary public_id (sanitized for production)
    public_id = f"repurposer/{job_id}/{clip_id}".replace("/", "_")
    
    try:
        logger.info("cloudinary.upload_start", path=local_path, public_id=public_id)
        
        response = cloudinary.uploader.upload(
            local_path,
            public_id=public_id,
            resource_type="video",
            overwrite=True,
            invalidate=True
        )
        
        secure_url = response.get("secure_url")
        if not secure_url:
            raise ValueError("Cloudinary response did not contain secure_url")
            
        logger.info("cloudinary.upload_success", url=secure_url)
        # Returns (key, url) to match the database model expectation
        return public_id, secure_url
        
    except Exception as e:
        logger.error("cloudinary.upload_failed", error=str(e), path=local_path)
        raise RuntimeError(f"Cloudinary upload failed: {str(e)}")

def get_download_url(storage_key: str, expiry: int = 3600) -> str:
    """
    Returns the Cloudinary URL for the given public ID.
    Cloudinary URLs are persistent, so we can just construct it.
    """
    if storage_key.startswith("http"):
        return storage_key
        
    # Construct Cloudinary URL from public_id
    # Format: https://res.cloudinary.com/<cloud_name>/video/upload/<public_id>.mp4
    return f"https://res.cloudinary.com/{settings.CLOUDINARY_CLOUD_NAME}/video/upload/{storage_key}.mp4"
