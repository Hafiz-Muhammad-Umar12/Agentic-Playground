import anthropic
from app.memory import get_history, add_message
from config.settings import settings

# Anthropic client
client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

# System prompt — yahan apne business ki info daalo
SYSTEM_PROMPT = """
You are a helpful customer support agent for a business.
Your job is to:
- Answer customer questions politely
- Help with orders, complaints, and general queries
- If you don't know something, say "Let me connect you with our team"
- Keep responses short and clear (this is WhatsApp, not email)
- Always respond in the same language the customer uses (Urdu or English)
"""

def get_ai_response(user_id: str, user_message: str) -> str:
    """
    User ka message lo, Claude ko bhejo, reply wapas lo
    """
    try:
        # Pehle user ka message history mein save karo
        add_message(user_id, "user", user_message)

        # Purani conversation history lo
        history = get_history(user_id)

        # Claude ko message bhejo
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=history
        )

        # Claude ka reply lo
        ai_reply = response.content[0].text

        # Reply bhi history mein save karo
        add_message(user_id, "assistant", ai_reply)

        return ai_reply

    except Exception as e:
        print(f"Claude Error: {e}")
        return "Sorry, kuch masla ho gaya. Thodi der baad try karein."