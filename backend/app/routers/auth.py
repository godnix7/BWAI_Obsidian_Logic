from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth_schema import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from app.services.auth_service import register_user, login_user, refresh_access_token
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: Request, data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new patient, doctor, or hospital"""
    new_user = await register_user(
        db, data, 
        ip_address=request.client.host, 
        user_agent=request.headers.get("user-agent")
    )
    return new_user

@router.post("/login", response_model=AuthResponse)
async def login(request: Request, data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return Access and Refresh JWT tokens"""
    auth_data = await login_user(
        db, data.email, data.password,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    return auth_data

@router.post("/refresh", response_model=dict)
async def refresh(refresh_token: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)):
    """Refresh the access token using a valid refresh token"""
    return await refresh_access_token(db, refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user profile"""
    return current_user

@router.post("/logout")
async def logout(request: Request, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Logout the current user (revoke token)"""
    from app.services.auth_service import logout_user
    await logout_user(
        db, str(current_user.id),
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    return {"success": True, "message": "Logged out successfully"}

@router.post("/change-password")
async def change_password_route(
    request: Request,
    old_password: str = Body(..., embed=True),
    new_password: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change current user password (clears force_password_change)"""
    from app.services.auth_service import change_user_password
    await change_user_password(
        db, current_user.id, old_password, new_password,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    return {"success": True, "message": "Password changed successfully"}

@router.post("/verify-email")
async def verify_email_route(request: Request, token: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)):
    """Verify email address with token from email link"""
    from app.services.auth_service import verify_email
    await verify_email(
        db, token,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    return {"success": True, "message": "Email verified successfully"}

