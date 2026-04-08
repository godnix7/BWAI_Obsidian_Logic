from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.api.deps import get_db, get_current_doctor
from app.models.user import User
from app.models.profile import DoctorProfile
from app.models.clinical import Appointment
from app.schemas.clinical import AppointmentRead, AppointmentStatusUpdate

router = APIRouter(prefix="/doctor", tags=["Doctor"])

@router.get("/profile")
async def get_doctor_profile():
    return {"message": "Doctor profile - Work in progress"}

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
