import os
from pydantic import Field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the absolute path to the directory where config.py is located
# then go up two levels to reach the backend root where .env is.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILE = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent Research System"
    VERSION: str = "1.0.0"

    LLM_PROVIDER: str = "gemini" 

    # Allow both GEMINI_API_KEY and GOOGLE_API_KEY
    GEMINI_API_KEY: str = Field("", alias="GOOGLE_API_KEY", validation_alias="GEMINI_API_KEY")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENAI_API_KEY: str = ""

    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "research_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE, 
        env_file_encoding="utf-8", 
        extra="ignore",
        populate_by_name=True # Allows using both the field name and the alias
    )

settings = Settings()

# Validation check at startup
if settings.LLM_PROVIDER == "gemini" and not settings.GEMINI_API_KEY:
    print("WARNING: LLM_PROVIDER is set to gemini but GEMINI_API_KEY is empty.")