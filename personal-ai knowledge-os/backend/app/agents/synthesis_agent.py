from app.llm.groq_provider import generate_completion

async def synthesize_answer(user_query: str, context: str, intent: str) -> str:
    """
    Synthesizes a final response using the user's query, retrieved context, and identified intent.
    """
    system_prompt = f"""
You are an expert AI Assistant within a Knowledge OS.
Your goal is to provide accurate, concise, and helpful answers based on the provided context.

Core Intent: {intent}

Retrieved Context:
{context}

Instructions:
1. Use the provided context to answer the user's query.
2. If the context doesn't contain the answer, rely on your general knowledge but mention it's not in the immediate session memory.
3. Be professional and direct.
"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_query}
    ]
    
    answer = await generate_completion(messages, temperature=0.5)
    return answer
