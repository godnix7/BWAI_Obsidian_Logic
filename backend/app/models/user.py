import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    hospital = "hospital"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), onupdate=datetime.utcnow)
    last_login = Column(DateTime(timezone=True), nullable=True)

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete")
    hospital_profile = relationship("HospitalProfile", back_populates="user", uselist=False, cascade="all, delete")
