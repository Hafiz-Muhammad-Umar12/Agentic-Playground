from app.memory.qdrant_client import QdrantMemoryClient

class VectorStoreTool:
    def __init__(self):
        self.client = QdrantMemoryClient()
        
    async def store(self, text: str):
        await self.client.insert(text)
        
    async def retrieve(self, query: str) -> str:
        return await self.client.search(query)