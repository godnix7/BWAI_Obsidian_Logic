const explicitApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const defaultApiBaseUrl = import.meta.env.DEV
  ? `http://${window.location.hostname}:8002/api/v1`
  : "/api/v1"

export const API_BASE_URL = explicitApiBaseUrl || defaultApiBaseUrl
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "")
