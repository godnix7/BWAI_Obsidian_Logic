from datetime import datetime, timedelta
from typing import Any, Optional, Union
import jwt
from passlib.context import CryptContext
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pathlib import Path

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

import bcrypt
import redis.asyncio as redis

# Absolute path resolution logic
BASE_DIR = Path(__file__).resolve().parent.parent.parent
KEYS_DIR = BASE_DIR / "keys"

# Redis client for token blacklisting
redis_client = (
    redis.from_url(settings.REDIS_URL, decode_responses=True)
    if settings.REDIS_URL
    else None
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "RS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Load RS256 Keys with robust paths
def get_private_key():
    if settings.JWT_PRIVATE_KEY:
        return settings.JWT_PRIVATE_KEY.replace("\\n", "\n")
    key_path = KEYS_DIR / "private.pem"
    if not key_path.exists():
        raise FileNotFoundError(f"Private key not found at {key_path}")
    with open(key_path, "r") as f:
        return f.read()

def get_public_key():
    if settings.JWT_PUBLIC_KEY:
        return settings.JWT_PUBLIC_KEY.replace("\\n", "\n")
    key_path = KEYS_DIR / "public.pem"
    if not key_path.exists():
        raise FileNotFoundError(f"Public key not found at {key_path}")
    with open(key_path, "r") as f:
        return f.read()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# --- JWT Tokens ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, get_private_key(), algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, get_private_key(), algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, get_public_key(), algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

# --- Current User Dependency ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        if await redis_client.get(f"blacklist:{token}"):
            raise credentials_exception
    except Exception:
        pass

    try:
        payload = jwt.decode(token, get_public_key(), algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
        
    return user
