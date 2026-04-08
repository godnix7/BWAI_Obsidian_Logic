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
    full_name: str
    # Optional Profile Extras
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    registration_number: Optional[str] = None

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
    force_password_change: bool = False
    is_hospital_created: bool = False

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user: UserResponse
    force_password_change: bool = False
