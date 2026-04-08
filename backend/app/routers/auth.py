from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.core.security import get_current_user

from app.schemas.auth_schema import (
    RegisterRequest, LoginRequest, AuthResponse, UserResponse, 
    RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.auth_service import (
    register_user, login_user, refresh_access_token, 
    logout_user, request_password_reset, reset_password
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new patient, doctor, or hospital"""
    return await register_user(db, data)

@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens (Access + Refresh)"""
    return await login_user(db, data.email, data.password)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently logged-in user's details"""
    return current_user

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Get a new access token using a refresh token"""
    return await refresh_access_token(db, data.refresh_token)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: User = Depends(get_current_user)):
    """Blacklist the refresh token so it cannot be used again"""
    await logout_user(str(current_user.id))
    return {"message": "Successfully logged out"}

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(data: ForgotPasswordRequest):
    """Generate a password reset link and send via email"""
    await request_password_reset(data.email)
    return {"message": "If that email exists, a reset link has been sent."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def set_new_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Set a new password using a token from email"""
    await reset_password(db, data.token, data.new_password)
    return {"message": "Password updated successfully"}
