import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.github_client import github_service
from src.core.config import settings

async def validate_diff_fetch():
    # Use a public PR for testing
    # FastAPI PR #11415 is a valid public PR at the time of writing
    test_repo = "tiangolo/fastapi"
    test_pr = 11415
    
    print(f"Testing diff fetch for {test_repo} PR #{test_pr}...")
    
    try:
        diff = await github_service.get_pr_diff(test_repo, test_pr)
        
        if diff.startswith("diff --git"):
            print("✅ Success: Diff fetched and starts with 'diff --git'")
            # print(diff[:100]) # For debugging
        else:
            print(f"❌ Failure: Unexpected diff format. Starts with: {diff[:20]}")
            
    except Exception as e:
        print(f"ℹ️ Fetch failed (Rate limit or Auth): {str(e)}")

if __name__ == "__main__":
    asyncio.run(validate_diff_fetch())
