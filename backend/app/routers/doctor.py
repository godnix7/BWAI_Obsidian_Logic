from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from app.api.deps import get_db, get_current_doctor
from app.models.user import User
from app.models.profile import DoctorProfile, PatientProfile
from app.models.clinical import Appointment, AppointmentStatus, DoctorSchedule, Consent, ConsentStatus
from app.models.medical import Prescription, PrescriptionMedication, MedicalRecord
from app.services.doctor_service import check_doctor_consent
from app.schemas.doctor_schema import (
    DoctorProfileRead, DoctorProfileUpdate, 
    AppointmentRead, AppointmentRejectRequest, AppointmentCompleteRequest,
    DoctorScheduleRead, DoctorScheduleCreate, DoctorScheduleUpdate,
    PatientSummary, PrescriptionCreate, PrescriptionRead
)

router = APIRouter(prefix="/doctor", tags=["Doctor"])

# --- Profile Endpoints ---

@router.get("/profile", response_model=DoctorProfileRead)
async def get_doctor_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Fetch the profile of the current logged-in doctor.
    """
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found. Please complete your profile."
        )
    return profile

@router.put("/profile", response_model=DoctorProfileRead)
async def update_doctor_profile(
    profile_data: DoctorProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Update or initialize the doctor profile.
    If the profile doesn't exist yet, it will be created.
    """
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    
    if not profile:
        # For initial creation, we need to ensure all required fields are present.
        # We can do this by attempting to validate the incoming data as a create model.
        from app.schemas.doctor_schema import DoctorProfileCreate
        try:
            # Check if we have the minimal required fields for creation
            create_data = DoctorProfileCreate(**profile_data.model_dump(exclude_unset=True))
            profile = DoctorProfile(
                user_id=current_user.id,
                **create_data.model_dump()
            )
            db.add(profile)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="First-time profile setup requires all mandatory fields: full_name, specialization, license_number, years_experience, consultation_fee."
            )
    else:
        # Update existing
        for field, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
    
    await db.commit()
    await db.refresh(profile)
    
    return profile

# --- Appointment Management ---

@router.get("/appointments", response_model=List[AppointmentRead])
async def list_doctor_appointments(
    status: Optional[AppointmentStatus] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    List doctor's appointments, optionally filtered by status.
    """
    # Get doctor profile ID
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()
    
    if not doctor_id:
        return []

    query = select(Appointment).where(Appointment.doctor_id == doctor_id)
    if status:
        query = query.where(Appointment.status == status)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/appointments/{id}", response_model=AppointmentRead)
async def get_appointment_detail(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Get detailed information about a specific appointment.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    result = await db.execute(
        select(Appointment).where(
            Appointment.id == id, 
            Appointment.doctor_id == doctor_id
        )
    )
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return appointment

@router.put("/appointments/{id}/approve", response_model=AppointmentRead)
async def approve_appointment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Approve a pending appointment.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    result = await db.execute(
        select(Appointment).where(
            Appointment.id == id, 
            Appointment.doctor_id == doctor_id
        )
    )
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.status != AppointmentStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending appointments can be approved")
        
    appointment.status = AppointmentStatus.CONFIRMED
    await db.commit()
    await db.refresh(appointment)
    return appointment

@router.put("/appointments/{id}/reject", response_model=AppointmentRead)
async def reject_appointment(
    id: UUID,
    data: AppointmentRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Reject an appointment with a reason.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    result = await db.execute(
        select(Appointment).where(
            Appointment.id == id, 
            Appointment.doctor_id == doctor_id
        )
    )
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = AppointmentStatus.REJECTED
    appointment.rejection_reason = data.rejection_reason
    await db.commit()
    await db.refresh(appointment)
    return appointment

@router.put("/appointments/{id}/complete", response_model=AppointmentRead)
async def complete_appointment(
    id: UUID,
    data: AppointmentCompleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Mark an appointment as completed and add notes.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    result = await db.execute(
        select(Appointment).where(
            Appointment.id == id, 
            Appointment.doctor_id == doctor_id
        )
    )
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if appointment.status != AppointmentStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Only confirmed appointments can be marked as completed")
        
    appointment.status = AppointmentStatus.COMPLETED
    appointment.notes = data.notes
    await db.commit()
    await db.refresh(appointment)
    return appointment

# --- Schedule Management ---

@router.get("/schedule", response_model=List[DoctorScheduleRead])
async def get_doctor_schedule(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Fetch the weekly schedule of the current doctor.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()
    
    if not doctor_id:
        return []

    result = await db.execute(
        select(DoctorSchedule).where(DoctorSchedule.doctor_id == doctor_id)
    )
    return result.scalars().all()

@router.post("/schedule", response_model=DoctorScheduleRead, status_code=status.HTTP_201_CREATED)
async def add_schedule_slot(
    slot_data: DoctorScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Add a new availability slot to the doctor's schedule.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    if not doctor_id:
        raise HTTPException(status_code=400, detail="Please complete your profile first")

    new_slot = DoctorSchedule(
        doctor_id=doctor_id,
        **slot_data.model_dump()
    )
    db.add(new_slot)
    await db.commit()
    await db.refresh(new_slot)
    return new_slot

@router.put("/schedule/{id}", response_model=DoctorScheduleRead)
async def update_schedule_slot(
    id: UUID,
    slot_data: DoctorScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Update an existing schedule slot.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    result = await db.execute(
        select(DoctorSchedule).where(
            DoctorSchedule.id == id,
            DoctorSchedule.doctor_id == doctor_id
        )
    )
    slot = result.scalars().first()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Schedule slot not found")
    
    for field, value in slot_data.model_dump(exclude_unset=True).items():
        setattr(slot, field, value)
        
    await db.commit()
    await db.refresh(slot)
    return slot

@router.delete("/schedule/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule_slot(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Remove a schedule slot.
    """
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()

    result = await db.execute(
        delete(DoctorSchedule).where(
            DoctorSchedule.id == id,
            DoctorSchedule.doctor_id == doctor_id
        )
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Schedule slot not found")
        
    await db.commit()
    return None

# --- Patient Data Access (Consent-Gated) ---

@router.get("/patients", response_model=List[PatientSummary])
async def list_consented_patients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    List all patients who have granted active consent to this doctor.
    """
    query = (
        select(PatientProfile)
        .join(Consent, PatientProfile.id == Consent.patient_id)
        .where(
            Consent.grantee_user_id == current_user.id,
            Consent.status == ConsentStatus.ACTIVE
        )
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/patients/{patient_id}/records")
async def get_patient_records(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Fetch patient records if consent is active.
    """
    consent = await check_doctor_consent(db, current_user.id, patient_id)
    
    query = select(MedicalRecord).where(MedicalRecord.patient_id == patient_id)
    
    # Filter by record types allowed in consent if not full access
    if consent.access_level != "full" and consent.record_types_allowed:
        query = query.where(MedicalRecord.record_type.in_(consent.record_types_allowed))
        
    result = await db.execute(query)
    return result.scalars().all()

# --- Prescription Creation ---

@router.post("/prescriptions", response_model=PrescriptionRead, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    data: PrescriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    """
    Create a new prescription for a patient.
    """
    # 1. Get doctor profile
    res = await db.execute(
        select(DoctorProfile.id).where(DoctorProfile.user_id == current_user.id)
    )
    doctor_id = res.scalars().first()
    
    # 2. Verify consent (Must have consent to prescribe)
    await check_doctor_consent(db, current_user.id, data.patient_id)
    
    # 3. Create prescription
    new_prescription = Prescription(
        patient_id=data.patient_id,
        doctor_id=doctor_id,
        appointment_id=data.appointment_id,
        diagnosis=data.diagnosis,
        notes=data.notes,
        valid_until=data.valid_until
    )
    db.add(new_prescription)
    await db.flush() # Get the new prescription ID
    
    # 4. Add medications
    for med in data.medications:
        new_med = PrescriptionMedication(
            prescription_id=new_prescription.id,
            **med.model_dump()
        )
        db.add(new_med)
        
    await db.commit()
    
    # Reload with medications for the response
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.medications))
        .where(Prescription.id == new_prescription.id)
    )
    return result.scalars().first()
