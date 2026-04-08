from datetime import datetime, timedelta
from typing import Any, Optional, Union
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "RS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Load private key for RS256 signing
    with open(settings.JWT_PRIVATE_KEY_PATH, "r") as f:
        private_key = f.read()
        
    encoded_jwt = jwt.encode(to_encode, private_key, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    # Load public key for RS256 verification
    with open(settings.JWT_PUBLIC_KEY_PATH, "r") as f:
        public_key = f.read()
        
    return jwt.decode(token, public_key, algorithms=[ALGORITHM])
