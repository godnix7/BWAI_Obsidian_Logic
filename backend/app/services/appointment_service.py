from datetime import date, time, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.clinical import DoctorSchedule, Appointment, AppointmentStatus
from typing import List
import uuid

class AppointmentService:
    async def get_available_slots(self, db: AsyncSession, doctor_id: uuid.UUID, appt_date: date) -> List[time]:
        """
        Calculates available time slots for a doctor on a specific date.
        - Checks DoctorSchedule for the day of the week.
        - Excludes already booked (PENDING/CONFIRMED) appointments.
        """
        # 1. Get Doctor's Schedule for the day of week (0=Monday, 6=Sunday)
        day_of_week = appt_date.weekday()
        result = await db.execute(
            select(DoctorSchedule).where(
                DoctorSchedule.doctor_id == doctor_id,
                DoctorSchedule.day_of_week == day_of_week,
                DoctorSchedule.is_active == True
            )
        )
        schedules = result.scalars().all()
        if not schedules:
            return []

        # 2. Get existing booked appointments for that day
        appt_result = await db.execute(
            select(Appointment.appointment_time).where(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_date == appt_date,
                Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING])
            )
        )
        booked_times = {a for a in appt_result.scalars().all()}

        available_slots = []
        for sched in schedules:
            # Create datetime objects for start/end to use timedelta
            curr_dt = datetime.combine(appt_date, sched.start_time)
            end_dt = datetime.combine(appt_date, sched.end_time)
            
            slot_delta = timedelta(minutes=sched.slot_duration_minutes)
            
            while curr_dt + slot_delta <= end_dt:
                slot_time = curr_dt.time()
                # Check if this exact time is already booked
                if slot_time not in booked_times:
                    available_slots.append(slot_time)
                curr_dt += slot_delta
        
        return sorted(available_slots)

    async def is_slot_available(self, db: AsyncSession, doctor_id: uuid.UUID, appt_date: date, appt_time: time) -> bool:
        """Helper to verify if a specific slot is still available before booking."""
        available = await self.get_available_slots(db, doctor_id, appt_date)
        return appt_time in available

appointment_service = AppointmentService()

