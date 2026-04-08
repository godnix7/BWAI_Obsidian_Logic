// Central mock data for all roles — replace with API calls when backend is ready

export const mockPatients = [
  {
    id: "p1", user_id: "u1", full_name: "Aarav Sharma", email: "aarav@email.com",
    date_of_birth: "1990-05-15", gender: "male", blood_group: "O+",
    phone: "+919876543210", address: "123 MG Road, Bengaluru 560001",
    allergies: ["Penicillin", "Peanuts"], chronic_conditions: ["Hypertension"],
    emergency_contact_name: "Priya Sharma", emergency_contact_phone: "+919876543211",
    profile_photo_url: null, qr_code_url: null
  },
  {
    id: "p2", user_id: "u4", full_name: "Meera Patel", email: "meera@email.com",
    date_of_birth: "1985-11-22", gender: "female", blood_group: "A+",
    phone: "+919876543212", address: "45 Jubilee Hills, Hyderabad",
    allergies: ["Sulfa"], chronic_conditions: ["Diabetes Type 2"],
    emergency_contact_name: "Raj Patel", emergency_contact_phone: "+919876543213",
    profile_photo_url: null, qr_code_url: null
  },
  {
    id: "p3", user_id: "u7", full_name: "Rohan Gupta", email: "rohan@email.com",
    date_of_birth: "1995-03-08", gender: "male", blood_group: "B+",
    phone: "+919876543214", address: "78 Connaught Place, New Delhi",
    allergies: [], chronic_conditions: [],
    emergency_contact_name: "Anita Gupta", emergency_contact_phone: "+919876543215",
    profile_photo_url: null, qr_code_url: null
  }
]

export const mockDoctors = [
  {
    id: "d1", user_id: "u2", full_name: "Dr. Vikram Mehta",
    specialization: "Cardiologist", license_number: "MH-78432",
    years_experience: 12, consultation_fee: 800, is_available: true,
    hospital_id: "h1", bio: "Senior cardiologist with expertise in interventional cardiology.",
    profile_photo_url: null, department: "Cardiology"
  },
  {
    id: "d2", user_id: "u5", full_name: "Dr. Ananya Reddy",
    specialization: "Dermatologist", license_number: "KA-56123",
    years_experience: 8, consultation_fee: 600, is_available: true,
    hospital_id: "h1", bio: "Specialist in cosmetic and clinical dermatology.",
    profile_photo_url: null, department: "Dermatology"
  },
  {
    id: "d3", user_id: "u8", full_name: "Dr. Sanjay Iyer",
    specialization: "Orthopedic Surgeon", license_number: "TN-90821",
    years_experience: 15, consultation_fee: 1000, is_available: false,
    hospital_id: "h1", bio: "Expert in joint replacement and sports injuries.",
    profile_photo_url: null, department: "Orthopedics"
  }
]

export const mockHospitals = [
  {
    id: "h1", user_id: "u3", hospital_name: "Apollo MediCare Hospital",
    registration_number: "HOSP-MH-2021-0042", type: "private",
    address: "221B Linking Road, Bandra West", city: "Mumbai", state: "Maharashtra",
    phone: "+912233445566", email: "admin@apollomedicare.in",
    bed_count: 350, logo_url: null
  }
]

export const mockRecords = [
  {
    id: "r1", patient_id: "p1", uploaded_by_user_id: "u1", record_type: "lab_report",
    title: "CBC Blood Test — Jan 2025", description: "Complete blood count ordered by Dr. Mehta",
    file_name: "cbc_report.pdf", file_size_bytes: 245760, file_mime_type: "application/pdf",
    is_encrypted: true, is_emergency_visible: false, record_date: "2025-01-10",
    created_at: "2025-01-10T09:30:00Z"
  },
  {
    id: "r2", patient_id: "p1", uploaded_by_user_id: "u1", record_type: "prescription",
    title: "Hypertension Medication — Dec 2024", description: "Prescribed by Dr. Mehta",
    file_name: "prescription_dec.pdf", file_size_bytes: 128000, file_mime_type: "application/pdf",
    is_encrypted: true, is_emergency_visible: false, record_date: "2024-12-20",
    created_at: "2024-12-20T14:00:00Z"
  },
  {
    id: "r3", patient_id: "p1", uploaded_by_user_id: "u3", record_type: "scan",
    title: "Chest X-Ray — Feb 2025", description: "Routine checkup scan",
    file_name: "chest_xray.jpg", file_size_bytes: 1548000, file_mime_type: "image/jpeg",
    is_encrypted: true, is_emergency_visible: true, record_date: "2025-02-05",
    created_at: "2025-02-05T11:20:00Z"
  },
  {
    id: "r4", patient_id: "p1", uploaded_by_user_id: "u3", record_type: "discharge",
    title: "Discharge Summary — March 2025", description: "Post cardiac evaluation discharge",
    file_name: "discharge_summary.pdf", file_size_bytes: 320000, file_mime_type: "application/pdf",
    is_encrypted: true, is_emergency_visible: false, record_date: "2025-03-15",
    created_at: "2025-03-15T16:45:00Z"
  },
  {
    id: "r5", patient_id: "p2", uploaded_by_user_id: "u4", record_type: "lab_report",
    title: "HbA1c Test — Feb 2025", description: "Diabetes monitoring",
    file_name: "hba1c.pdf", file_size_bytes: 198000, file_mime_type: "application/pdf",
    is_encrypted: true, is_emergency_visible: false, record_date: "2025-02-12",
    created_at: "2025-02-12T10:15:00Z"
  }
]

export const mockAppointments = [
  {
    id: "a1", patient_id: "p1", doctor_id: "d1", hospital_id: "h1",
    appointment_date: "2025-04-15", appointment_time: "10:30",
    duration_minutes: 30, status: "confirmed", reason: "Routine cardiac checkup",
    notes: null, type: "in_person", rejection_reason: null,
    created_at: "2025-04-01T08:00:00Z",
    doctor: mockDoctors[0], patient: mockPatients[0]
  },
  {
    id: "a2", patient_id: "p1", doctor_id: "d2", hospital_id: "h1",
    appointment_date: "2025-04-20", appointment_time: "14:00",
    duration_minutes: 30, status: "pending", reason: "Skin rash on forearm",
    notes: null, type: "video", rejection_reason: null,
    created_at: "2025-04-05T12:00:00Z",
    doctor: mockDoctors[1], patient: mockPatients[0]
  },
  {
    id: "a3", patient_id: "p2", doctor_id: "d1", hospital_id: "h1",
    appointment_date: "2025-04-12", appointment_time: "09:00",
    duration_minutes: 30, status: "completed", reason: "Chest pain and shortness of breath",
    notes: "Patient stable. ECG normal. Prescribed Amlodipine 5mg.", type: "in_person",
    rejection_reason: null, created_at: "2025-03-28T09:00:00Z",
    doctor: mockDoctors[0], patient: mockPatients[1]
  },
  {
    id: "a4", patient_id: "p3", doctor_id: "d1", hospital_id: "h1",
    appointment_date: "2025-04-18", appointment_time: "11:00",
    duration_minutes: 30, status: "pending", reason: "Follow-up heart checkup",
    notes: null, type: "phone", rejection_reason: null,
    created_at: "2025-04-06T15:30:00Z",
    doctor: mockDoctors[0], patient: mockPatients[2]
  },
  {
    id: "a5", patient_id: "p1", doctor_id: "d3", hospital_id: "h1",
    appointment_date: "2025-03-20", appointment_time: "16:00",
    duration_minutes: 30, status: "rejected", reason: "Knee pain after jogging",
    notes: null, type: "in_person",
    rejection_reason: "Doctor unavailable. Please rebook for April.",
    created_at: "2025-03-10T10:00:00Z",
    doctor: mockDoctors[2], patient: mockPatients[0]
  }
]

export const mockPrescriptions = [
  {
    id: "rx1", patient_id: "p1", doctor_id: "d1", appointment_id: "a3",
    diagnosis: "Hypertensive urgency — BP 160/100",
    notes: "Reduce sodium intake. Daily walking 30 min. Follow up in 4 weeks.",
    is_active: true, valid_until: "2025-05-15", created_at: "2025-04-12T10:00:00Z",
    doctor: mockDoctors[0],
    medications: [
      { id: "m1", medication_name: "Amlodipine", dosage: "5mg", frequency: "Once daily (morning)", duration: "30 days", instructions: "Take with water, avoid grapefruit" },
      { id: "m2", medication_name: "Telmisartan", dosage: "40mg", frequency: "Once daily", duration: "30 days", instructions: "Can be taken with or without food" }
    ]
  },
  {
    id: "rx2", patient_id: "p1", doctor_id: "d2", appointment_id: null,
    diagnosis: "Contact dermatitis — allergic reaction",
    notes: "Avoid harsh soaps. Use prescribed cream for 7 days.",
    is_active: false, valid_until: "2025-02-28", created_at: "2025-01-28T14:30:00Z",
    doctor: mockDoctors[1],
    medications: [
      { id: "m3", medication_name: "Betamethasone Cream", dosage: "0.1%", frequency: "Twice daily", duration: "7 days", instructions: "Apply thin layer on affected area" },
      { id: "m4", medication_name: "Cetirizine", dosage: "10mg", frequency: "Once daily (night)", duration: "10 days", instructions: "May cause drowsiness" }
    ]
  }
]

export const mockConsents = [
  {
    id: "c1", patient_id: "p1", grantee_user_id: "u2", grantee_role: "doctor",
    status: "active", access_level: "read_only",
    record_types_allowed: ["lab_report", "prescription"],
    granted_at: "2025-03-01T10:00:00Z", expires_at: "2025-09-01T00:00:00Z", revoked_at: null,
    grantee: { full_name: "Dr. Vikram Mehta", role: "doctor", specialization: "Cardiologist" }
  },
  {
    id: "c2", patient_id: "p1", grantee_user_id: "u3", grantee_role: "hospital",
    status: "active", access_level: "full",
    record_types_allowed: ["lab_report", "prescription", "scan", "discharge"],
    granted_at: "2025-01-15T08:00:00Z", expires_at: null, revoked_at: null,
    grantee: { full_name: "Apollo MediCare Hospital", role: "hospital" }
  },
  {
    id: "c3", patient_id: "p1", grantee_user_id: "u5", grantee_role: "doctor",
    status: "revoked", access_level: "read_only",
    record_types_allowed: ["lab_report"],
    granted_at: "2024-11-01T09:00:00Z", expires_at: "2025-05-01T00:00:00Z",
    revoked_at: "2025-02-15T12:00:00Z",
    grantee: { full_name: "Dr. Ananya Reddy", role: "doctor", specialization: "Dermatologist" }
  }
]

export const mockFamilyMembers = [
  {
    id: "f1", patient_id: "p1", full_name: "Priya Sharma",
    relationship: "spouse", date_of_birth: "1992-08-20",
    blood_group: "A+", allergies: ["Dust"]
  },
  {
    id: "f2", patient_id: "p1", full_name: "Arjun Sharma",
    relationship: "child", date_of_birth: "2018-03-12",
    blood_group: "O+", allergies: []
  }
]

export const mockInsurance = [
  {
    id: "ins1", patient_id: "p1", provider_name: "Star Health Insurance",
    policy_number: "SHI-2024-987654", policy_type: "health",
    valid_from: "2024-04-01", valid_until: "2025-03-31",
    coverage_amount: 500000, document_url: null, is_active: false
  },
  {
    id: "ins2", patient_id: "p1", provider_name: "ICICI Lombard",
    policy_number: "ICL-2025-123456", policy_type: "health",
    valid_from: "2025-04-01", valid_until: "2026-03-31",
    coverage_amount: 1000000, document_url: null, is_active: true
  }
]

export const mockBilling = [
  {
    id: "b1", hospital_id: "h1", patient_id: "p1", appointment_id: "a3",
    invoice_number: "INV-2025-0042", status: "paid", payment_method: "card",
    services: [
      { name: "Consultation Fee", quantity: 1, unit_price: 800 },
      { name: "ECG Test", quantity: 1, unit_price: 750 },
      { name: "Blood Test (CBC)", quantity: 1, unit_price: 350 }
    ],
    subtotal: 1900, tax_amount: 95, discount_amount: 100,
    total_amount: 1895, paid_at: "2025-04-12T12:00:00Z",
    created_at: "2025-04-12T10:30:00Z", patient: mockPatients[0]
  },
  {
    id: "b2", hospital_id: "h1", patient_id: "p2", appointment_id: null,
    invoice_number: "INV-2025-0043", status: "unpaid", payment_method: null,
    services: [
      { name: "MRI Scan (Brain)", quantity: 1, unit_price: 8000 },
      { name: "Consultation Fee", quantity: 1, unit_price: 800 }
    ],
    subtotal: 8800, tax_amount: 440, discount_amount: 0,
    total_amount: 9240, paid_at: null,
    created_at: "2025-04-08T09:00:00Z", patient: mockPatients[1]
  },
  {
    id: "b3", hospital_id: "h1", patient_id: "p3", appointment_id: null,
    invoice_number: "INV-2025-0044", status: "partial", payment_method: "upi",
    services: [
      { name: "Room Charges (3 days)", quantity: 3, unit_price: 3000 },
      { name: "Surgery - Appendectomy", quantity: 1, unit_price: 45000 },
      { name: "Medications", quantity: 1, unit_price: 2500 }
    ],
    subtotal: 56500, tax_amount: 2825, discount_amount: 5000,
    total_amount: 54325, paid_at: null,
    created_at: "2025-04-05T14:00:00Z", patient: mockPatients[2]
  }
]

export const mockSchedule = [
  { id: "s1", doctor_id: "d1", day_of_week: 1, start_time: "09:00", end_time: "13:00", slot_duration_minutes: 30, is_active: true, max_patients_per_slot: 1 },
  { id: "s2", doctor_id: "d1", day_of_week: 1, start_time: "14:00", end_time: "17:00", slot_duration_minutes: 30, is_active: true, max_patients_per_slot: 1 },
  { id: "s3", doctor_id: "d1", day_of_week: 2, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 30, is_active: true, max_patients_per_slot: 1 },
  { id: "s4", doctor_id: "d1", day_of_week: 3, start_time: "10:00", end_time: "16:00", slot_duration_minutes: 30, is_active: true, max_patients_per_slot: 2 },
  { id: "s5", doctor_id: "d1", day_of_week: 4, start_time: "09:00", end_time: "13:00", slot_duration_minutes: 30, is_active: true, max_patients_per_slot: 1 },
  { id: "s6", doctor_id: "d1", day_of_week: 5, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 30, is_active: false, max_patients_per_slot: 1 },
]

// Mock user objects for auth store
export const mockUsers = {
  patient: { id: "u1", email: "aarav@email.com", role: "patient", full_name: "Aarav Sharma", is_verified: true },
  doctor: { id: "u2", email: "vikram@email.com", role: "doctor", full_name: "Dr. Vikram Mehta", is_verified: true },
  hospital: { id: "u3", email: "admin@apollomedicare.in", role: "hospital", full_name: "Apollo MediCare Hospital", is_verified: true },
}
