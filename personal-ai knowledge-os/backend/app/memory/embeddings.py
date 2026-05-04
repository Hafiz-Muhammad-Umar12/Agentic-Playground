import asyncio
from concurrent.futures import ThreadPoolExecutor
from sentence_transformers import SentenceTransformer

# Load model once at module level
model = SentenceTransformer("all-MiniLM-L6-v2")
# Use a thread pool to offload CPU-intensive embedding generation
executor = ThreadPoolExecutor(max_workers=4)

def _encode(text: str):
    """Synchronous encoding function to run in executor."""
    return model.encode(text).tolist()

async def get_embedding_async(text: str):
    """Asynchronous wrapper for embedding generation."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, _encode, text)
