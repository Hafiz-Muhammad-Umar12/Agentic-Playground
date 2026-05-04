import sys
import os

# Add backend to sys.path
sys.path.append(os.getcwd())

from app.core.config import settings

def debug():
    print("--- Pydantic Config Debug ---")
    print(f"Current Working Directory: {os.getcwd()}")
    print(f".env exists: {os.path.exists('.env')}")
    print(f"LLM_PROVIDER: {settings.LLM_PROVIDER}")
    print(f"GEMINI_API_KEY: '{settings.GEMINI_API_KEY}'")
    
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key":
        print("CRITICAL: GEMINI_API_KEY is not loaded correctly or still has placeholder value.")
    else:
        print("GEMINI_API_KEY appears to be loaded.")

    import google.generativeai as genai
    print(f"Configuring genai with key: '{settings.GEMINI_API_KEY}'")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        # We won't actually call it here to avoid consuming tokens/hitting invalid key error immediately if we just want to see if it's set
        print("GenAI model initialized.")
    except Exception as e:
        print(f"GenAI Init Error: {e}")

if __name__ == "__main__":
    debug()