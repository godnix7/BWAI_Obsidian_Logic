from pydantic import BaseModel, ConfigDict
from datetime import date, time, datetime
from typing import List, Optional
from uuid import UUID
from enum import Enum

# --- Appointment Enums ---

class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class AppointmentType(str, Enum):
    IN_PERSON = "in_person"
    VIDEO = "video"
    PHONE = "phone"

# --- Appointment Schemas ---

class AppointmentCreate(BaseModel):
    doctor_id: UUID
    hospital_id: Optional[UUID] = None
    appointment_date: date
    appointment_time: time
    duration_minutes: int = 30
    reason: Optional[str] = None
    type: AppointmentType

class PatientShort(BaseModel):
    full_name: str
    gender: str
    blood_group: Optional[str] = None

class AppointmentRead(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    hospital_id: Optional[UUID] = None
    appointment_date: date
    appointment_time: time
    status: AppointmentStatus
    type: AppointmentType
    reason: Optional[str] = None
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    patient: Optional[PatientShort] = None

    model_config = ConfigDict(from_attributes=True)

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None

# --- Consent Enums ---

class ConsentStatus(str, Enum):
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"

class ConsentAccessLevel(str, Enum):
    READ_ONLY = "read_only"
    FULL = "full"

# --- Consent Schemas ---

class ConsentCreate(BaseModel):
    grantee_user_id: UUID
    grantee_role: str  # doctor | hospital
    access_level: ConsentAccessLevel = ConsentAccessLevel.READ_ONLY
    record_types_allowed: Optional[List[str]] = None
    expires_at: Optional[datetime] = None

class ConsentUpdate(BaseModel):
    access_level: Optional[ConsentAccessLevel] = None
    record_types_allowed: Optional[List[str]] = None
    expires_at: Optional[datetime] = None
    status: Optional[ConsentStatus] = None

class ConsentRead(BaseModel):
    id: UUID
    patient_id: UUID
    grantee_user_id: UUID
    grantee_role: str
    status: ConsentStatus
    access_level: ConsentAccessLevel
    record_types_allowed: Optional[List[str]] = None
    granted_at: datetime
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
