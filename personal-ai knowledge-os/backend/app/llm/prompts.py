def build_chat_prompt(user_message: str) -> str:
    return f"""
You are an AI Knowledge Assistant.

User Query:
{user_message}

Give a helpful, clear and concise answer.
"""