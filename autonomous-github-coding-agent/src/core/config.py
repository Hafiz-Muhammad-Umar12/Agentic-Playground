from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # GitHub Configuration
    GITHUB_TOKEN: str = ""
    GITHUB_WEBHOOK_SECRET: str = "dummy_secret"
    
    # AI Configuration
    GEMINI_API_KEY: str = ""
    
    # Retry Logic
    MAX_RETRIES: int = 3
    RETRY_DELAY_SECONDS: int = 5
    
    # App Settings
    APP_ENV: str = "development"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
