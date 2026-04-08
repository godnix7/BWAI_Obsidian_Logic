import uuid
import traceback
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.redis import redis_client

# nischay | user registration base
async def register_user(db: AsyncSession, data) -> User:
    try:
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email is already registered"
            )
        
        # Create the user
        new_user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            phone=data.phone,
            role=data.role,
            is_verified=False
        )
        
        db.add(new_user)
        await db.commit()
    except Exception as e:
        print("CATASTROPHIC REGISTRATION ERROR:")
        traceback.print_exc()
        raise e
    
    await db.refresh(new_user)

    # Initialize Role-Specific Profile
    from app.models.profile import PatientProfile, DoctorProfile, HospitalProfile
    from app.models.user import UserRole
    from datetime import date as py_date
    
    print(f"DEBUG: Starting profile init for {new_user.role} (ID: {new_user.id})")
    if new_user.role == UserRole.PATIENT:
        p_profile = PatientProfile(
            user_id=new_user.id,
            full_name=getattr(data, 'full_name', 'Patient User'),
            date_of_birth=py_date(1990, 1, 1),
            gender="Other"
        )
        new_user.patient_profile = p_profile
    elif new_user.role == UserRole.DOCTOR:
        d_profile = DoctorProfile(
            user_id=new_user.id,
            full_name=getattr(data, 'full_name', 'Doctor User'),
            specialization=getattr(data, 'specialization', 'General'),
            license_number=getattr(data, 'license_number', f"PENDING-{uuid.uuid4().hex[:8]}"),
            years_experience=0,
            consultation_fee=0
        )
        new_user.doctor_profile = d_profile
    elif new_user.role == UserRole.HOSPITAL:
        h_profile = HospitalProfile(
            user_id=new_user.id,
            hospital_name=getattr(data, 'hospital_name', 'New Hospital'),
            registration_number=getattr(data, 'registration_number', f"HOSP-{uuid.uuid4().hex[:8]}"),
            address="Pending Update",
            city="Pending",
            state="Pending",
            phone=data.phone or "Pending",
            email=data.email,
            type="Clinic"
        )
        new_user.hospital_profile = h_profile
        
    await db.commit()
    print(f"DEBUG: Profile successfully committed for USER_ID={new_user.id}")
        # We continue even if profile fails so user can at least login and update later
        # However, for features to work, they really need this profile.
    
    # Mock Email Verification
    email_token = str(uuid.uuid4())
    if redis_client:
        try:
            await redis_client.setex(f"email_verify:{email_token}", 86400, new_user.email)
        except Exception as e:
            print(f"Warning: Redis offline, skipping email verification cache ({e})")
    
    return new_user

# antigravity | unified login logic with tokens
async def login_user(db: AsyncSession, email: str, password: str):
    from app.models.user import UserRole

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
        
    # 3. Handle Lazy Profile Initialization (Fail-safe for broken registrations)
    from app.models.profile import PatientProfile, DoctorProfile, HospitalProfile
    from datetime import date
    
    profile_found = False
    if user.role == UserRole.PATIENT:
        res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
        if res.scalars().first(): profile_found = True
        else:
            user.patient_profile = PatientProfile(user_id=user.id, full_name="Unknown Patient", date_of_birth=date(1990,1,1), gender="Other")
    elif user.role == UserRole.DOCTOR:
        res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
        if res.scalars().first(): profile_found = True
        else:
            user.doctor_profile = DoctorProfile(user_id=user.id, full_name="Unknown Doctor", specialization="General", license_number=f"AUTO-{uuid.uuid4().hex[:6]}", years_experience=0, consultation_fee=0)
    elif user.role == UserRole.HOSPITAL:
        res = await db.execute(select(HospitalProfile).where(HospitalProfile.user_id == user.id))
        if res.scalars().first(): profile_found = True
        else:
            user.hospital_profile = HospitalProfile(user_id=user.id, hospital_name="Unknown Hospital", registration_number=f"AUTO-{uuid.uuid4().hex[:6]}", address="Unknown", city="Unknown", state="Unknown", phone="Unknown", email=user.email, type="Clinic")
    
    if not profile_found:
        await db.commit()
        await db.refresh(user)

    # 4. Generate tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token if redis is available
    if redis_client:
        try:
            await redis_client.setex(f"refresh_token:{str(user.id)}", 7 * 86400, refresh_token)
        except Exception:
            pass

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

# antigravity | token refresh mechanism
async def refresh_access_token(db: AsyncSession, refresh_token: str):
    from app.core.security import decode_token
    payload = decode_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user_id = payload.get("sub")
    
    # Optional: Redis revocation check
    if redis_client:
        try:
            stored_token = await redis_client.get(f"refresh_token:{user_id}")
            if stored_token and stored_token != refresh_token:
                raise HTTPException(status_code=401, detail="Token revoked")
        except Exception:
            pass

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
        
    new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": new_access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

async def logout_user(user_id: str):
    if redis_client:
        try:
            await redis_client.delete(f"refresh_token:{user_id}")
        except Exception:
            pass
    return True

async def request_password_reset(email: str):
    token = str(uuid.uuid4())
    if redis_client:
        try:
            await redis_client.setex(f"pwd_reset:{token}", 900, email)
        except Exception:
            pass
    return True

async def reset_password(db: AsyncSession, token: str, new_password: str):
    if not redis_client:
         raise HTTPException(status_code=500, detail="Redis connection required for password reset")
         
    email = await redis_client.get(f"pwd_reset:{token}")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = hash_password(new_password)
    await db.commit()
    await redis_client.delete(f"pwd_reset:{token}")
    return True
