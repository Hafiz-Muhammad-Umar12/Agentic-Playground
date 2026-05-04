from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_response(prompt: str) -> str:
    try:
        completion = client.chat.completions.create(
          model="llama-3.3-70b-versatile",  # fast + powerful
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        return completion.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"