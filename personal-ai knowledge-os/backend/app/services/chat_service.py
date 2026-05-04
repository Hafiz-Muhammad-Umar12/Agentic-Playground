from app.memory.memory_store import store_memory
from app.memory.memory_retriever import search_memory

def handle_chat(user_message: str):

    # Save memory
    store_memory(user_message)

    # Retrieve context
    memories = search_memory(user_message)

    context = "\n".join(memories)

    prompt = f"""
User Query: {user_message}

Memory Context:
{context}

Answer using context if useful.
"""

    response = generate_response(prompt)

    return {
        "plan": plan_query(user_message),
        "answer": response
    }