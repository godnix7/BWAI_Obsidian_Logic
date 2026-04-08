# Import all models here so that Alembic can discover them
from app.db.base_class import Base  # noqa
from app.models.user import User, UserRole  # noqa
from app.models.profile import PatientProfile, DoctorProfile, HospitalProfile, FamilyMember  # noqa
from app.models.clinical import Appointment, DoctorSchedule, Consent, AppointmentStatus, AppointmentType, ConsentStatus, ConsentAccessLevel  # noqa
from app.models.medical import MedicalRecord, Prescription, PrescriptionMedication, RecordType  # noqa
from app.models.finance import InsuranceRecord, BillingRecord, AuditLog, HospitalDoctor, BillingStatus  # noqa
