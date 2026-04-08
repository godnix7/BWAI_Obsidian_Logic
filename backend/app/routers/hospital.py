from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import date
import os

from app.api.deps import get_db, get_current_hospital
from app.models.user import User, UserRole
from app.models.profile import HospitalProfile, PatientProfile, DoctorProfile
from app.models.medical import MedicalRecord, RecordType
from app.models.clinical import Consent, ConsentStatus
from app.models.finance import BillingRecord, HospitalDoctor, BillingStatus
import secrets
import string
from app.core.security import hash_password
from app.services.email_service import email_service
from app.services.audit_service import audit_service
from app.schemas.medical import MedicalRecordRead
from app.services.storage_service import storage_service

router = APIRouter(prefix="/hospital", tags=["Hospital"])

@router.get("/profile")
async def get_hospital_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    Fetch the profile of the current hospital.
    """
    result = await db.execute(
        select(HospitalProfile).where(HospitalProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Hospital profile not found.")
    return profile

@router.get("/public", response_model=List[dict])
async def list_available_hospitals(
    db: AsyncSession = Depends(get_db)
):
    """
    List all hospitals for patients to grant consent.
    """
    result = await db.execute(select(HospitalProfile))
    hospitals = result.scalars().all()
    
    return [
        {
            "id": h.id,
            "user_id": h.user_id,
            "hospital_name": h.hospital_name,
            "type": h.type,
            "address": h.address,
            "city": h.city
        } for h in hospitals
    ]

@router.put("/profile")
async def update_hospital_profile(
    data: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    result = await db.execute(
        select(HospitalProfile).where(HospitalProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Hospital profile not found.")

    allowed_fields = {
        "hospital_name", "registration_number", "address", "city", "state",
        "phone", "email", "logo_url", "type", "bed_count"
    }
    for field, value in data.items():
        if field in allowed_fields:
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.post("/lab-reports", response_model=MedicalRecordRead, status_code=status.HTTP_201_CREATED)
async def upload_lab_report(
    patient_id: UUID = Form(...),
    title: str = Form(...),
    record_date: date = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    Hospital uploads a lab report for a patient.
    Requires an ACTIVE consent from the patient.
    """
    # 1. Get current hospital profile ID
    hosp_res = await db.execute(
        select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id)
    )
    hospital_profile_id = hosp_res.scalars().first()
    
    if not hospital_profile_id:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hospital profile not found.")

    # 2. Verify Consent
    # Check if there is an ACTIVE consent for this hospital from the patient
    consent_res = await db.execute(
        select(Consent).where(
            Consent.patient_id == patient_id,
            Consent.grantee_user_id == current_user.id,
            Consent.status == ConsentStatus.ACTIVE
        )
    )
    consent = consent_res.scalars().first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="No active consent found from the patient to upload reports."
        )

    # 3. File Processing (Unique ID)
    file_id = str(uuid4())
    _, ext = os.path.splitext(file.filename)
    unique_filename = f"lab_{file_id}{ext}"

    storage_key = f"static/records/{unique_filename}"
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read report file: {str(e)}")

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded report file is empty.")

    file_url = storage_service.upload_bytes(
        storage_key,
        content,
        file.content_type or "application/octet-stream",
    )
    file_size = len(content)

    # 4. Save to Medical Records
    new_report = MedicalRecord(
        patient_id=patient_id,
        uploaded_by_user_id=current_user.id,
        record_type=RecordType.LAB_REPORT,
        title=title,
        description=description,
        file_url=file_url,
        file_name=file.filename,
        file_size_bytes=file_size,
        file_mime_type=file.content_type or "application/octet-stream",
        is_encrypted=True,
        is_emergency_visible=False, # Default to false for privacy
        record_date=record_date
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    # 5. Trigger Notification to Patient
    from app.services.notification_service import notification_service
    # medical_records.patient_id -> patient_profiles.id. We need User.id.
    patient_res = await db.execute(
        select(PatientProfile.user_id).where(PatientProfile.id == patient_id)
    )
    patient_user_id = patient_res.scalars().first()

    if patient_user_id:
        hosp_profile_res = await db.execute(
            select(HospitalProfile.hospital_name).where(HospitalProfile.user_id == current_user.id)
        )
        hosp_name = hosp_profile_res.scalars().first() or "a hospital"

        await notification_service.create_notification(
            db=db,
            user_id=patient_user_id,
            title="New Lab Report Available",
            message=f"A new lab report '{title}' has been added by {hosp_name}.",
            type="lab_report",
            send_push=True
        )

    return new_report

@router.get("/lab-reports", response_model=List[MedicalRecordRead])
async def list_uploaded_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    List all reports uploaded by this hospital.
    """
    result = await db.execute(
        select(MedicalRecord).where(MedicalRecord.uploaded_by_user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/patients/{patient_id}/records")
async def list_patient_records_for_hospital(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    consent_result = await db.execute(
        select(Consent).where(
            Consent.patient_id == patient_id,
            Consent.grantee_user_id == current_user.id,
            Consent.grantee_role == "hospital",
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

# --- DOCTOR MANAGEMENT ---

@router.get("/doctors")
async def list_hospital_doctors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    hosp_res = await db.execute(select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id))
    hospital_id = hosp_res.scalars().first()
    
    result = await db.execute(
        select(DoctorProfile, HospitalDoctor.department, HospitalDoctor.joined_at)
        .join(HospitalDoctor, DoctorProfile.id == HospitalDoctor.doctor_id)
        .where(HospitalDoctor.hospital_id == hospital_id)
    )
    doctors = []
    for doc, dept, joined in result:
        doctors.append({
            "id": doc.id,
            "full_name": doc.full_name,
            "specialization": doc.specialization,
            "department": dept,
            "joined_at": joined
        })
    return doctors

@router.post("/doctors", status_code=status.HTTP_201_CREATED)
async def register_hospital_doctor(
    data: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    Hospital admin links an existing doctor to their hospital.
    """
    # 1. Get current hospital profile
    hosp_res = await db.execute(select(HospitalProfile).where(HospitalProfile.user_id == current_user.id))
    hospital_profile = hosp_res.scalars().first()

    doctor_id = data.get("doctor_id")
    department = data.get("department", "General")

    if not doctor_id:
        raise HTTPException(status_code=400, detail="doctor_id is required")

    # 2. Verify doctor exists
    doc_res = await db.execute(select(DoctorProfile).where(DoctorProfile.id == doctor_id))
    doctor_profile = doc_res.scalars().first()

    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    # 3. Check if already linked
    existing = await db.execute(
        select(HospitalDoctor).where(
            HospitalDoctor.hospital_id == hospital_profile.id,
            HospitalDoctor.doctor_id == doctor_profile.id
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Doctor already mapped to this hospital.")

    # 4. Link in HospitalDoctor mapping
    new_assoc = HospitalDoctor(
        hospital_id=hospital_profile.id,
        doctor_id=doctor_profile.id,
        department=department
    )
    db.add(new_assoc)

    # 5. Audit Logging
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="DOCTOR_LINKED_BY_HOSPITAL",
        resource_type="DOCTOR",
        resource_id=doctor_profile.id,
        metadata={"doctor_id": str(doctor_profile.id), "department": department}
    )

    await db.commit()
    return {"message": "Doctor linked successfully."}

@router.delete("/doctors/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_doctor_from_hospital(
    doctor_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    hosp_res = await db.execute(select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id))
    hospital_id = hosp_res.scalars().first()

    result = await db.execute(
        select(HospitalDoctor).where(
            HospitalDoctor.hospital_id == hospital_id,
            HospitalDoctor.doctor_id == doctor_id,
        )
    )
    association = result.scalars().first()

    if not association:
        raise HTTPException(status_code=404, detail="Doctor association not found.")

    await db.delete(association)
    await db.commit()
    return None

# --- PATIENTS LIST ---

@router.get("/patients")
async def list_hospital_patients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    """
    Returns all patients who have consented to this hospital.
    Used to populate patient dropdowns in billing/invoice creation.
    Falls back to email if profile name is null.
    """
    hosp_res = await db.execute(
        select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id)
    )
    hospital_id = hosp_res.scalars().first()
    if not hospital_id:
        return []

    # Get all patients who have granted consent to this hospital
    from app.models.clinical import Consent, ConsentStatus
    consent_result = await db.execute(
        select(Consent.patient_id).where(
            Consent.grantee_user_id == current_user.id,
            Consent.status == ConsentStatus.ACTIVE
        )
    )
    patient_ids = [row[0] for row in consent_result.all()]

    if not patient_ids:
        return []

    # Get patient profiles
    profiles_result = await db.execute(
        select(PatientProfile.id, PatientProfile.full_name, PatientProfile.user_id)
        .where(PatientProfile.id.in_(patient_ids))
    )
    profiles = profiles_result.all()

    # Get user emails as fallback
    user_ids = [p.user_id for p in profiles if p.user_id]
    emails: dict = {}
    if user_ids:
        user_result = await db.execute(
            select(User.id, User.email).where(User.id.in_(user_ids))
        )
        for uid, email in user_result.all():
            emails[uid] = email

    return [
        {
            "patient_id": str(p.id),
            "patient_name": p.full_name or emails.get(p.user_id, "Unknown Patient"),
        }
        for p in profiles
    ]

# --- BILLING & INVOICES ---

@router.get("/billing")
async def list_hospital_billing(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    hosp_res = await db.execute(select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id))
    hospital_id = hosp_res.scalars().first()
    
    result = await db.execute(select(BillingRecord).where(BillingRecord.hospital_id == hospital_id))
    return result.scalars().all()

@router.post("/billing")
async def create_invoice(
    data: dict, # Simplified for now
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    hosp_res = await db.execute(select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id))
    hospital_id = hosp_res.scalars().first()
    
    import random
    invoice_num = f"INV-{random.randint(100000, 999999)}"
    
    new_bill = BillingRecord(
        hospital_id=hospital_id,
        patient_id=data['patient_id'],
        appointment_id=data.get('appointment_id'),
        invoice_number=invoice_num,
        services=data['services'], # [{name, quantity, unit_price}]
        subtotal=data['subtotal'],
        tax_amount=data.get('tax_amount', 0),
        discount_amount=data.get('discount_amount', 0),
        total_amount=data['total_amount'],
        status=BillingStatus.UNPAID
    )
    db.add(new_bill)
    await db.commit()
    await db.refresh(new_bill)
    return new_bill

@router.patch("/billing/{invoice_id}")
async def update_invoice_status(
    invoice_id: UUID,
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_hospital)
):
    hosp_res = await db.execute(select(HospitalProfile.id).where(HospitalProfile.user_id == current_user.id))
    hospital_id = hosp_res.scalars().first()

    result = await db.execute(
        select(BillingRecord).where(BillingRecord.id == invoice_id, BillingRecord.hospital_id == hospital_id)
    )
    invoice = result.scalars().first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    if "status" in data:
        invoice.status = data["status"]
    if "payment_method" in data:
        invoice.payment_method = data["payment_method"]

    await db.commit()
    await db.refresh(invoice)
    return invoice
