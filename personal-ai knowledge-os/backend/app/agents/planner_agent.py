from app.llm.groq_provider import generate_completion

async def analyze_intent(user_query: str) -> str:
    """
    Analyzes the user query to determine the core intent and optimize retrieval.
    """
    prompt = [
        {"role": "system", "content": "You are a planning agent for a Knowledge OS. Analyze the user's query and summarize their core intent in one concise sentence to help with information retrieval."},
        {"role": "user", "content": f"User Query: {user_query}"}
    ]
    
    intent = await generate_completion(prompt, temperature=0.1)
    return intent.strip()
