import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.ai_reviewer import ai_reviewer
from src.core.config import settings

async def validate_ai_review():
    print("Testing Gemini AI Reviewer...")
    
    if not settings.GEMINI_API_KEY:
        print("❌ Error: GEMINI_API_KEY is not set in .env")
        return

    # Mock diff with an obvious security flaw (SQL Injection)
    mock_diff = """
diff --git a/app/db.py b/app/db.py
index 1234567..89abcdef 100644
--- a/app/db.py
+++ b/app/db.py
@@ -10,5 +10,5 @@ def get_user(username):
-    query = "SELECT * FROM users WHERE username = ?"
-    return db.execute(query, (username,))
+    query = f"SELECT * FROM users WHERE username = '{username}'"
+    return db.execute(query)
"""

    try:
        review = await ai_reviewer.generate_review("owner/demo-repo", 42, mock_diff)
        print("\n--- AI Review Output ---")
        print(review)
        print("------------------------\n")
        
        if "🔍 Issues Found" in review and ("SQL" in review.upper() or "INJECTION" in review.upper()):
            print("✅ Success: AI correctly identified the security issue.")
        else:
            print("⚠️ Warning: AI output did not contain expected sections or findings.")
            
    except Exception as e:
        print(f"❌ Review failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(validate_ai_review())
