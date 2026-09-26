from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    database_url: str
    internal_api_key: str

    ai_enabled: bool = True
    ai_provider: str = os.getenv("AI_PROVIDER")

    gemini_api_key: str = os.getenv("GEMINI_API_KEY")
    gemini_model: str = os.getenv("GEMINI_MODEL")
    gemini_embedding_model: str = os.getenv("GEMINI_EMBEDDING_MODEL")
    gemini_embedding_dimensions: int = os.getenv("GEMINI_EMBEDDING_DIMENSIONS")


settings = Settings()