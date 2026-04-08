import * as DocumentPicker from "expo-document-picker";
import { API_BASE_URL } from "../config";
import { cleanObject } from "../utils";

async function request(path, { method = "GET", token, body, isMultipart = false } = {}) {
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    const detail = data?.detail || data?.message || text || `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  health: () => fetch(API_BASE_URL.replace(/\/api\/v1\/?$/, "") + "/health").then((res) => res.json()),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (payload) => request("/auth/register", { method: "POST", body: cleanObject(payload) }),
  me: (token) => request("/auth/me", { token }),

  getPatientProfile: (token) => request("/patient/profile", { token }),
  updatePatientProfile: (token, payload) => request("/patient/profile", { token, method: "PUT", body: cleanObject(payload) }),
  listFamily: (token) => request("/patient/family", { token }),
  addFamily: (token, payload) => request("/patient/family", { token, method: "POST", body: cleanObject(payload) }),

  listRecords: (token) => request("/patient/records", { token }),
  deleteRecord: (token, id) => request(`/patient/records/${id}`, { token, method: "DELETE" }),
  uploadRecord: async (token, payload) => {
    const picked = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false, multiple: false });
    if (picked.canceled || !picked.assets?.length) {
      throw new Error("File selection cancelled.");
    }

    const asset = picked.assets[0];
    const form = new FormData();
    form.append("title", payload.title);
    form.append("record_type", payload.record_type);
    form.append("record_date", payload.record_date);
    form.append("description", payload.description || "");
    form.append("is_emergency_visible", String(Boolean(payload.is_emergency_visible)));
    form.append("file", {
      uri: asset.uri,
      name: asset.name || "record",
      type: asset.mimeType || "application/octet-stream",
    });

    return request("/patient/records/upload", { token, method: "POST", body: form, isMultipart: true });
  },

  listAppointments: (token) => request("/patient/appointments", { token }),
  bookAppointment: (token, payload) => request("/patient/appointments", { token, method: "POST", body: cleanObject(payload) }),
  cancelAppointment: (token, id) => request(`/patient/appointments/${id}`, { token, method: "DELETE" }),

  listPrescriptions: (token) => request("/patient/prescriptions", { token }),

  listConsents: (token) => request("/patient/consents", { token }),
  grantConsent: (token, payload) => request("/patient/consents", { token, method: "POST", body: cleanObject(payload) }),
  revokeConsent: (token, id) => request(`/patient/consents/${id}`, { token, method: "DELETE" }),

  listInsurance: (token) => request("/patient/insurance", { token }),
  addInsurance: (token, payload) => request("/patient/insurance", { token, method: "POST", body: cleanObject(payload) }),
  deleteInsurance: (token, id) => request(`/patient/insurance/${id}`, { token, method: "DELETE" }),

  getEmergencyQr: (token) => request("/patient/emergency-qr", { token }),
  updateEmergencyQr: (token, payload) => request("/patient/emergency-qr/config", { token, method: "PUT", body: payload }),
  regenerateEmergencyQr: (token) => request("/patient/emergency-qr/regenerate", { token, method: "POST" }),

  getDoctorAppointments: (token) => request("/doctor/appointments", { token }),
  updateDoctorAppointment: (token, id, payload) =>
    request(`/doctor/appointments/${id}/status`, { token, method: "PATCH", body: payload }),

  getHospitalProfile: (token) => request("/hospital/profile", { token }),
};
