import { create } from "zustand"

const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem("medilocker_user");
    if (!stored) return null;
    
    // Attempt parsing
    const parsed = JSON.parse(stored);
    
    // Ensure it's a valid object with a role to prevent infinite redirect loops
    if (parsed && typeof parsed === 'object' && parsed.role) {
      return parsed;
    }
    
    // If malformed, clear it
    localStorage.removeItem("medilocker_user");
    return null;
  } catch (e) {
    localStorage.removeItem("medilocker_user");
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getUserFromStorage(),
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