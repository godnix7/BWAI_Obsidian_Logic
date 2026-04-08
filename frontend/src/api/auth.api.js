import api from "./axios"

export const loginApi = async (email, password) => {
  return await api.post("/auth/login", { email, password })
}

export const registerApi = async (data) => {
  // Pass the data through; Register.jsx now handles the surgical payload construction.
  return await api.post("/auth/register", data)
}
