import json
import qrcode
import os
from io import BytesIO
from uuid import UUID
from typing import Dict, Any, List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.profile import PatientProfile
from app.models.medical import MedicalRecord
from app.core.config import settings
from app.core.encryption import encrypt_qr_token, decrypt_qr_token
from app.services.storage_service import storage_service

class QRService:
    @staticmethod
    async def get_patient_profile(db: AsyncSession, user_id: UUID) -> PatientProfile:
        result = await db.execute(
            select(PatientProfile).where(PatientProfile.user_id == user_id)
        )
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        return profile

    @staticmethod
    def get_default_config() -> Dict[str, bool]:
        return {
            "show_name": True,
            "show_gender": True,
            "show_dob": True,
            "show_blood_group": True,
            "show_allergies": True,
            "show_emergency_contact": True,
            "show_chronic_conditions": True
        }

    @staticmethod
    def parse_config(stored_config: str) -> Dict[str, bool]:
        defaults = QRService.get_default_config()
        if not stored_config:
            return defaults
        try:
            config = json.loads(stored_config)
            return {k: v for k, v in config.items() if k in defaults}
        except:
            return defaults

    @staticmethod
    async def get_qr_config(db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        profile = await QRService.get_patient_profile(db, user_id)
        config = QRService.parse_config(profile.qr_secret_key)
        return {
            "qr_code_url": profile.qr_code_url,
            "config": config
        }

    @staticmethod
    async def update_qr_config(db: AsyncSession, user_id: UUID, config_data: Dict[str, bool]) -> bool:
        profile = await QRService.get_patient_profile(db, user_id)
        profile.qr_secret_key = json.dumps(config_data)
        await db.commit()
        return True

    @staticmethod
    async def regenerate_qr(db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        profile = await QRService.get_patient_profile(db, user_id)
        token = encrypt_qr_token(str(profile.id))
        emergency_url = f"{settings.BASE_URL}/api/v1/emergency/{token}"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(emergency_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        filename = f"qr_{profile.id}.png"
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        profile.qr_code_url = storage_service.upload_bytes(
            f"static/qrcodes/{filename}",
            buffer.getvalue(),
            "image/png",
        )
        await db.commit()
        await db.refresh(profile)
        return {
            "qr_code_url": profile.qr_code_url,
            "config": QRService.parse_config(profile.qr_secret_key)
        }

    @staticmethod
    async def get_public_emergency_profile(db: AsyncSession, qr_token: str) -> Dict[str, Any]:
        """
        LIMITED ACCESS: Return only blood group, allergies, contact, and chronic conditions.
        NO medical records shown here.
        """
        patient_id_str = decrypt_qr_token(qr_token)
        if not patient_id_str:
            raise HTTPException(status_code=400, detail="Invalid token.")
        patient_id = UUID(patient_id_str)

        result = await db.execute(select(PatientProfile).where(PatientProfile.id == patient_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found.")

        config = QRService.parse_config(profile.qr_secret_key)
        response = {
            "patient_name": profile.full_name if config.get("show_name") else "Emergency Patient",
            "blood_group": profile.blood_group if config.get("show_blood_group") else None,
            "allergies": profile.allergies if config.get("show_allergies") else [],
            "chronic_conditions": profile.chronic_conditions if config.get("show_chronic_conditions") else [],
            "emergency_contact": {
                "name": profile.emergency_contact_name,
                "phone": profile.emergency_contact_phone
            } if config.get("show_emergency_contact") else None
        }
        return response

    @staticmethod
    async def get_full_emergency_profile(db: AsyncSession, qr_token: str) -> Dict[str, Any]:
        """
        FULL ACCESS: Return complete emergency profile including flagged medical records.
        """
        patient_id_str = decrypt_qr_token(qr_token)
        if not patient_id_str:
            raise HTTPException(status_code=400, detail="Invalid token.")
        patient_id = UUID(patient_id_str)

        result = await db.execute(select(PatientProfile).where(PatientProfile.id == patient_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found.")

        # 1. Base profile data (bypass visibility config for hospitals if needed, but we follow general rule)
        response = {
            "id": profile.id,
            "full_name": profile.full_name,
            "gender": profile.gender,
            "date_of_birth": profile.date_of_birth,
            "blood_group": profile.blood_group,
            "allergies": profile.allergies or [],
            "chronic_conditions": profile.chronic_conditions or [],
            "emergency_contact": {
                "name": profile.emergency_contact_name,
                "phone": profile.emergency_contact_phone
            }
        }

        # 2. Fetch emergency records
        rec_result = await db.execute(
            select(MedicalRecord).where(
                MedicalRecord.patient_id == profile.id,
                MedicalRecord.is_emergency_visible == True
            )
        )
        records = rec_result.scalars().all()
        response["emergency_records"] = [
            {
                "title": r.title,
                "record_type": r.record_type,
                "url": r.file_url 
            } for r in records
        ]
        return response

qr_service = QRService()

