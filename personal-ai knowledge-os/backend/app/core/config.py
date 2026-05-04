from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "KnowledgeOS"
    ENV: str = "development"

    GROQ_API_KEY: str
    QDRANT_URL: str = "http://localhost:6333"

    class Config:
        env_file = ".env"

settings = Settings()