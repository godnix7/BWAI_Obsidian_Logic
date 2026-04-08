import api from "./axios"

export const loginApi = async (email, password) => {
  return await api.post("/auth/login", { email, password })
}

export const registerApi = async (data) => {
  // Extract only the fields the backend RegisterRequest expects to avoid 422 Unprocessable errors
  const requestBody = {
    email: data.email,
    password: data.password,
    phone: data.phone || undefined,
    role: data.role
  }
  return await api.post("/auth/register", requestBody)
}
