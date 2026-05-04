from sentence_transformers import SentenceTransformer

# lightweight embedding model (FREE + fast)
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str):
    return model.encode(text).tolist()