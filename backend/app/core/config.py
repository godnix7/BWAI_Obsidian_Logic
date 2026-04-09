from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional

# nischay | base settings structure
class Settings(BaseSettings):
    PROJECT_NAME: str = "MEDI LOCKER DASHBOARD"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # antigravity | unified db urls
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/medilocker"
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        """Ensure DATABASE_URL always uses the asyncpg driver.
        Railway injects postgres:// or postgresql:// — we force +asyncpg.
        """
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql+psycopg2://"):
            v = v.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        return v

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
    FILE_STORAGE_BACKEND: str = "local"  # local | s3
    S3_BUCKET_NAME: str = "medilocker-records"
    S3_ACCESS_KEY_ID: Optional[str] = None
    S3_SECRET_ACCESS_KEY: Optional[str] = None
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: Optional[str] = None
    S3_PUBLIC_BASE_URL: Optional[str] = None
    S3_USE_SSL: bool = True
    
    # email settings
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "MEDI LOCKER"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()

