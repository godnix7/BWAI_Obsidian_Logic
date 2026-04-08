from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from datetime import datetime

from app.api.deps import get_db, get_current_patient, get_current_doctor, get_current_hospital
from app.models.user import User
from app.models.profile import PatientProfile, DoctorProfile, HospitalProfile
from app.models.clinical import Consent, ConsentStatus
from app.schemas.clinical import ConsentRead, ConsentCreate, ConsentUpdate, ConsentRecipientRead

router = APIRouter(prefix="/patient/consents", tags=["Consents"])

@router.get("", response_model=List[ConsentRead])
async def list_consents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all data sharing consents granted by the patient.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        return []

    result = await db.execute(
        select(Consent).where(Consent.patient_id == patient_id)
        .order_by(Consent.granted_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=ConsentRead, status_code=status.HTTP_201_CREATED)
async def grant_consent(
    consent_data: ConsentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Grant new data access consent to a doctor or hospital.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient profile not found.")

    new_consent = Consent(
        patient_id=patient_id,
        status=ConsentStatus.ACTIVE,
        **consent_data.model_dump()
    )
    
    db.add(new_consent)
    await db.commit()
    await db.refresh(new_consent)
    return new_consent

@router.put("/{id}", response_model=ConsentRead)
async def update_consent(
    id: UUID,
    consent_data: ConsentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Modify an existing consent (e.g., change access level or expiry).
    """
    result = await db.execute(
        select(Consent).where(Consent.id == id)
    )
    consent = result.scalars().first()
    
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found.")

    for field, value in consent_data.model_dump(exclude_unset=True).items():
        setattr(consent, field, value)
        
    await db.commit()
    await db.refresh(consent)
    return consent

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_consent(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Revoke an active consent. (Soft-delete/Status update)
    """
    result = await db.execute(
        select(Consent).where(Consent.id == id)
    )
    consent = result.scalars().first()
    
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found.")
    
    consent.status = ConsentStatus.REVOKED
    consent.revoked_at = datetime.now()
    await db.commit()
    return None

# --- GRANTEE / RECIPIENT ENDPOINTS ---

@router.get("/doctor/received", response_model=List[ConsentRecipientRead])
async def list_received_consents_doctor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    List all consents granted to the current doctor.
    """
    result = await db.execute(
        select(Consent)
        .options(selectinload(Consent.patient))
        .where(
            Consent.grantee_user_id == current_user.id,
            Consent.grantee_role == "doctor",
            Consent.status == ConsentStatus.ACTIVE
        )
        .order_by(Consent.granted_at.desc())
    )
    return result.scalars().all()

@router.get("/hospital/received", response_model=List[ConsentRecipientRead])
async def list_received_consents_hospital(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    List all consents granted to the current hospital.
    """
    result = await db.execute(
        select(Consent)
        .options(selectinload(Consent.patient))
        .where(
            Consent.grantee_user_id == current_user.id,
            Consent.grantee_role == "hospital",
            Consent.status == ConsentStatus.ACTIVE
        )
        .order_by(Consent.granted_at.desc())
    )
    return result.scalars().all()
