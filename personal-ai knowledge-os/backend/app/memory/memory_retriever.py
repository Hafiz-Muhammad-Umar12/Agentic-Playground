from app.memory.qdrant_client import client
from app.llm.embedding_tool import get_embedding

COLLECTION = "knowledge_os"

def search_memory(query: str):
    vector = get_embedding(query)

    results = client.search(
        collection_name=COLLECTION,
        query_vector=vector,
        limit=3
    )

    return [r.payload["text"] for r in results]