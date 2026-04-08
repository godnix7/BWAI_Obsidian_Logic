from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

async def register_user(db: AsyncSession, data) -> User:
    # 1. Check if user already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email is already registered"
        )
    
    # 2. Create the user
    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        role=data.role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def login_user(db: AsyncSession, email: str, password: str):
    # 1. Find user by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    # 2. Verify password and active status
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User account is inactive"
        )
        
    # 3. Generate token
    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    
    return {"access_token": token, "user": user}
