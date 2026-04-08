import api from "./axios"

// GET all records
export const getRecords = () => {
    return api.get("/patient/records")
}

// UPLOAD record
export const uploadRecord = (formData) => {
    return api.post("/patient/records/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

// GET preview URL
export const getRecordUrl = (id) => {
    return api.get(`/patient/records/${id}/url`)
}