from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
import json
import qrcode
import os
from io import BytesIO

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.medical import MedicalRecord
from app.schemas.emergency import (
    EmergencyQRRead, EmergencyQRConfigUpdate, 
    EmergencyProfileRead, EmergencyContactRead, EmergencyRecordRead
)
from app.core.config import settings
from app.core.encryption import encrypt_qr_token, decrypt_qr_token
from app.services.storage_service import storage_service

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

    # Load config from qr_secret_key (JSON string)
    config_dict = {
        "show_blood_group": True,
        "show_allergies": True,
        "show_emergency_contact": True,
        "show_chronic_conditions": True
    }
    if profile.qr_secret_key:
        try:
            config_dict.update(json.loads(profile.qr_secret_key))
        except:
            pass

    return {
        "qr_code_url": profile.qr_code_url,
        "config": config_dict
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
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Store config as JSON in qr_secret_key for now
    profile.qr_secret_key = json.dumps(config.model_dump())
    await db.commit()
    return {"success": True, "message": "Configuration updated"}

@router.post("/patient/emergency-qr/regenerate", response_model=EmergencyQRRead)
async def regenerate_emergency_qr(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Generate a new encrypted QR token and create the QR image file.
    """
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # 1. Generate encrypted token
    token = encrypt_qr_token(str(profile.id))
    
    # 2. Generate QR Image
    emergency_url = f"{settings.BASE_URL}/api/v1/emergency/{token}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(emergency_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    # 3. Save Image
    filename = f"qr_{profile.id}.png"
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    profile.qr_code_url = storage_service.upload_bytes(
        f"static/qrcodes/{filename}",
        buffer.getvalue(),
        "image/png",
    )
    
    # 4. Update Profile
    await db.commit()
    await db.refresh(profile)
    
    # Get current config
    config_dict = {}
    if profile.qr_secret_key:
        try:
            config_dict = json.loads(profile.qr_secret_key)
        except:
            pass
            
    return {
        "qr_code_url": profile.qr_code_url,
        "config": config_dict or {
            "show_blood_group": True,
            "show_allergies": True,
            "show_emergency_contact": True,
            "show_chronic_conditions": True
        }
    }

@router.get("/emergency/{qr_token}", response_model=EmergencyProfileRead)
async def public_emergency_access(
    qr_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    PUBLIC: Decode the QR token and return the patient's filtered emergency profile.
    """
    # 1. Decrypt token to get patient_id
    patient_id_str = decrypt_qr_token(qr_token)
    if not patient_id_str:
        raise HTTPException(status_code=400, detail="Invalid or expired emergency token.")
    
    try:
        patient_id = UUID(patient_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token content.")

    # 2. Fetch profile
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.id == patient_id)
    )
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Emergency profile not found.")

    # 3. Load Visibility Config
    config = {
        "show_blood_group": True,
        "show_allergies": True,
        "show_emergency_contact": True,
        "show_chronic_conditions": True
    }
    if profile.qr_secret_key:
        try:
            config.update(json.loads(profile.qr_secret_key))
        except:
            pass

    # 4. Fetch emergency records
    rec_result = await db.execute(
        select(MedicalRecord).where(
            MedicalRecord.patient_id == patient_id,
            MedicalRecord.is_emergency_visible == True
        )
    )
    records = rec_result.scalars().all()

    # 5. Build filtered response
    response = {
        "patient_name": profile.full_name,
        "gender": profile.gender
    }
    
    if config.get("show_blood_group"):
        response["blood_group"] = profile.blood_group
    
    if config.get("show_allergies"):
        response["allergies"] = profile.allergies or []
        
    if config.get("show_chronic_conditions"):
        response["chronic_conditions"] = profile.chronic_conditions or []
        
    if config.get("show_emergency_contact"):
        response["emergency_contact"] = {
            "name": profile.emergency_contact_name,
            "phone": profile.emergency_contact_phone
        }

    response["emergency_records"] = [
        {
            "title": r.title,
            "record_type": r.record_type,
            "url": r.file_url 
        } for r in records
    ]
    
    return response
