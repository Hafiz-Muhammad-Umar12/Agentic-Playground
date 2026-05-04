import hmac
import hashlib
from src.core.config import settings

def verify_github_signature(payload_body: bytes, signature_header: str) -> bool:
    """
    Verifies that the payload was sent from GitHub by validating the HMAC signature.
    """
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    
    # GitHub Webhook Secret from environment
    secret = settings.GITHUB_WEBHOOK_SECRET.encode("utf-8")
    
    # Calculate HMAC SHA256
    hash_object = hmac.new(secret, msg=payload_body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + hash_object.hexdigest()
    
    # Secure comparison to prevent timing attacks
    return hmac.compare_digest(expected_signature, signature_header)
