import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Startup Builder"
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str  # ✅ NO os.getenv

    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "startup_memory"

    STORAGE_PATH: str = "storage/projects"

    class Config:
        env_file = ".env"   # ✅ VERY IMPORTANT
        case_sensitive = True

settings = Settings()
