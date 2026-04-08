import uuid
import traceback
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.redis import redis_client
from app.services.audit_service import audit_service

# nischay | user registration base with improved error handling
async def register_user(db: AsyncSession, data, ip_address: str = None, user_agent: str = None) -> User:
    from sqlalchemy.exc import IntegrityError
    from app.models.profile import PatientProfile, DoctorProfile, HospitalProfile
    from app.models.user import UserRole
    from datetime import date as py_date

    try:
        # 1. Check if user already exists (Email)
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
            role=data.role,
            is_verified=False
        )
        
        db.add(new_user)
        # Flush to check for immediate integrity errors (like Phone uniqueness)
        await db.flush()

        # 3. Initialize Role-Specific Profile
        if data.role == UserRole.PATIENT:
            p_profile = PatientProfile(
                user_id=new_user.id,
                full_name=getattr(data, 'full_name', 'Patient User'),
                date_of_birth=py_date(1990, 1, 1),
                gender="Other"
            )
            db.add(p_profile)
        elif data.role == UserRole.DOCTOR:
            d_profile = DoctorProfile(
                user_id=new_user.id,
                full_name=getattr(data, 'full_name', 'Doctor User'),
                specialization=getattr(data, 'specialization', 'General'),
                license_number=getattr(data, 'license_number', f"PENDING-{uuid.uuid4().hex[:8]}"),
                years_experience=0,
                consultation_fee=0
            )
            db.add(d_profile)
        elif data.role == UserRole.HOSPITAL:
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
            db.add(h_profile)
            
        # 4. Generate email verification token (antigravity | Hackathon simulation)
        email_token = uuid.uuid4().hex
        if redis_client:
            try:
                await redis_client.setex(f"email_verify:{email_token}", 24 * 3600, data.email)
            except Exception:
                pass

        # 5. Log action
        await audit_service.log_action(
            db, new_user.id, "USER_REGISTERED",
            ip_address=ip_address, user_agent=user_agent,
            metadata={"email": data.email, "role": data.role}
        )

        await db.commit()
        await db.refresh(new_user)
        
        setattr(new_user, "verification_token", email_token) 
        return new_user

    except IntegrityError as e:
        await db.rollback()
        detail = "Registration failed."
        if "users_phone_key" in str(e):
            detail = "Phone number is already registered."
        elif "users_email_key" in str(e):
            detail = "Email is already registered."
        raise HTTPException(status_code=400, detail=detail)
    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# antigravity | unified login logic with tokens
async def login_user(db: AsyncSession, email: str, password: str, ip_address: str = None, user_agent: str = None):
    from app.models.user import UserRole

    # 1. Find user by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    # 2. Verify password and active status
    if not user or not verify_password(password, user.password_hash):
        if user:
            await audit_service.log_action(
                db, user.id, "LOGIN_FAILED",
                ip_address=ip_address, user_agent=user_agent,
                metadata={"email": email}
            )
            await db.commit()
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
    
    # 4. Generate tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token if redis is available
    if redis_client:
        try:
            await redis_client.setex(f"refresh_token:{str(user.id)}", 7 * 86400, refresh_token)
        except Exception:
            pass

    # 5. Log action
    await audit_service.log_action(
        db, user.id, "USER_LOGGED_IN",
        ip_address=ip_address, user_agent=user_agent
    )
    
    await db.commit()
    await db.refresh(user)

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
        "force_password_change": user.force_password_change
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
        "user": user,
        "force_password_change": user.force_password_change
    }

async def logout_user(db: AsyncSession, user_id: str, ip_address: str = None, user_agent: str = None):
    if redis_client:
        try:
            await redis_client.delete(f"refresh_token:{user_id}")
        except Exception:
            pass
    
    # Log action
    from uuid import UUID
    await audit_service.log_action(
        db, UUID(user_id), "USER_LOGGED_OUT",
        ip_address=ip_address, user_agent=user_agent
    )
    await db.commit()
    return True

async def request_password_reset(email: str):
    token = str(uuid.uuid4())
    if redis_client:
        try:
            await redis_client.setex(f"pwd_reset:{token}", 900, email)
        except Exception:
            pass
    return True

async def reset_password(db: AsyncSession, token: str, new_password: str, ip_address: str = None, user_agent: str = None):
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
    user.force_password_change = False # Clear flag after reset
    
    # Log action
    await audit_service.log_action(
        db, user.id, "PASSWORD_RESET",
        ip_address=ip_address, user_agent=user_agent
    )
    
    await db.commit()
    await redis_client.delete(f"pwd_reset:{token}")
    return True

async def verify_email(db: AsyncSession, token: str, ip_address: str = None, user_agent: str = None):
    if not redis_client:
         raise HTTPException(status_code=500, detail="Redis connection required for email verification")
         
    email = await redis_client.get(f"email_verify:{token}")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_verified = True
    
    # Log action
    await audit_service.log_action(
        db, user.id, "EMAIL_VERIFIED",
        ip_address=ip_address, user_agent=user_agent
    )
    
    await db.commit()
    await redis_client.delete(f"email_verify:{token}")
    return True

async def change_user_password(db: AsyncSession, user_id: uuid.UUID, old_password: str, new_password: str, ip_address: str = None, user_agent: str = None):
    """Service to change password, handles force_password_change flag"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user or not verify_password(old_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid current password")
        
    user.password_hash = hash_password(new_password)
    user.force_password_change = False
    
    await audit_service.log_action(
        db, user.id, "PASSWORD_CHANGED",
        ip_address=ip_address, user_agent=user_agent
    )
    
    await db.commit()
    return True

