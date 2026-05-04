from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Meta WhatsApp
    meta_access_token: str
    meta_phone_number_id: str
    webhook_verify_token: str
    
    # Anthropic
    anthropic_api_key: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global instance — poori app mein yahi use hoga
settings = Settings()