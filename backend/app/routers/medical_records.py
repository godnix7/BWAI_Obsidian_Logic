from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import uuid4, UUID
from datetime import date
import shutil
import os

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.medical import MedicalRecord
from app.schemas.medical import MedicalRecordRead, MedicalRecordUpdate, RecordType

router = APIRouter(prefix="/patient/records", tags=["Medical Records"])

@router.get("", response_model=List[MedicalRecordRead])
async def list_medical_records(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all medical records for the current patient.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        return []

    result = await db.execute(
        select(MedicalRecord).where(MedicalRecord.patient_id == patient_id)
    )
    return result.scalars().all()

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
    NOTE: S3 storage is currently stubbed.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient profile not found.")

    # 1. Generate unique ID for the file
    file_id = str(uuid4())
    _, ext = os.path.splitext(file.filename)
    unique_filename = f"rec_{file_id}{ext}"
    
    # 2. Save physical file to static/records/
    storage_path = os.path.join("static", "records", unique_filename)
    try:
        with open(storage_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    
    # 3. Get file size
    file_size = os.path.getsize(storage_path)
    
    # 4. Save to Database
    file_url = f"/static/records/{unique_filename}"
    
    new_record = MedicalRecord(
        patient_id=patient_id,
        uploaded_by_user_id=current_user.id,
        record_type=record_type,
        title=title,
        description=description,
        file_url=file_url,
        file_name=file.filename,
        file_size_bytes=file_size,
        file_mime_type=file.content_type or "application/octet-stream",
        is_encrypted=True,
        is_emergency_visible=is_emergency_visible,
        record_date=record_date
    )
    
    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    return new_record

@router.get("/{record_id}", response_model=MedicalRecordRead)
async def get_medical_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Fetch metadata for a single medical record.
    """
    result = await db.execute(
        select(MedicalRecord).where(MedicalRecord.id == record_id)
    )
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")
        
    return record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Delete a medical record.
    """
    result = await db.execute(
        select(MedicalRecord).where(MedicalRecord.id == record_id)
    )
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")
    
    await db.delete(record)
    await db.commit()
    return None
