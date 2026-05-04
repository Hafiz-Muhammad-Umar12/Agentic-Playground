import hmac
import hashlib
import json
import os
import sys

# Add project root to path for local imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.security import verify_github_signature
from src.models.github import WebhookPayload

def test_signature_verification():
    # Use the default "dummy_secret" from Settings
    secret = "dummy_secret"
    payload = b'{"test": "data"}'
    
    # Generate valid signature
    hash_obj = hmac.new(secret.encode(), payload, hashlib.sha256)
    valid_sig = "sha256=" + hash_obj.hexdigest()
    
    # Test valid
    assert verify_github_signature(payload, valid_sig) is True
    # Test invalid
    assert verify_github_signature(payload, "sha256=invalid") is False

def test_payload_parsing():
    mock_data = {
        "action": "opened",
        "pull_request": {
            "number": 1,
            "user": {"login": "octocat"}
        },
        "repository": {
            "full_name": "owner/repo"
        }
    }
    payload = WebhookPayload(**mock_data)
    assert payload.action == "opened"
    assert payload.pull_request.number == 1
    assert payload.pull_request.user.login == "octocat"
    assert payload.repository.full_name == "owner/repo"

if __name__ == "__main__":
    try:
        test_signature_verification()
        test_payload_parsing()
        print("✅ Webhook validation tests passed!")
    except Exception as e:
        print(f"❌ Tests failed: {str(e)}")
        sys.exit(1)
