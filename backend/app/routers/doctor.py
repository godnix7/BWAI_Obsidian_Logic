from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from datetime import time

from app.api.deps import get_db, get_current_doctor
from app.models.user import User, UserRole
from app.models.profile import DoctorProfile, PatientProfile
from app.models.clinical import Appointment, DoctorSchedule, Consent, ConsentStatus
from app.models.medical import MedicalRecord, Prescription, PrescriptionMedication, RecordType
from app.schemas.clinical import AppointmentRead, AppointmentStatusUpdate
from app.schemas.doctor_schema import DoctorProfileUpdate, DoctorScheduleCreate, DoctorScheduleRead
from app.schemas.medical import PrescriptionRead, PrescriptionCreate

router = APIRouter(prefix="/doctor", tags=["Doctor"])

@router.get("/public", response_model=List[dict])
async def list_available_doctors(
    db: AsyncSession = Depends(get_db)
):
    """
    List all doctors for patient selection during booking.
    """
    result = await db.execute(select(DoctorProfile))
    doctors = result.scalars().all()

    if not doctors:
        doctor_users_result = await db.execute(select(User).where(User.role == UserRole.DOCTOR))
        doctor_users = doctor_users_result.scalars().all()

        for user in doctor_users:
            profile_result = await db.execute(
                select(DoctorProfile).where(DoctorProfile.user_id == user.id)
            )
            profile = profile_result.scalars().first()
            if profile:
                doctors.append(profile)
                continue

            auto_profile = DoctorProfile(
                user_id=user.id,
                full_name=user.email.split("@")[0].replace(".", " ").title(),
                specialization="General",
                license_number=f"AUTO-{str(user.id).replace('-', '')[:8]}",
                years_experience=0,
                consultation_fee=500,
                is_available=True,
            )
            db.add(auto_profile)
            await db.flush()
            doctors.append(auto_profile)

        if doctor_users:
            await db.commit()
            for profile in doctors:
                await db.refresh(profile)

    return [
        {
            "id": doc.id,
            "user_id": doc.user_id,
            "full_name": doc.full_name,
            "specialization": doc.specialization,
            "consultation_fee": doc.consultation_fee
        } for doc in doctors
    ]

@router.get("/profile")
async def get_doctor_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Fetch the profile of the current doctor.
    """
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")
    return profile

@router.put("/profile")
async def update_doctor_profile(
    data: DoctorProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/appointments", response_model=List[AppointmentRead])
async def list_doctor_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    List all appointments for the current logged-in doctor.
    """
    # 1. Get doctor profile ID
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()
    
    if not doctor_id:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")

    # 2. Get appointments with patient info (lazy joined in model)
    result = await db.execute(
        select(Appointment).where(Appointment.doctor_id == doctor_id)
        .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
    )
    return result.scalars().all()

@router.patch("/appointments/{id}/status", response_model=AppointmentRead)
async def update_appointment_status(
    id: UUID,
    data: AppointmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Update appointment status (Approve/Reject/Complete).
    """
    # Verify doctor owns this appointment
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    result = await db.execute(
        select(Appointment).where(Appointment.id == id, Appointment.doctor_id == doctor_id)
    )
    appt = result.scalars().first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found or not assigned to you.")

    # Update fields
    appt.status = data.status
    if data.notes:
        appt.notes = data.notes
    if data.rejection_reason:
        appt.rejection_reason = data.rejection_reason

    await db.commit()
    await db.refresh(appt)
    return appt

# --- PRESCRIPTIONS ---

@router.post("/prescriptions", response_model=PrescriptionRead)
async def create_prescription(
    data: PrescriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Doctor creates a new prescription for a patient.
    """
    # 1. Get doctor profile
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()
    
    # 2. Create Prescription
    new_prescription = Prescription(
        patient_id=data.patient_id,
        doctor_id=doctor_id,
        appointment_id=data.appointment_id,
        diagnosis=data.diagnosis,
        notes=data.notes,
        valid_until=data.valid_until
    )
    db.add(new_prescription)
    await db.flush() # Get the new ID

    # 3. Add Medications
    for med in data.medications:
        db.add(PrescriptionMedication(
            prescription_id=new_prescription.id,
            **med.model_dump()
        ))
    
    await db.commit()
    await db.refresh(new_prescription)
    return new_prescription

@router.get("/prescriptions", response_model=List[PrescriptionRead])
async def list_issued_prescriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    List all prescriptions issued by this doctor.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()
    
    result = await db.execute(
        select(Prescription).where(Prescription.doctor_id == doctor_id)
        .options(selectinload(Prescription.medications))
        .order_by(Prescription.created_at.desc())
    )
    return result.scalars().all()

@router.get("/patients")
async def list_consented_patients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    result = await db.execute(
        select(Consent)
        .options(selectinload(Consent.patient))
        .where(
            Consent.grantee_user_id == current_user.id,
            Consent.grantee_role == "doctor",
            Consent.status == ConsentStatus.ACTIVE,
        )
        .order_by(Consent.granted_at.desc())
    )
    consents = result.scalars().all()
    return [
        {
            "consent_id": consent.id,
            "access_level": consent.access_level,
            "record_types_allowed": consent.record_types_allowed or [],
            "expires_at": consent.expires_at,
            "patient": {
                "id": consent.patient.id,
                "full_name": consent.patient.full_name,
                "gender": consent.patient.gender,
                "date_of_birth": consent.patient.date_of_birth,
                "blood_group": consent.patient.blood_group,
                "allergies": consent.patient.allergies or [],
                "chronic_conditions": consent.patient.chronic_conditions or [],
            } if consent.patient else None,
        }
        for consent in consents
    ]

@router.get("/patients/{patient_id}/records")
async def list_patient_records_for_doctor(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    consent_result = await db.execute(
        select(Consent).where(
            Consent.patient_id == patient_id,
            Consent.grantee_user_id == current_user.id,
            Consent.grantee_role == "doctor",
            Consent.status == ConsentStatus.ACTIVE,
        )
    )
    consent = consent_result.scalars().first()
    if not consent:
        raise HTTPException(status_code=403, detail="No active consent for this patient.")

    records_query = select(MedicalRecord).where(MedicalRecord.patient_id == patient_id)
    if consent.record_types_allowed:
        allowed_record_types = []
        for record_type in consent.record_types_allowed:
            try:
                allowed_record_types.append(RecordType(record_type))
            except ValueError:
                try:
                    allowed_record_types.append(RecordType[record_type])
                except KeyError:
                    continue
        if allowed_record_types:
            records_query = records_query.where(MedicalRecord.record_type.in_(allowed_record_types))

    result = await db.execute(records_query.order_by(MedicalRecord.record_date.desc()))
    records = result.scalars().all()
    return [
        {
            "id": record.id,
            "record_type": record.record_type,
            "title": record.title,
            "description": record.description,
            "record_date": record.record_date,
            "file_url": record.file_url,
            "file_name": record.file_name,
            "file_size_bytes": record.file_size_bytes,
        }
        for record in records
    ]

# --- SCHEDULE / SLOTS ---

@router.get("/schedules", response_model=List[DoctorScheduleRead])
async def get_my_schedule(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    res = await db.execute(select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id))
    doctor_id = res.scalars().first()
    
    result = await db.execute(select(DoctorSchedule).where(DoctorSchedule.doctor_id == doctor_id))
    return result.scalars().all()

@router.post("/schedules", response_model=List[DoctorScheduleRead])
async def update_schedule(
    schedules: List[DoctorScheduleCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    res = await db.execute(select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id))
    doctor_id = res.scalars().first()
    
    # Simple replace-all strategy for slots
    from sqlalchemy import delete
    await db.execute(delete(DoctorSchedule).where(DoctorSchedule.doctor_id == doctor_id))
    
    for s in schedules:
        db.add(DoctorSchedule(
            doctor_id=doctor_id,
            day_of_week=s.day_of_week,
            start_time=s.start_time if isinstance(s.start_time, time) else time.fromisoformat(str(s.start_time)),
            end_time=s.end_time if isinstance(s.end_time, time) else time.fromisoformat(str(s.end_time)),
            slot_duration_minutes=s.slot_duration_minutes,
            is_active=s.is_active,
            max_patients_per_slot=s.max_patients_per_slot,
        ))
    
    await db.commit()
    result = await db.execute(select(DoctorSchedule).where(DoctorSchedule.doctor_id == doctor_id))
    return result.scalars().all()
