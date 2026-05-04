from app.memory.vector_store import search_memory

async def retrieve_context(query: str, session_id: str, user_id: str, limit: int = 5) -> list[str]:
    """
    Retrieves relevant context chunks from the vector store based on the query and session.
    """
    # In a more advanced version, we could use the Planner's intent here
    # to perform hybrid search or multi-query retrieval.
    context = await search_memory(query, session_id, user_id, limit=limit)
    return context
