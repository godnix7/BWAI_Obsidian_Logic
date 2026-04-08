from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

# nischay | base settings structure
class Settings(BaseSettings):
    PROJECT_NAME: str = "MEDI LOCKER API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # antigravity | unified db urls
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/medilocker"
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # antigravity | unified jwt configuration
    # Auth
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_PRIVATE_KEY_PATH: str = "./keys/private.pem"
    JWT_PUBLIC_KEY_PATH: str = "./keys/public.pem"
    SECRET_KEY: str = "super-secret-hackathon-key" # Fallback if keys are not used

    # nischay | patient security
    # Patient / QR settings 
    QR_ENCRYPTION_KEY: str = "your-aes-key-32-chars-long-placeholder!!!"

    # nischay | cors settings
    # CORS
    ALLOWED_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()
