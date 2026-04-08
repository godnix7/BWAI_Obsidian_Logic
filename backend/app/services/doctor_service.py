from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime

from app.models.clinical import Consent, ConsentStatus

async def check_doctor_consent(
    db: AsyncSession, 
    doctor_user_id: UUID, 
    patient_id: UUID
) -> Consent:
    """
    Check if a doctor has active consent to view a patient's records.
    """
    query = select(Consent).where(
        Consent.patient_id == patient_id,
        Consent.grantee_user_id == doctor_user_id,
        Consent.status == ConsentStatus.ACTIVE
    )
    result = await db.execute(query)
    consent = result.scalars().first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have active consent to access this patient's records."
        )
    
    if consent.expires_at and consent.expires_at < datetime.utcnow():
        # Auto-expire if needed (could also be a background task)
        consent.status = ConsentStatus.EXPIRED
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient consent has expired."
        )
        
    return consent
