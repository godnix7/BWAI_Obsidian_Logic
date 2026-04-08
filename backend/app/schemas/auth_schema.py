from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole
import uuid

# --- REQUEST SCHEMAS ---
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: UserRole

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- RESPONSE SCHEMAS ---
class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user: UserResponse

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
