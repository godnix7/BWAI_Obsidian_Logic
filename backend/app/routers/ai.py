from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from uuid import UUID

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.services.ai_service import ai_service
from app.services.record_service import record_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/ai", tags=["AI Health Insights"])

@router.post("/analyze-record/{record_id}", response_model=Dict[str, Any])
async def analyze_medical_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Triggers an AI analysis for a specific medical record.
    Returns findings, summary, and recommendations.
    """
    # 1. Fetch the record
    record = await record_service.get_record(db, record_id)
    
    # 2. Check ownership (basic security for hackathon)
    if record.patient.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to analyze this record.")
        
    # 3. Call AI Service
    insights = await ai_service.analyze_lab_report(record.title, record.description or "")
    
    # 4. Log Action
    await audit_service.log_action(
        db, current_user.id, "RECORD_ANALYZED_AI",
        resource_type="medical_record", resource_id=record_id,
        metadata={"title": record.title}
    )
    await db.commit()
    
    return insights

@router.get("/health-trends", response_model=List[Dict[str, Any]])
async def get_health_trends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Retrieve AI-generated health trends for the current patient.
    """
    patient_id = await record_service.get_patient_id(db, current_user.id)
    return await ai_service.get_health_score_trend(patient_id)
