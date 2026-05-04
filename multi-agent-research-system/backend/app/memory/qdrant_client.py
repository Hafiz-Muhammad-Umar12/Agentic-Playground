from qdrant_client import AsyncQdrantClient
from app.core.config import settings

class QdrantMemoryClient:
    def __init__(self):
        self.client = AsyncQdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.collection_name = "research_memory"
        
    async def insert(self, text: str):
        # Embed text and insert into Qdrant
        pass
        
    async def search(self, query: str) -> str:
        # Embed query, search Qdrant, return results
        return "mock vector search result"