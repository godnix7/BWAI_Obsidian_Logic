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
from app.models.finance import BillingRecord
from app.schemas.finance import BillingRead

router = APIRouter(prefix="/patient", tags=["Patient"])

def serialize_patient_profile(profile: PatientProfile, user: User) -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": profile.full_name,
        "date_of_birth": profile.date_of_birth,
        "gender": profile.gender,
        "phone": user.phone,
        "blood_group": profile.blood_group,
        "address": profile.address,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_phone": profile.emergency_contact_phone,
        "allergies": profile.allergies or [],
        "chronic_conditions": profile.chronic_conditions or [],
        "qr_code_url": profile.qr_code_url,
        "created_at": getattr(profile, "created_at", None),
    }

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
    return serialize_patient_profile(profile, current_user)

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
        profile = PatientProfile(
            user_id=current_user.id,
            **profile_data.model_dump(exclude_unset=True, exclude={"phone"})
        )
        db.add(profile)
    else:
        for field, value in profile_data.model_dump(exclude_unset=True, exclude={"phone"}).items():
            setattr(profile, field, value)

    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    
    await db.commit()
    await db.refresh(profile)
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "profile": serialize_patient_profile(profile, current_user)
    }

@router.get("/family", response_model=List[FamilyMemberRead])
async def list_family_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all family members associated with the current patient.
    """
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

@router.put("/family/{member_id}", response_model=FamilyMemberRead)
async def update_family_member(
    member_id: UUID,
    member_data: FamilyMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Update a family member's details.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()

    result = await db.execute(
        select(FamilyMember).where(FamilyMember.id == member_id, FamilyMember.patient_id == patient_id)
    )
    member = result.scalars().first()

    if not member:
        raise HTTPException(status_code=404, detail="Family member not found.")

    for field, value in member_data.model_dump().items():
        setattr(member, field, value)

    await db.commit()
    await db.refresh(member)
    return member

@router.delete("/family/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_member(
    member_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Delete a family member from the record.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()

    result = await db.execute(
        select(FamilyMember).where(FamilyMember.id == member_id, FamilyMember.patient_id == patient_id)
    )
    member = result.scalars().first()

    if not member:
        raise HTTPException(status_code=404, detail="Family member not found.")

    await db.delete(member)
    await db.commit()
    return None

# --- BILLING ---

@router.get("/bills", response_model=List[BillingRead])
async def list_patient_bills(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all billing records (invoices) for the current patient.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        return []
    
    result = await db.execute(
        select(BillingRecord).where(BillingRecord.patient_id == patient_id)
        .order_by(BillingRecord.created_at.desc())
    )
    return result.scalars().all()
