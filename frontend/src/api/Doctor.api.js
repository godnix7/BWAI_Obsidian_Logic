import api from "./axios"

/**
 * Fetch all appointments for the logged-in doctor
 */
export const getDoctorAppointments = () => {
    return api.get("/doctor/appointments")
}

/**
 * Update the status of an appointment
 * @param {string} id - Appointment UUID
 * @param {string} status - New status (confirmed, rejected, completed)
 * @param {string} notes - Optional clinical notes
 * @param {string} rejection_reason - Optional reason for rejection
 */
export const updateAppointmentStatus = (id, status, notes = "", rejection_reason = "") => {
    return api.patch(`/doctor/appointments/${id}/status`, {
        status,
        notes,
        rejection_reason
    })
}
