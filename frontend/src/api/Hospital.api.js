import api from "./axios"

// --- PROFILE ---
export const getHospitalProfile = () => api.get("/hospital/profile")
export const updateHospitalProfile = (data) => api.put("/hospital/profile", data)

// --- DOCTOR MANAGEMENT ---
export const getHospitalDoctors = () => api.get("/hospital/doctors")
export const addDoctorToHospital = (data) => api.post("/hospital/doctors", data)
export const removeDoctorFromHospital = (id) => api.delete(`/hospital/doctors/${id}`)

// --- LAB REPORTS ---
export const uploadLabReport = (formData) => api.post("/hospital/lab-reports", formData, {
    headers: { "Content-Type": "multipart/form-data" }
})
export const getLabReports = () => api.get("/hospital/lab-reports")
export const getUploadedReports = getLabReports  // alias kept for backwards compat
export const getReceivedConsents = () => api.get("/patient/consents/hospital/received")
export const getHospitalPatients = () => api.get("/hospital/patients")
export const getHospitalPatientRecords = (patientId) => api.get(`/hospital/patients/${patientId}/records`)
export const resolveEmergencyQR = (qr_payload) => api.post("/hospital/emergency-qr/resolve", { qr_payload })

// --- BILLING & INVOICES ---
export const getInvoices = () => api.get("/hospital/billing")
export const createInvoice = (data) => api.post("/hospital/billing", data)
export const updateInvoice = (id, data) => api.patch(`/hospital/billing/${id}`, data)
