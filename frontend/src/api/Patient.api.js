import api from "./axios"

// --- RECORDS ---
export const getRecords = () => api.get("/patient/records")
export const getPrescriptions = () => api.get("/patient/prescriptions")
export const uploadRecord = (formData) => api.post("/patient/records/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
})
export const getRecordUrl = (id) => api.get(`/patient/records/${id}/url`)
export const deleteRecord = (id) => api.delete(`/patient/records/${id}`)

// --- APPOINTMENTS ---
export const getAppointments = () => api.get("/patient/appointments")
export const bookAppointment = (data) => api.post("/patient/appointments", data)
export const cancelAppointment = (id) => api.delete(`/patient/appointments/${id}`)
export const getAvailableDoctors = () => api.get("/doctor/public")
export const getAvailableHospitals = () => api.get("/hospital/public")

// --- FAMILY MEMBERS ---
export const getFamilyMembers = () => api.get("/patient/family")
export const addFamilyMember = (data) => api.post("/patient/family", data)
export const updateFamilyMember = (id, data) => api.put(`/patient/family/${id}`, data)
export const deleteFamilyMember = (id) => api.delete(`/patient/family/${id}`)

// --- INSURANCE ---
export const getInsurance = () => api.get("/patient/insurance")
export const addInsurance = (data) => api.post("/patient/insurance", data)
export const updateInsurance = (id, data) => api.put(`/patient/insurance/${id}`, data)
export const uploadInsuranceDoc = (id, formData) => api.post(`/patient/insurance/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
})
export const deleteInsurance = (id) => api.delete(`/patient/insurance/${id}`)
export const getInsuranceDocument = (id) => api.get(`/patient/insurance/${id}/document`)

// --- CONSENTS ---
export const getConsents = () => api.get("/patient/consents")
export const grantConsent = (data) => api.post("/patient/consents", data)
export const revokeConsent = (id) => api.delete(`/patient/consents/${id}`)

// --- EMERGENCY & QR ---
export const getQRConfig = () => api.get("/patient/emergency-qr")
export const updateQRConfig = (data) => api.put("/patient/emergency-qr/config", data)
export const regenerateQR = () => api.post("/patient/emergency-qr/regenerate")

// --- PROFILE ---
export const getProfile = () => api.get("/patient/profile")
export const updateProfile = (data) => api.put("/patient/profile", data)
