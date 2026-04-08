from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.schemas.medical import MedicalRecordRead, MedicalRecordUpdate, RecordType
from app.services.record_service import record_service

router = APIRouter(prefix="/patient/records", tags=["Medical Records"])

@router.get("", response_model=List[MedicalRecordRead])
async def list_medical_records(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all medical records for the current patient.
    """
    patient_id = await record_service.get_patient_id(db, current_user.id)
    return await record_service.list_records(db, patient_id)

@router.post("/upload", response_model=MedicalRecordRead, status_code=status.HTTP_201_CREATED)
async def upload_medical_record(
    title: str = Form(...),
    record_type: RecordType = Form(...),
    record_date: date = Form(...),
    description: Optional[str] = Form(None),
    is_emergency_visible: bool = Form(False),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Upload a medical record.
    """
    patient_id = await record_service.get_patient_id(db, current_user.id)
    return await record_service.upload_record(
        db, 
        patient_id, 
        current_user.id, 
        file, 
        title, 
        record_type, 
        record_date, 
        description, 
        is_emergency_visible
    )

@router.get("/{record_id}", response_model=MedicalRecordRead)
async def get_medical_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Fetch metadata for a single medical record.
    """
    return await record_service.get_record(db, record_id)

@router.get("/{record_id}/url")
async def get_medical_record_url(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    record = await record_service.get_record(db, record_id)
    return {"url": record.file_url}

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Delete a medical record.
    """
    await record_service.delete_record(db, record_id, current_user.id)
    return None
