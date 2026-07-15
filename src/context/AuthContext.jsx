import { useEffect, useState } from 'react';
import { AUTH_STORAGE_KEY, setUnauthorizedHandler } from '../api/client';
import { authApi } from '../api/endpoints';
import { AuthContext } from './authContextObject';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setSession(null);
    });
  }, []);

  function persistSession(authResponse) {
    const next = {
      token: authResponse.token,
      role: authResponse.role,
      userId: authResponse.userId,
      email: authResponse.email,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return next;
  }

  async function login(email, password) {
    const result = await authApi.signIn(email, password);
    return persistSession(result);
  }

  async function register(data) {
    const result = await authApi.signUp(data);
    return persistSession(result);
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  }

  async function requestPasswordReset(email) {
    await authApi.forgotPassword(email);
  }

  async function resetPassword(token, newPassword) {
    await authApi.resetPassword(token, newPassword);
  }

  const value = {
    session,
    isAuthenticated: !!session,
    role: session?.role ?? null,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
