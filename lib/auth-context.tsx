'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthInstance } from './firebase';
import { getCurrentAdmin, storeAuthToken, clearAuthToken } from './auth';
import type { AdminUser } from './auth';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role?: 'admin' | 'super-admin' | 'teacher' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = getAuthInstance();
        if (!auth) {
          setLoading(false);
          return;
        }

        // Listen to auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
          if (firebaseUser) {
            try {
              const adminUser = await getCurrentAdmin();
              if (adminUser) {
                setUser(adminUser);
                const idToken = await firebaseUser.getIdToken();
                storeAuthToken(idToken);
              } else {
                setUser(null);
                clearAuthToken();
              }
            } catch {
              setUser(null);
              clearAuthToken();
            }
          } else {
            setUser(null);
            clearAuthToken();
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const { loginAdmin } = await import('./auth');
      const { user: adminUser, idToken } = await loginAdmin(email, password);
      storeAuthToken(idToken);
      setUser(adminUser);
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, role?: 'admin' | 'super-admin' | 'teacher' | 'student') => {
    try {
      setError(null);
      setLoading(true);
      const { registerAdmin } = await import('./auth');
      const { user: adminUser, idToken } = await registerAdmin(email, password, displayName, role);
      storeAuthToken(idToken);
      setUser(adminUser);
    } catch (err: any) {
      const message = err.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      const { logoutAdmin } = await import('./auth');
      await logoutAdmin();
      setUser(null);
      clearAuthToken();
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { sendPasswordReset } = await import('./auth');
      await sendPasswordReset(email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, resetPassword, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
