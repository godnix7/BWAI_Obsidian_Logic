from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime, time as Time
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

class DoctorProfileBase(BaseModel):
    full_name: str
    specialization: str
    license_number: str
    years_experience: int
    consultation_fee: Decimal
    is_available: bool = True
    bio: Optional[str] = None

class DoctorProfileCreate(DoctorProfileBase):
    pass

class DoctorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    years_experience: Optional[int] = None
    consultation_fee: Optional[Decimal] = None
    is_available: Optional[bool] = None
    bio: Optional[str] = None

class DoctorProfileRead(DoctorProfileBase):
    id: UUID
    user_id: UUID
    hospital_id: Optional[UUID] = None
    profile_photo_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Appointment Schemas ---

class AppointmentRead(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    hospital_id: Optional[UUID] = None
    appointment_date: date
    appointment_time: Time # Need to import Time from datetime
    duration_minutes: int
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    type: str
    rejection_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AppointmentRejectRequest(BaseModel):
    rejection_reason: str

class AppointmentCompleteRequest(BaseModel):
    notes: str

# --- Schedule Schemas ---

class DoctorScheduleBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: Time
    end_time: Time
    slot_duration_minutes: int = 30
    is_active: bool = True
    max_patients_per_slot: int = 1

class DoctorScheduleCreate(DoctorScheduleBase):
    pass

class DoctorScheduleUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[Time] = None
    end_time: Optional[Time] = None
    slot_duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None
    max_patients_per_slot: Optional[int] = None

class DoctorScheduleRead(DoctorScheduleBase):
    id: UUID
    doctor_id: UUID

    model_config = ConfigDict(from_attributes=True)

# --- Patient & Prescription Schemas ---

class PatientSummary(BaseModel):
    id: UUID
    full_name: str
    gender: str
    date_of_birth: date

class MedicationSchema(BaseModel):
    medication_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: UUID
    appointment_id: Optional[UUID] = None
    diagnosis: str
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    medications: List[MedicationSchema]

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
    medications: List[MedicationSchema] = []

    model_config = ConfigDict(from_attributes=True)
