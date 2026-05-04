from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue
import uuid
import logging
from app.core.config import settings
from app.memory.embeddings import get_embedding_async

logger = logging.getLogger(__name__)

# Initialize Async client
client = AsyncQdrantClient(url=settings.QDRANT_URL)
COLLECTION = "knowledge_os"

async def ensure_collection():
    """Ensures the collection exists in Qdrant."""
    collections = await client.get_collections()
    collection_names = [c.name for c in collections.collections]
    if COLLECTION not in collection_names:
        # MiniLM-L6-v2 produces 384 dimensional vectors
        from qdrant_client.models import VectorParams, Distance
        await client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
        logger.info(f"Created collection: {COLLECTION}")

async def store_memory(text: str, session_id: str, user_id: str):
    """Stores text with session and user metadata."""
    await ensure_collection()
    vector = await get_embedding_async(text)
    
    await client.upsert(
        collection_name=COLLECTION,
        points=[
            PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "text": text, 
                    "session_id": session_id, 
                    "user_id": user_id,
                    "type": "conversation"
                }
            )
        ]
    )

async def search_memory(query: str, session_id: str, user_id: str, limit: int = 5):
    """Searches memory filtered by session and user."""
    await ensure_collection()
    vector = await get_embedding_async(query)
    
    results = await client.search(
        collection_name=COLLECTION,
        query_vector=vector,
        query_filter=Filter(
            must=[
                FieldCondition(key="session_id", match=MatchValue(value=session_id)),
                FieldCondition(key="user_id", match=MatchValue(value=user_id))
            ]
        ),
        limit=limit
    )
    return [r.payload["text"] for r in results]
