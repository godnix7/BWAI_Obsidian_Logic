from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

# --- Emergency QR Schemas ---

class EmergencyQRConfigUpdate(BaseModel):
    # This config tells which fields hospitals can view after QR resolution.
    show_name: bool = True
    show_gender: bool = True
    show_dob: bool = True
    show_blood_group: bool = True
    show_allergies: bool = True
    show_emergency_contact: bool = True
    show_chronic_conditions: bool = True
    # We can also have specific medical records flagged as is_emergency_visible

class EmergencyQRRead(BaseModel):
    qr_code_url: Optional[str] = None
    qr_payload: Optional[str] = None
    config: EmergencyQRConfigUpdate

class EmergencyQRResolveRequest(BaseModel):
    qr_payload: str

class EmergencyContactRead(BaseModel):
    name: Optional[str]
    phone: Optional[str]

class EmergencyRecordRead(BaseModel):
    title: str
    record_type: str
    url: str

class EmergencyProfileRead(BaseModel):
    patient_id: Optional[UUID] = None
    patient_name: str
    blood_group: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    emergency_contact: Optional[EmergencyContactRead] = None
    emergency_records: List[EmergencyRecordRead] = []
