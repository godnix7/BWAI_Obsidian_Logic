from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException, status

from app.models.clinical import Consent, ConsentStatus
from app.models.profile import PatientProfile
from app.services.audit_service import audit_service
from app.schemas.clinical import ConsentCreate, ConsentUpdate

class ConsentService:
    @staticmethod
    async def get_patient_id(db: AsyncSession, user_id: UUID) -> UUID:
        res = await db.execute(
            select(PatientProfile.id).where(PatientProfile.user_id == user_id)
        )
        patient_id = res.scalars().first()
        if not patient_id:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        return patient_id

    @staticmethod
    async def list_consents(db: AsyncSession, patient_id: UUID) -> List[Consent]:
        result = await db.execute(
            select(Consent).where(Consent.patient_id == patient_id)
            .order_by(Consent.granted_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def grant_consent(db: AsyncSession, patient_id: UUID, user_id: UUID, data: ConsentCreate) -> Consent:
        new_consent = Consent(
            patient_id=patient_id,
            status=ConsentStatus.ACTIVE,
            **data.model_dump()
        )
        db.add(new_consent)
        
        # Log action
        await audit_service.log_action(
            db, user_id, "CONSENT_GRANTED",
            resource_type="consent", resource_id=new_consent.id,
            metadata={"grantee_user_id": str(data.grantee_user_id), "patient_id": str(patient_id)}
        )

        await db.commit()
        await db.refresh(new_consent)
        return new_consent

    @staticmethod
    async def update_consent(db: AsyncSession, consent_id: UUID, user_id: UUID, data: ConsentUpdate) -> Consent:
        result = await db.execute(
            select(Consent).where(Consent.id == consent_id)
        )
        consent = result.scalars().first()
        if not consent:
            raise HTTPException(status_code=404, detail="Consent record not found.")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(consent, field, value)
            
        # Log action
        await audit_service.log_action(
            db, user_id, "CONSENT_UPDATED",
            resource_type="consent", resource_id=consent_id,
            metadata={"updates": data.model_dump(exclude_unset=True)}
        )

        await db.commit()
        await db.refresh(consent)
        return consent

    @staticmethod
    async def revoke_consent(db: AsyncSession, consent_id: UUID, user_id: UUID) -> None:
        result = await db.execute(
            select(Consent).where(Consent.id == consent_id)
        )
        consent = result.scalars().first()
        if not consent:
            raise HTTPException(status_code=404, detail="Consent record not found.")
        
        consent.status = ConsentStatus.REVOKED
        consent.revoked_at = datetime.now()
        
        # Log action
        await audit_service.log_action(
            db, user_id, "CONSENT_REVOKED",
            resource_type="consent", resource_id=consent_id,
            metadata={"grantee_user_id": str(consent.grantee_user_id)}
        )

        await db.commit()

    @staticmethod
    async def list_received_consents(db: AsyncSession, grantee_user_id: UUID, role: str) -> List[Consent]:
        result = await db.execute(
            select(Consent)
            .options(selectinload(Consent.patient))
            .where(
                Consent.grantee_user_id == grantee_user_id,
                Consent.grantee_role == role,
                Consent.status == ConsentStatus.ACTIVE
            )
            .order_by(Consent.granted_at.desc())
        )
        return result.scalars().all()

consent_service = ConsentService()
