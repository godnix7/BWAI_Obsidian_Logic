from sqlalchemy import Column, String, Date, Integer, Numeric, Boolean, Text, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship as sa_relationship
from app.db.base_class import Base

class HospitalProfile(Base):
    __tablename__ = "hospital_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    hospital_name = Column(String(255), nullable=False)
    registration_number = Column(String(100), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    logo_url = Column(Text, nullable=True)
    type = Column(String(50), nullable=False)  # government | private | clinic
    bed_count = Column(Integer, nullable=True)

    user = sa_relationship("User", back_populates="hospital_profile")
    doctors = sa_relationship("DoctorProfile", back_populates="hospital")

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospital_profiles.id"), nullable=True)
    full_name = Column(String(255), nullable=False)
    specialization = Column(String(100), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    years_experience = Column(Integer, nullable=False)
    consultation_fee = Column(Numeric(10, 2), nullable=False)
    is_available = Column(Boolean, default=True)
    bio = Column(Text, nullable=True)
    profile_photo_url = Column(Text, nullable=True)

    user = sa_relationship("User", back_populates="doctor_profile")
    hospital = sa_relationship("HospitalProfile", back_populates="doctors")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)
    blood_group = Column(String(5), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    allergies = Column(ARRAY(String), nullable=True)
    chronic_conditions = Column(ARRAY(String), nullable=True)
    profile_photo_url = Column(Text, nullable=True)
    qr_code_url = Column(Text, nullable=True)
    qr_secret_key = Column(Text, nullable=True)

    user = sa_relationship("User", back_populates="patient_profile")
    family_members = sa_relationship("FamilyMember", back_populates="patient")

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    full_name = Column(String(255), nullable=False)
    relationship = Column(String(50), nullable=False)  # spouse | child | parent | sibling
    date_of_birth = Column(Date, nullable=False)
    blood_group = Column(String(5), nullable=True)
    allergies = Column(ARRAY(String), nullable=True)

    patient = sa_relationship("PatientProfile", back_populates="family_members")
