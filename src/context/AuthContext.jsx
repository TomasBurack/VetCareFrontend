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
  const [isResolvingSession, setIsResolvingSession] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setSession(null);
    });
  }, []);

  useEffect(() => {
    authApi
      .me()
      .then((result) => persistSession(result))
      .catch(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setSession(null);
      })
      .finally(() => setIsResolvingSession(false));
  }, []);

  function persistSession(authResponse) {
    const next = {
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
    if (result.twoFactorRequired) {
      return { twoFactorRequired: true, pendingToken: result.pendingTwoFactorToken };
    }
    return persistSession(result);
  }

  async function verifyTwoFactor(pendingToken, code) {
    const result = await authApi.verifyTwoFactor(pendingToken, code);
    return persistSession(result);
  }

  async function register(data) {
    const result = await authApi.signUp(data);
    return persistSession(result);
  }

  async function logout() {
    try {
      await authApi.signOut();
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setSession(null);
    }
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
    isResolvingSession,
    role: session?.role ?? null,
    login,
    verifyTwoFactor,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
