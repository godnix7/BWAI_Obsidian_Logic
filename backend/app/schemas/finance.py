from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from enum import Enum
from decimal import Decimal

# --- Billing Enums ---

class BillingStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    PARTIAL = "partial"
    CANCELLED = "cancelled"

# --- Billing Schemas ---

class BillingService(BaseModel):
    name: str
    quantity: int
    unit_price: Decimal

class BillingCreate(BaseModel):
    hospital_id: UUID
    patient_id: UUID
    appointment_id: Optional[UUID] = None
    invoice_number: str
    services: List[BillingService]
    subtotal: Decimal
    tax_amount: Decimal = Decimal("0")
    discount_amount: Decimal = Decimal("0")
    total_amount: Decimal
    status: BillingStatus = BillingStatus.UNPAID
    payment_method: Optional[str] = None

class HospitalShort(BaseModel):
    id: UUID
    hospital_name: Optional[str] = None
    city: Optional[str] = None

class BillingRead(BaseModel):
    id: UUID
    hospital_id: UUID
    patient_id: UUID
    appointment_id: Optional[UUID] = None
    invoice_number: str
    services: List[Dict[str, Any]]
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    status: BillingStatus
    payment_method: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    hospital: Optional[HospitalShort] = None

    model_config = ConfigDict(from_attributes=True)

# --- Insurance Schemas ---

class InsuranceCreate(BaseModel):
    provider_name: str
    policy_number: str
    policy_type: str
    valid_from: date
    valid_until: date
    coverage_amount: Decimal
    document_url: Optional[str] = None

class InsuranceRead(BaseModel):
    id: UUID
    patient_id: UUID
    provider_name: str
    policy_number: str
    policy_type: str
    valid_from: date
    valid_until: date
    coverage_amount: Decimal
    document_url: Optional[str] = None
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)
