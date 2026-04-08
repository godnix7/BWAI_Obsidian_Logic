from sqlalchemy import Column, String, Date, Integer, Numeric, Boolean, Text, ForeignKey, Enum, text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class InsuranceRecord(Base):
    __tablename__ = "insurance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    provider_name = Column(String(255), nullable=False)
    policy_number = Column(String(100), nullable=False)  # UNIQUE per patient usually handled by constraints
    policy_type = Column(String(100), nullable=False)  # health | dental | vision
    valid_from = Column(Date, nullable=False)
    valid_until = Column(Date, nullable=False)
    coverage_amount = Column(Numeric(12, 2), nullable=False)
    document_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

class BillingStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    PARTIAL = "partial"
    CANCELLED = "cancelled"

class BillingRecord(Base):
    __tablename__ = "billing_records"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospital_profiles.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    invoice_number = Column(String(100), unique=True, nullable=False)
    services = Column(JSONB, nullable=False)  # [{name, quantity, unit_price}]
    subtotal = Column(Numeric(12, 2), nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0)
    discount_amount = Column(Numeric(12, 2), default=0)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(Enum(BillingStatus), default=BillingStatus.UNPAID)
    payment_method = Column(String(50), nullable=True)  # cash | card | insurance | upi
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # RECORD_VIEWED, LOGIN_FAILED etc.
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    metadata_json = Column(JSONB, nullable=True)  # renamed from metadata to avoid conflict with sqlalchemy
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class HospitalDoctor(Base):
    __tablename__ = "hospital_doctors"

    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospital_profiles.id"), primary_key=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id"), primary_key=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    department = Column(String(100), nullable=True)
