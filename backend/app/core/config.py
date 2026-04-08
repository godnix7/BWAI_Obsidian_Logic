from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

# nischay | base settings structure
class Settings(BaseSettings):
    PROJECT_NAME: str = "MEDI LOCKER DASHBOARD"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # antigravity | unified db urls
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/medilocker"
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # antigravity | unified jwt configuration
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_PRIVATE_KEY_PATH: str = "./keys/private.pem"
    JWT_PUBLIC_KEY_PATH: str = "./keys/public.pem"
    SECRET_KEY: str = "super-secret-web-key"

    # Patient / QR settings 
    QR_ENCRYPTION_KEY: str = "your-aes-key-32-chars-long-placeholder!!!"
    BASE_URL: str = "http://localhost:8002"

    # File storage
    FILE_STORAGE_BACKEND: str = "local"
    S3_BUCKET_NAME: str = "medilocker-records"
    
    # email settings
    MAIL_USERNAME: str = "user@example.com"
    MAIL_PASSWORD: str = "yourpassword"
    MAIL_FROM: str = "noreply@medilocker.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "MEDI LOCKER"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()

