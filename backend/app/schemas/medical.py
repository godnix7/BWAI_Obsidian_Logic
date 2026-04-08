from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from enum import Enum

class RecordType(str, Enum):
    LAB_REPORT = "lab_report"
    PRESCRIPTION = "prescription"
    SCAN = "scan"
    DISCHARGE = "discharge"
    OTHER = "other"

# --- Medical Record Schemas ---

class MedicalRecordBase(BaseModel):
    record_type: RecordType
    title: str
    description: Optional[str] = None
    record_date: date
    is_emergency_visible: bool = False

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    record_type: Optional[RecordType] = None
    record_date: Optional[date] = None
    is_emergency_visible: Optional[bool] = None

class MedicalRecordRead(MedicalRecordBase):
    id: UUID
    patient_id: UUID
    uploaded_by_user_id: UUID
    file_url: str
    file_name: str
    file_size_bytes: int
    file_mime_type: str
    is_encrypted: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Prescription Schemas ---

class PrescriptionMedicationCreate(BaseModel):
    medication_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionMedicationRead(BaseModel):

    medication_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PrescriptionCreate(BaseModel):
    patient_id: UUID
    appointment_id: Optional[UUID] = None
    diagnosis: str
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    medications: List[PrescriptionMedicationCreate]

class PrescriptionRead(BaseModel):

    id: UUID
    patient_id: UUID
    doctor_id: UUID
    appointment_id: Optional[UUID] = None
    diagnosis: str
    notes: Optional[str] = None
    is_active: bool
    valid_until: Optional[date] = None
    created_at: datetime
    medications: List[PrescriptionMedicationRead] = []

    model_config = ConfigDict(from_attributes=True)
