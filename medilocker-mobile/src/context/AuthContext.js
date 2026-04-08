import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_KEY = "medilocker_mobile_token";
const REFRESH_KEY = "medilocker_mobile_refresh";
const USER_KEY = "medilocker_mobile_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    hydrate();
  }, []);

  async function hydrate() {
    const [storedToken, storedRefresh, storedUser] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);

    if (storedToken) setToken(storedToken);
    if (storedRefresh) setRefreshToken(storedRefresh);
    if (storedUser) setUser(JSON.parse(storedUser));
    setBooting(false);
  }

  async function login(email, password) {
    const response = await api.login(email, password);
    setToken(response.access_token);
    setRefreshToken(response.refresh_token);
    setUser(response.user);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, response.access_token],
      [REFRESH_KEY, response.refresh_token],
      [USER_KEY, JSON.stringify(response.user)],
    ]);
    return response.user;
  }

  async function register(payload) {
    return api.register(payload);
  }

  async function refreshMe() {
    if (!token) return null;
    const me = await api.me(token);
    setUser(me);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    return me;
  }

  async function logout() {
    setToken("");
    setRefreshToken("");
    setUser(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
  }

  const value = useMemo(
    () => ({ token, refreshToken, user, booting, login, register, refreshMe, logout }),
    [token, refreshToken, user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
