from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
import json

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.medical import MedicalRecord
from app.schemas.emergency import (
    EmergencyQRRead, EmergencyQRConfigUpdate, 
    EmergencyProfileRead, EmergencyContactRead, EmergencyRecordRead
)

router = APIRouter(tags=["Emergency QR"])

@router.get("/patient/emergency-qr", response_model=EmergencyQRRead)
async def get_emergency_qr_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Fetch the patient's current emergency QR configuration and token.
    """
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    return {
        "qr_code_url": profile.qr_code_url,
        "config": {
            "show_blood_group": True,
            "show_allergies": True,
            "show_emergency_contact": True,
            "show_chronic_conditions": True
        }
    }

@router.put("/patient/emergency-qr/config")
async def update_emergency_qr_config(
    config: EmergencyQRConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Update which fields are visible on the emergency landing page.
    """
    # Logic to save config in DB (could be a JSONB field in PatientProfile)
    return {"success": True, "message": "Configuration updated"}

@router.get("/emergency/{qr_token}", response_model=EmergencyProfileRead)
async def public_emergency_access(
    qr_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    PUBLIC: Decode the QR token and return the patient's emergency profile.
    NOTE: Structurally implemented. Decryption logic placeholder.
    """
    # 1. In a real scenario: Decrypt qr_token using AES-256-GCM with master key
    # 2. Extract patient_id from decrypted payload
    # For now, we simulate by assuming qr_token is the patient_id (for development testing)
    try:
        patient_id = UUID(qr_token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid emergency token.")

    # Fetch profile and records flagged as emergency visible
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.id == patient_id)
    )
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Emergency profile not found.")

    # Fetch records marked for emergency
    rec_result = await db.execute(
        select(MedicalRecord).where(
            MedicalRecord.patient_id == patient_id,
            MedicalRecord.is_emergency_visible == True
        )
    )
    records = rec_result.scalars().all()

    return {
        "patient_name": profile.full_name,
        "blood_group": profile.blood_group,
        "gender": profile.gender,
        "allergies": profile.allergies or [],
        "chronic_conditions": profile.chronic_conditions or [],
        "emergency_contact": {
            "name": profile.emergency_contact_name,
            "phone": profile.emergency_contact_phone
        },
        "emergency_records": [
            {
                "title": r.title,
                "record_type": r.record_type,
                "url": r.file_url # In real app, generate short-lived presigned URL
            } for r in records
        ]
    }
