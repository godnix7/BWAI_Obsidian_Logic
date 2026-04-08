import os
from uuid import uuid4, UUID
from datetime import date
from typing import List, Optional
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.medical import MedicalRecord
from app.models.profile import PatientProfile
from app.services.storage_service import storage_service
from app.services.audit_service import audit_service
from app.schemas.medical import RecordType

class RecordService:
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
    async def list_records(db: AsyncSession, patient_id: UUID) -> List[MedicalRecord]:
        """List all records and attach secure signed URLs"""
        result = await db.execute(
            select(MedicalRecord).where(MedicalRecord.patient_id == patient_id)
            .order_by(MedicalRecord.record_date.desc())
        )
        records = result.scalars().all()
        for rec in records:
            key = storage_service.extract_key(rec.file_url)
            if key:
                rec.signed_url = storage_service.generate_signed_url(key)
        return records

    @staticmethod
    async def upload_record(
        db: AsyncSession,
        patient_id: UUID,
        uploaded_by_user_id: UUID,
        file: UploadFile,
        title: str,
        record_type: RecordType,
        record_date: date,
        description: Optional[str] = None,
        is_emergency_visible: bool = False
    ) -> MedicalRecord:
        # 1. Generate unique ID for the file
        file_id = str(uuid4())
        _, ext = os.path.splitext(file.filename)
        unique_filename = f"rec_{file_id}{ext}"

        storage_key = f"static/records/{unique_filename}"
        try:
            content = await file.read()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not read file: {str(e)}")

        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        file_url = storage_service.upload_bytes(
            storage_key,
            content,
            file.content_type or "application/octet-stream",
        )
        file_size = len(content)

        new_record = MedicalRecord(
            patient_id=patient_id,
            uploaded_by_user_id=uploaded_by_user_id,
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
        
        # Log action
        await audit_service.log_action(
            db, uploaded_by_user_id, "RECORD_UPLOADED",
            resource_type="medical_record", resource_id=new_record.id,
            metadata={"title": title, "patient_id": str(patient_id)}
        )

        await db.commit()
        await db.refresh(new_record)
        
        # Attach signed URL for immediate viewing
        key = storage_service.extract_key(new_record.file_url)
        if key:
            new_record.signed_url = storage_service.generate_signed_url(key)
            
        return new_record

    @staticmethod
    async def get_record(db: AsyncSession, record_id: UUID) -> MedicalRecord:
        """Fetch a single record and attach secure signed URL"""
        result = await db.execute(
            select(MedicalRecord).where(MedicalRecord.id == record_id)
        )
        record = result.scalars().first()
        if not record:
            raise HTTPException(status_code=404, detail="Medical Record not found.")
            
        key = storage_service.extract_key(record.file_url)
        if key:
            record.signed_url = storage_service.generate_signed_url(key)
            
        return record

    @staticmethod
    async def delete_record(db: AsyncSession, record_id: UUID, deleted_by_user_id: UUID) -> None:
        record = await RecordService.get_record(db, record_id)
        storage_service.delete(record.file_url)
        
        # Log action
        await audit_service.log_action(
            db, deleted_by_user_id, "RECORD_DELETED",
            resource_type="medical_record", resource_id=record_id,
            metadata={"title": record.title, "patient_id": str(record.patient_id)}
        )
        
        await db.delete(record)
        await db.commit()

record_service = RecordService()

