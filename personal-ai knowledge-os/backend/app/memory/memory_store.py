from app.memory.qdrant_client import client
from app.llm.embedding_tool import get_embedding
from qdrant_client.models import PointStruct
import uuid
from app.llm.embedding_tool import get_embedding

COLLECTION = "knowledge_os"

def store_memory(text: str):
    vector = get_embedding(text)

    client.upsert(
        collection_name=COLLECTION,
        points=[
            PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={"text": text}
            )
        ]
    )