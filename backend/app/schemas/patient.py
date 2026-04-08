from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

# --- Family Member Schemas ---

class FamilyMemberBase(BaseModel):
    full_name: str
    relationship: str
    date_of_birth: date
    blood_group: Optional[str] = None
    allergies: Optional[List[str]] = []

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberRead(FamilyMemberBase):
    id: UUID
    patient_id: UUID

    model_config = ConfigDict(from_attributes=True)

# --- Patient Profile Schemas ---

class PatientProfileBase(BaseModel):
    full_name: str
    date_of_birth: date
    gender: str
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    allergies: Optional[List[str]] = []
    chronic_conditions: Optional[List[str]] = []

class PatientProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None

class PatientProfileRead(PatientProfileBase):
    id: UUID
    user_id: UUID
    qr_code_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ProfileUpdateResponse(BaseModel):
    success: bool
    message: str
    profile: PatientProfileRead
