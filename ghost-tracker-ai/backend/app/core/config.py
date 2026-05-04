from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database — default SQLite for easy local dev; swap to Postgres for production
    DATABASE_URL: str = "sqlite:///./ghosttrack.db"

    # JWT
    SECRET_KEY: str = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # App
    APP_NAME: str = "GhostTrack"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
