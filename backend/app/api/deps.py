from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends
from app.core.database import get_db
from app.models.user import User, UserRole

# Mock Dependency for Current User
# This will be replaced by actual JWT auth later
async def get_current_user(db: AsyncSession = Depends(get_db)) -> User:
    """
    Temporary mock dependency. 
    In a real scenario, this would decode the JWT and fetch from DB.
    """
    # For now, we still return a 401 until the integrated Auth connects here
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication system not yet linked. Work in progress."
    )

async def get_current_patient(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.patient: # Note: new role might be lowercase 'patient' based on sujal branch
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return user
