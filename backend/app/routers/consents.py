from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.api.deps import get_db, get_current_patient, get_current_doctor, get_current_hospital
from app.models.user import User
from app.schemas.clinical import ConsentRead, ConsentCreate, ConsentUpdate, ConsentRecipientRead
from app.services.consent_service import consent_service

router = APIRouter(prefix="/patient/consents", tags=["Consents"])

@router.get("", response_model=List[ConsentRead])
async def list_consents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all data sharing consents granted by the patient.
    """
    patient_id = await consent_service.get_patient_id(db, current_user.id)
    return await consent_service.list_consents(db, patient_id)

@router.post("", response_model=ConsentRead, status_code=status.HTTP_201_CREATED)
async def grant_consent(
    consent_data: ConsentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Grant new data access consent to a doctor or hospital.
    """
    patient_id = await consent_service.get_patient_id(db, current_user.id)
    return await consent_service.grant_consent(db, patient_id, current_user.id, consent_data)

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
    return await consent_service.update_consent(db, id, current_user.id, consent_data)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_consent(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Revoke an active consent. (Soft-delete/Status update)
    """
    await consent_service.revoke_consent(db, id, current_user.id)
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
    return await consent_service.list_received_consents(db, current_user.id, "doctor")

@router.get("/hospital/received", response_model=List[ConsentRecipientRead])
async def list_received_consents_hospital(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    List all consents granted to the current hospital.
    """
    return await consent_service.list_received_consents(db, current_user.id, "hospital")
