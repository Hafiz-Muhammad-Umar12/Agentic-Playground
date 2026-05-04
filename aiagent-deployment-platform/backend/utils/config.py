from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "AI Agent Deployment Platform"
    database_url: str = ""
    redis_url: str = "redis://localhost:6379/0"
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
