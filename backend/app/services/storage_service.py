from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse
import os
import hmac
import hashlib
import time
import boto3
from botocore.client import Config

from app.core.config import settings


class StorageService:
    def __init__(self) -> None:
        self.backend = (settings.FILE_STORAGE_BACKEND or "local").lower()
        self.bucket = settings.S3_BUCKET_NAME
        self.endpoint_url = settings.S3_ENDPOINT_URL
        self.public_base_url = settings.S3_PUBLIC_BASE_URL.rstrip("/") if settings.S3_PUBLIC_BASE_URL else None
        self._client = None

    def _is_s3(self) -> bool:
        return (
            self.backend == "s3"
            and bool(settings.S3_ACCESS_KEY_ID)
            and bool(settings.S3_SECRET_ACCESS_KEY)
            and bool(self.bucket)
        )

    def _client_instance(self):
        if self._client is None:
            self._client = boto3.client(
                "s3",
                aws_access_key_id=settings.S3_ACCESS_KEY_ID,
                aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
                region_name=settings.S3_REGION,
                endpoint_url=self.endpoint_url,
                use_ssl=settings.S3_USE_SSL,
                config=Config(signature_version="s3v4"),
            )
        return self._client

    def _local_path(self, key: str) -> str:
        return key.replace("/", os.sep)

    def _local_url(self, key: str) -> str:
        return "/" + key.replace(os.sep, "/")

    def _s3_url(self, key: str) -> str:
        if self.public_base_url:
            return f"{self.public_base_url}/{key}"

        if self.endpoint_url:
            return f"{self.endpoint_url.rstrip('/')}/{self.bucket}/{key}"

        region = settings.S3_REGION
        return f"https://{self.bucket}.s3.{region}.amazonaws.com/{key}"

    def upload_bytes(self, key: str, content: bytes, content_type: str) -> str:
        if self._is_s3():
            client = self._client_instance()
            client.upload_fileobj(
                BytesIO(content),
                self.bucket,
                key,
                ExtraArgs={"ContentType": content_type},
            )
            return self._s3_url(key)

        local_path = self._local_path(key)
        Path(local_path).parent.mkdir(parents=True, exist_ok=True)
        with open(local_path, "wb") as file_handle:
            file_handle.write(content)
        return self._local_url(key)

    def generate_signed_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generates a secure, temporary URL for a file.
        - Uses native S3 presigned URLs if S3 is active.
        - Uses HMAC-signed custom URLs for local storage.
        """
        if self._is_s3():
            client = self._client_instance()
            return client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )

        # Local HMAC Signing Logic
        expiry = int(time.time()) + expires_in
        message = f"{key}:{expiry}".encode()
        signature = hmac.new(
            settings.SECRET_KEY.encode(),
            message,
            hashlib.sha256
        ).hexdigest()

        return f"{settings.BASE_URL}/api/v1/files/download?key={key}&expires={expiry}&signature={signature}"

    def verify_local_signature(self, key: str, expires: int, signature: str) -> bool:
        """Verifies if the HMAC signature is valid and not expired."""
        if int(time.time()) > expires:
            return False
            
        message = f"{key}:{expires}".encode()
        expected = hmac.new(
            settings.SECRET_KEY.encode(),
            message,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected, signature)

    def upload_fileobj(self, key: str, file_obj, content_type: str) -> str:
        content = file_obj.read()
        return self.upload_bytes(key, content, content_type)

    def delete(self, stored_url: Optional[str]) -> None:
        if not stored_url:
            return

        if self._is_s3():
            key = self.extract_key(stored_url)
            if key:
                self._client_instance().delete_object(Bucket=self.bucket, Key=key)
            return

        if stored_url.startswith("/"):
            local_path = stored_url.lstrip("/").replace("/", os.sep)
            if os.path.exists(local_path):
                os.remove(local_path)

    def extract_key(self, stored_url: Optional[str]) -> Optional[str]:
        if not stored_url:
            return None

        if stored_url.startswith("/"):
            return stored_url.lstrip("/")

        if self.public_base_url and stored_url.startswith(self.public_base_url):
            return stored_url[len(self.public_base_url) + 1 :]

        parsed = urlparse(stored_url)
        path = parsed.path.lstrip("/")
        if self.bucket and path.startswith(f"{self.bucket}/"):
            return path[len(self.bucket) + 1 :]
        return path or None


storage_service = StorageService()

