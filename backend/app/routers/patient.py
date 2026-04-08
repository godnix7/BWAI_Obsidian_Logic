from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.models.profile import PatientProfile, FamilyMember
from app.schemas.patient import (
    PatientProfileRead, PatientProfileUpdate, 
    ProfileUpdateResponse, FamilyMemberRead, FamilyMemberCreate
)

router = APIRouter(prefix="/patient", tags=["Patient"])

@router.get("/profile", response_model=PatientProfileRead)
async def get_patient_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Fetch the profile of the current logged-in patient.
    """
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found. Please complete your profile."
        )
    return profile

@router.put("/profile", response_model=ProfileUpdateResponse)
async def update_patient_profile(
    profile_data: PatientProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Update or initialize the patient profile.
    """
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    
    if not profile:
        # Initial creation if not exists
        profile = PatientProfile(
            user_id=current_user.id,
            **profile_data.model_dump(exclude_unset=True)
        )
        db.add(profile)
    else:
        # Update existing
        for field, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
    
    await db.commit()
    await db.refresh(profile)
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "profile": profile
    }

@router.get("/family", response_model=List[FamilyMemberRead])
async def list_family_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all family members associated with the current patient.
    """
    # First get the patient profile ID
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        return []
    
    result = await db.execute(
        select(FamilyMember).where(FamilyMember.patient_id == patient_id)
    )
    return result.scalars().all()

@router.post("/family", response_model=FamilyMemberRead, status_code=status.HTTP_201_CREATED)
async def add_family_member(
    member_data: FamilyMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Add a new family member to the patient's record.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add family member before creating a patient profile."
        )
    
    new_member = FamilyMember(
        patient_id=patient_id,
        **member_data.model_dump()
    )
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)
    return new_member
