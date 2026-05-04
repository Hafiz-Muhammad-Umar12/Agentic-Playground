"""
VectorMemory — agent long-term memory via Qdrant.
Stores and retrieves semantic context using OpenAI embeddings.
"""
from __future__ import annotations

import os
import uuid
import hashlib
from typing import Any

from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)


COLLECTION = "agent_memory"
DIMS       = 1536  # text-embedding-3-small dimensions


class VectorMemory:
    def __init__(self):
        self.client = AsyncQdrantClient(
            host=os.getenv("QDRANT_HOST", "localhost"),
            port=int(os.getenv("QDRANT_PORT", 6333)),
        )
        self.openai = AsyncOpenAI()
        self._ready = False

    async def _ensure_collection(self):
        if self._ready:
            return
        existing = [c.name for c in (await self.client.get_collections()).collections]
        if COLLECTION not in existing:
            await self.client.create_collection(
                collection_name=COLLECTION,
                vectors_config=VectorParams(size=DIMS, distance=Distance.COSINE),
            )
        self._ready = True

    async def upsert(self, agent_id: str, input_text: str, output_text: str):
        """Embed and store an input/output pair."""
        await self._ensure_collection()
        text   = f"Input: {input_text}\nOutput: {output_text}"
        vector = await self._embed(text)
        point_id = hashlib.md5(f"{agent_id}:{input_text}".encode()).hexdigest()
        point_id = str(uuid.UUID(point_id))

        await self.client.upsert(
            collection_name=COLLECTION,
            points=[
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={"agent_id": agent_id, "input": input_text, "output": output_text},
                )
            ],
        )

    async def search(self, agent_id: str, query: str, top_k: int = 3) -> list[str]:
        """Return top-k relevant past outputs for the given query."""
        await self._ensure_collection()
        vector = await self._embed(query)
        results = await self.client.search(
            collection_name=COLLECTION,
            query_vector=vector,
            query_filter=Filter(
                must=[FieldCondition(key="agent_id", match=MatchValue(value=agent_id))]
            ),
            limit=top_k,
        )
        return [
            f"[past] {r.payload['input']} → {r.payload['output']}"
            for r in results
            if r.score > 0.75
        ]

    async def _embed(self, text: str) -> list[float]:
        resp = await self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=text[:8000],
        )
        return resp.data[0].embedding