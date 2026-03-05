from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://jarvis:jarvis_pass@localhost:5432/jarvis_db"
    sync_database_url: str = "postgresql+psycopg2://jarvis:jarvis_pass@localhost:5432/jarvis_db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    secret_key: str = "change-this-super-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # AI Providers
    gemini_api_key: str = ""
    openrouter_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    openrouter_model: str = "openai/gpt-4o-mini"

    # App
    app_name: str = "CodelessAI"
    app_version: str = "1.0.0"
    debug: bool = False
    allowed_origins: str = "*"

    # Storage
    upload_dir: str = "uploads/avatars"
    max_upload_size_mb: int = 5

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
