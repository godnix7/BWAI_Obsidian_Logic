from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends
from app.core.database import get_db
from app.models.user import User, UserRole
from app.core.security import get_current_user

# --- ROLE-BASED DEPENDENCIES ---

async def get_current_patient(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user is not a patient"
        )
    return user

async def get_current_doctor(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.doctor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user is not a doctor"
        )
    return user

async def get_current_hospital(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.hospital:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user is not a hospital"
        )
    return user
