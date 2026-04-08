from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.finance import InsuranceRecord
from app.schemas.insurance import InsuranceRead, InsuranceCreate, InsuranceUpdate

router = APIRouter(prefix="/patient/insurance", tags=["Insurance"])

@router.get("", response_model=List[InsuranceRead])
async def list_insurance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all insurance records for the current patient.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        return []

    result = await db.execute(
        select(InsuranceRecord).where(InsuranceRecord.patient_id == patient_id)
    )
    return result.scalars().all()

@router.post("", response_model=InsuranceRead, status_code=status.HTTP_201_CREATED)
async def add_insurance(
    ins_data: InsuranceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Add a new insurance record.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient profile not found.")

    new_ins = InsuranceRecord(
        patient_id=patient_id,
        **ins_data.model_dump()
    )
    
    db.add(new_ins)
    await db.commit()
    await db.refresh(new_ins)
    return new_ins

@router.put("/{id}", response_model=InsuranceRead)
async def update_insurance(
    id: UUID,
    ins_data: InsuranceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Update an existing insurance record.
    """
    result = await db.execute(
        select(InsuranceRecord).where(InsuranceRecord.id == id)
    )
    ins = result.scalars().first()
    
    if not ins:
        raise HTTPException(status_code=404, detail="Insurance record not found.")

    for field, value in ins_data.model_dump(exclude_unset=True).items():
        setattr(ins, field, value)
        
    await db.commit()
    await db.refresh(ins)
    return ins

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insurance(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Remove an insurance record.
    """
    result = await db.execute(
        select(InsuranceRecord).where(InsuranceRecord.id == id)
    )
    ins = result.scalars().first()
    
    if not ins:
        raise HTTPException(status_code=404, detail="Insurance record not found.")
    
    await db.delete(ins)
    await db.commit()
    return None

@router.get("/{id}/document")
async def get_insurance_document_url(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Fetch the URL of the insurance policy document.
    """
    result = await db.execute(
        select(InsuranceRecord).where(InsuranceRecord.id == id)
    )
    ins = result.scalars().first()
    
    if not ins or not ins.document_url:
        raise HTTPException(status_code=404, detail="Policy document not found.")
        
    return {"document_url": ins.document_url}
