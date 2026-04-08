from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

async def register_user(db: AsyncSession, data) -> User:
    # 1. Check if user already exists
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.redis import redis_client

async def register_user(db: AsyncSession, data) -> User:
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email is already registered"
        )
    
    # 2. Create the user
    # Create the user
    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        role=data.role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Mock Email Send (can be expanded later)
    email_token = str(uuid.uuid4())
    if redis_client:
        await redis_client.setex(f"email_verify:{email_token}", 86400, new_user.email)
    print(f"MOCK EMAIL: Sent verification link to {new_user.email}: /auth/verify-email?token={email_token}")
    
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
        
    # 2. Generate tokens
    # 3. Generate tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

async def refresh_access_token(db: AsyncSession, refresh_token: str):
    from app.core.security import decode_token
    payload = decode_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
        
    new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": new_access_token, "token_type": "bearer"}
    # Store refresh token in redis to handle revocation (logout)
    if redis_client:
        await redis_client.setex(f"refresh_token:{str(user.id)}", 7 * 86400, refresh_token)
    
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}

async def refresh_access_token(db: AsyncSession, refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    if redis_client:
        stored_token = await redis_client.get(f"refresh_token:{user_id}")
        if stored_token != refresh_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or expired")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": new_access_token, "refresh_token": refresh_token, "user": user}

async def logout_user(user_id: str):
    if redis_client:
        await redis_client.delete(f"refresh_token:{user_id}")
    return True

async def request_password_reset(email: str):
    token = str(uuid.uuid4())
    if redis_client:
        await redis_client.setex(f"pwd_reset:{token}", 900, email) # 15 minutes
    print(f"MOCK EMAIL: Reset password link for {email}: /auth/reset-password?token={token}")
    return True

async def reset_password(db: AsyncSession, token: str, new_password: str):
    if not redis_client:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Redis not configured")
         
    email = await redis_client.get(f"pwd_reset:{token}")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.password_hash = hash_password(new_password)
    await db.commit()
    await redis_client.delete(f"pwd_reset:{token}")
    return True
