import google.generativeai as genai
import os
import sys

# Add backend to path to get settings if needed, but we'll just use the key directly for discovery
sys.path.append(os.getcwd())
from app.core.config import settings

def discover():
    print(f"--- Gemini SDK Discovery ---")
    try:
        import google.generativeai as genai
        # Try to get version
        try:
            import pkg_resources
            version = pkg_resources.get_distribution("google-generativeai").version
            print(f"SDK Version: {version}")
        except:
            print("Could not determine SDK version via pkg_resources")

        if not settings.GEMINI_API_KEY:
            print("Error: No GEMINI_API_KEY found in settings.")
            return

        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        print("\nAvailable Models (generateContent supported):")
        models = genai.list_models()
        count = 0
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name} (Display: {m.display_name})")
                count += 1
        
        if count == 0:
            print("No models found with 'generateContent' support.")
            
    except Exception as e:
        print(f"Discovery Error: {e}")

if __name__ == "__main__":
    discover()