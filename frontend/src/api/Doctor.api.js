import api from "./axios"

// --- APPOINTMENTS ---
export const getDoctorAppointments = (status = null) => 
    api.get("/doctor/appointments", { params: status ? { status } : {} })
export const updateAppointmentStatus = (id, statusOrPayload, notes = "", rejection_reason = "") => {
    const payload = typeof statusOrPayload === "object"
        ? statusOrPayload
        : { status: statusOrPayload, notes, rejection_reason }
    return api.patch(`/doctor/appointments/${id}/status`, payload)
}
export const getReceivedConsents = () => api.get("/patient/consents/doctor/received")
export const getDoctorPatients = () => api.get("/doctor/patients")
export const getPrescriptionPatients = () => api.get("/doctor/prescription-patients")
export const getDoctorPatientRecords = (patientId) => api.get(`/doctor/patients/${patientId}/records`)

// --- PRESCRIPTIONS ---
export const getIssuedPrescriptions = () => api.get("/doctor/prescriptions")
export const createPrescription = (data) => api.post("/doctor/prescriptions", data)

// --- SCHEDULE & SLOTS ---
export const getSchedule = () => api.get("/doctor/schedules")
export const updateSchedule = (schedules) => api.post("/doctor/schedules", schedules)

// --- PROFILE ---
export const getDoctorProfile = () => api.get("/doctor/profile")
export const updateDoctorProfile = (data) => api.put("/doctor/profile", data)
