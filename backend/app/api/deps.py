import uuid
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, Depends
from app.core.database import get_db
from app.models.user import User, UserRole
from app.core.security import get_current_user
from app.models.profile import PatientProfile, DoctorProfile, HospitalProfile

# antigravity | unified RBAC dependencies with Lazy Profile Initialization

async def get_current_patient(
    user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to ensure the current user is a patient and has a profile (lazily initialized if missing)."""
    if user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. User role is {user.role}, but 'PATIENT' is required."
        )
    
    # 1. Attempt to find existing profile
    result = await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
    profile = result.scalars().first()
    
    # 2. Lazy Initialization Fail-safe
    if not profile:
        print(f"DEBUG: Lazy initializing missing PatientProfile for user_id={user.id}")
        profile = PatientProfile(
            user_id=user.id,
            full_name="User Profile PENDING", # Default name until user updates
            date_of_birth=date(1990, 1, 1),
            gender="Other"
        )
        db.add(profile)
        await db.commit()
    
    return user

async def get_current_doctor(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to ensure the current user is a doctor and has a profile (lazily initialized if missing)."""
    if user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. User role is {user.role}, but 'DOCTOR' is required."
        )
    
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
    profile = result.scalars().first()
    
    if not profile:
        print(f"DEBUG: Lazy initializing missing DoctorProfile for user_id={user.id}")
        profile = DoctorProfile(
            user_id=user.id,
            full_name="Doctor Profile PENDING",
            specialization="General Practice",
            license_number=f"LICENSE-{uuid.uuid4().hex[:8]}",
            years_experience=0,
            consultation_fee=0
        )
        db.add(profile)
        await db.commit()
        
    return user

async def get_current_hospital(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to ensure the current user is a hospital and has a profile (lazily initialized if missing)."""
    if user.role != UserRole.HOSPITAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. User role is {user.role}, but 'HOSPITAL' is required."
        )
    
    result = await db.execute(select(HospitalProfile).where(HospitalProfile.user_id == user.id))
    profile = result.scalars().first()
    
    if not profile:
        print(f"DEBUG: Lazy initializing missing HospitalProfile for user_id={user.id}")
        profile = HospitalProfile(
            user_id=user.id,
            hospital_name="Hospital Name PENDING",
            registration_number=f"REG-{uuid.uuid4().hex[:8]}",
            address="PENDING UPDATE",
            city="PENDING",
            state="PENDING",
            phone="PENDING",
            email=user.email,
            type="Clinic"
        )
        db.add(profile)
        await db.commit()
        
    return user
