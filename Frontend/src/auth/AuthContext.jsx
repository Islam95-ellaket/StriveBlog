import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe, getToken, loginRequest, registerRequest, setToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      if (!getToken()) {
        setInitializing(false);
        return;
      }
      try {
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch (error) {

        if (error.status === 401 || error.status === 500) setToken(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    setToken(data.token);
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(
    async (payload) => {

      await registerRequest(payload);
      return login(payload.email, payload.password);
    },
    [login]
  );

  const loginWithToken = useCallback(async (token) => {
    setToken(token);
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, loginWithToken, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth va usato dentro <AuthProvider>");
  }
  return context;
}
