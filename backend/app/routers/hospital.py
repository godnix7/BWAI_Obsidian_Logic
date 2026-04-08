from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import date
import shutil
import os

from app.api.deps import get_db, get_current_hospital
from app.models.user import User
from app.models.profile import HospitalProfile, PatientProfile
from app.models.medical import MedicalRecord, RecordType
from app.models.clinical import Consent, ConsentStatus
from app.schemas.medical import MedicalRecordRead

router = APIRouter(prefix="/hospital", tags=["Hospital"])

@router.get("/profile")
async def get_hospital_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    Fetch the profile of the current hospital.
    """
    result = await db.execute(
        select(HospitalProfile).where(HospitalProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Hospital profile not found.")
    return profile

@router.post("/lab-reports", response_model=MedicalRecordRead, status_code=status.HTTP_201_CREATED)
async def upload_lab_report(
    patient_id: UUID = Form(...),
    title: str = Form(...),
    record_date: date = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    Hospital uploads a lab report for a patient.
    Requires an ACTIVE consent from the patient.
    """
    # 1. Get current hospital profile ID
    hosp_res = await db.execute(
        select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id)
    )
    hospital_profile_id = hosp_res.scalars().first()
    
    if not hospital_profile_id:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hospital profile not found.")

    # 2. Verify Consent
    # Check if there is an ACTIVE consent for this hospital from the patient
    consent_res = await db.execute(
        select(Consent).where(
            Consent.patient_id == patient_id,
            Consent.grantee_user_id == current_user.id,
            Consent.status == ConsentStatus.ACTIVE
        )
    )
    consent = consent_res.scalars().first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="No active consent found from the patient to upload reports."
        )

    # 3. File Processing (Unique ID)
    file_id = str(uuid4())
    _, ext = os.path.splitext(file.filename)
    unique_filename = f"lab_{file_id}{ext}"
    
    storage_path = os.path.join("static", "records", unique_filename)
    try:
        with open(storage_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")

    # 4. Save to Medical Records
    new_report = MedicalRecord(
        patient_id=patient_id,
        uploaded_by_user_id=current_user.id,
        record_type=RecordType.LAB_REPORT,
        title=title,
        description=description,
        file_url=f"/static/records/{unique_filename}",
        file_name=file.filename,
        file_size_bytes=os.path.getsize(storage_path),
        file_mime_type=file.content_type or "application/octet-stream",
        is_encrypted=True,
        is_emergency_visible=False, # Default to false for privacy
        record_date=record_date
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report

@router.get("/lab-reports", response_model=List[MedicalRecordRead])
async def list_uploaded_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    List all reports uploaded by this hospital.
    """
    result = await db.execute(
        select(MedicalRecord).where(MedicalRecord.uploaded_by_user_id == current_user.id)
    )
    return result.scalars().all()
