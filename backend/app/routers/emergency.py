from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.api.deps import get_db, get_current_patient, get_current_hospital
from app.models.user import User
from app.schemas.emergency import (
    EmergencyQRRead, EmergencyQRConfigUpdate, 
    EmergencyProfileRead
)
from app.services.qr_service import qr_service

router = APIRouter(tags=["Emergency QR"])

@router.get("/patient/emergency-qr", response_model=EmergencyQRRead)
async def get_emergency_qr_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Fetch the patient's current emergency QR configuration and token.
    """
    return await qr_service.get_qr_config(db, current_user.id)

@router.put("/patient/emergency-qr/config")
async def update_emergency_qr_config(
    config: EmergencyQRConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Update which fields are visible on the emergency landing page.
    """
    await qr_service.update_qr_config(db, current_user.id, config.model_dump())
    return {"success": True, "message": "Configuration updated"}

@router.post("/patient/emergency-qr/regenerate", response_model=EmergencyQRRead)
async def regenerate_emergency_qr(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Generate a new encrypted QR token and create the QR image file.
    """
    return await qr_service.regenerate_qr(db, current_user.id)

@router.get("/emergency/{qr_token}", response_model=EmergencyProfileRead)
async def public_emergency_access(
    qr_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    PUBLIC: Decode the QR token and return the patient's filtered emergency profile.
    Only basic safe data (blood group, allergies, emergency contact) is shown.
    NO medical records are returned in public access.
    """
    return await qr_service.get_public_emergency_profile(db, qr_token)

@router.get("/emergency/{qr_token}/full", response_model=EmergencyProfileRead)
async def hospital_emergency_access(
    qr_token: str,
    db: AsyncSession = Depends(get_db),
    current_hospital: User = Depends(get_current_hospital)
):
    """
    HOSPITAL ONLY: Decode the QR token and return the FULL emergency profile.
    Includes patient-flagged medical records (is_emergency_visible = True).
    Requires active hospital authentication.
    """
    # Note: Hospital auth is verified by get_current_hospital dependency.
    return await qr_service.get_full_emergency_profile(db, qr_token)

