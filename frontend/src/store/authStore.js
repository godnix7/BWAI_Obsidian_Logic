import { create } from "zustand"

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("medilocker_user")) || null,
  token: localStorage.getItem("medilocker_token") || null,

  setAuth: (data) => {
    localStorage.setItem("medilocker_user", JSON.stringify(data.user))
    localStorage.setItem("medilocker_token", data.access_token)
    set({ user: data.user, token: data.access_token })
  },

  logout: () => {
    localStorage.removeItem("medilocker_user")
    localStorage.removeItem("medilocker_token")
    set({ user: null, token: null })
  }
}))