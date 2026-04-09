from pathlib import Path
import os
import tempfile
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MEDI LOCKER DASHBOARD"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("POSTGRES_PRISMA_URL")
        or "postgresql+psycopg://postgres:postgres@127.0.0.1:5432/medilocker"
    )
    REDIS_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        if value.startswith("postgresql+psycopg2://"):
            return value.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)
        return value

    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_PRIVATE_KEY_PATH: str = "./keys/private.pem"
    JWT_PUBLIC_KEY_PATH: str = "./keys/public.pem"
    SECRET_KEY: str = "super-secret-web-key"
    JWT_PRIVATE_KEY: Optional[str] = None
    JWT_PUBLIC_KEY: Optional[str] = None

    QR_ENCRYPTION_KEY: str = "your-aes-key-32-chars-long-placeholder!!!"
    BASE_URL: str = "http://localhost:8002"

    FILE_STORAGE_BACKEND: str = "local"
    S3_BUCKET_NAME: str = "medilocker-records"
    S3_ACCESS_KEY_ID: Optional[str] = None
    S3_SECRET_ACCESS_KEY: Optional[str] = None
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: Optional[str] = None
    S3_PUBLIC_BASE_URL: Optional[str] = None
    S3_USE_SSL: bool = True

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

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    SERVERLESS: bool = False
    LOCAL_STORAGE_ROOT: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def local_storage_root(self) -> Path:
        if self.LOCAL_STORAGE_ROOT:
            return Path(self.LOCAL_STORAGE_ROOT).resolve()
        if self.SERVERLESS:
            return Path(tempfile.gettempdir()) / "medilocker"
        return Path(__file__).resolve().parent.parent.parent / "static"


settings = Settings()
