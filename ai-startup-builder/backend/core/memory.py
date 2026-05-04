import logging
from qdrant_client import QdrantClient
from qdrant_client.http import models
from fastembed import TextEmbedding
from backend.core.config import settings

logger = logging.getLogger(__name__)

class MemorySystem:
    """
    Vector memory system using Qdrant and local embeddings.
    """
    def __init__(self):
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.model = TextEmbedding()
        self._ensure_collection()

    def _ensure_collection(self):
        """
        Creates the Qdrant collection if it doesn't exist.
        """
        collections = self.client.get_collections().collections
        exists = any(c.name == settings.QDRANT_COLLECTION for c in collections)
        
        if not exists:
            logger.info(f"Creating Qdrant collection: {settings.QDRANT_COLLECTION}")
            self.client.create_collection(
                collection_name=settings.QDRANT_COLLECTION,
                vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
            )

    def store(self, text: str, metadata: dict):
        """
        Encodes and stores text in the vector database.
        """
        embeddings = list(self.model.embed([text]))[0]
        self.client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=[
                models.PointStruct(
                    id=hash(text) & 0xFFFFFFFFFFFFFFFF, # Simple hash for ID
                    vector=embeddings.tolist(),
                    payload=metadata
                )
            ]
        )
        logger.info("Stored information in memory.")

    def search(self, query: str, limit: int = 3):
        """
        Retrieves relevant context from memory.
        """
        embeddings = list(self.model.embed([query]))[0]
        hits = self.client.search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=embeddings.tolist(),
            limit=limit
        )
        return [hit.payload for hit in hits]

# memory = MemorySystem()
memory = None