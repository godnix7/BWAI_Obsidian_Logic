from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional
from uuid import UUID
from decimal import Decimal

# --- Insurance Schemas ---

class InsuranceBase(BaseModel):
    provider_name: str
    policy_number: str
    policy_type: str  # health | dental | vision
    valid_from: date
    valid_until: date
    coverage_amount: Decimal
    document_url: Optional[str] = None
    is_active: bool = True

class InsuranceCreate(InsuranceBase):
    pass

class InsuranceUpdate(BaseModel):
    provider_name: Optional[str] = None
    policy_number: Optional[str] = None
    policy_type: Optional[str] = None
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None
    coverage_amount: Optional[Decimal] = None
    document_url: Optional[str] = None
    is_active: Optional[bool] = None

class InsuranceRead(InsuranceBase):
    id: UUID
    patient_id: UUID

    model_config = ConfigDict(from_attributes=True)
