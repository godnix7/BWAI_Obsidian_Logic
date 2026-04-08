from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.medical import Prescription
from app.schemas.medical import PrescriptionRead

router = APIRouter(prefix="/patient/prescriptions", tags=["Prescriptions"])

@router.get("", response_model=List[PrescriptionRead])
async def list_prescriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all prescriptions for the current patient.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        return []

    # Eager load medications
    result = await db.execute(
        select(Prescription).where(Prescription.patient_id == patient_id)
        .options(selectinload(Prescription.medications))
        .order_by(Prescription.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{id}", response_model=PrescriptionRead)
async def get_prescription(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Get a single prescription with medication details.
    """
    result = await db.execute(
        select(Prescription).where(Prescription.id == id)
        .options(selectinload(Prescription.medications))
    )
    prescription = result.scalars().first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found.")
        
    return prescription
