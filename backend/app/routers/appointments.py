from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.api.deps import get_db, get_current_patient
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.clinical import Appointment, AppointmentStatus
from app.schemas.clinical import AppointmentRead, AppointmentCreate

router = APIRouter(prefix="/patient/appointments", tags=["Appointments"])

@router.get("", response_model=List[AppointmentRead])
async def list_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    List all appointments for the current patient.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        return []

    result = await db.execute(
        select(Appointment).where(Appointment.patient_id == patient_id)
        .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
    )
    return result.scalars().all()

@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appt_data: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Book a new appointment.
    """
    res = await db.execute(
        select(PatientProfile.id).where(PatientProfile.user_id == current_user.id)
    )
    patient_id = res.scalars().first()
    
    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient profile not found.")

    # Simplified booking logic: No slot validation for now
    new_appt = Appointment(
        patient_id=patient_id,
        status=AppointmentStatus.PENDING,
        **appt_data.model_dump()
    )
    
    db.add(new_appt)
    await db.commit()
    await db.refresh(new_appt)
    return new_appt

@router.get("/{id}", response_model=AppointmentRead)
async def get_appointment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Get details of a single appointment.
    """
    result = await db.execute(
        select(Appointment).where(Appointment.id == id)
    )
    appt = result.scalars().first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
        
    return appt

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_patient)
):
    """
    Cancel an existing appointment.
    """
    result = await db.execute(
        select(Appointment).where(Appointment.id == id)
    )
    appt = result.scalars().first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    
    # Check if already cancelled/completed
    if appt.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
         raise HTTPException(status_code=400, detail=f"Cannot cancel appointment with status {appt.status}")

    appt.status = AppointmentStatus.CANCELLED
    await db.commit()
    return None
