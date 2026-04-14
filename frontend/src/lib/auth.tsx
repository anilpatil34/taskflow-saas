'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from './api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User> | FormData) => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me/');
      setUser(res.data.data);
    } catch {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login/', { email, password });
    const { user: userData, tokens } = res.data.data;
    Cookies.set('access_token', tokens.access, { expires: 1 });
    Cookies.set('refresh_token', tokens.refresh, { expires: 7 });
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post('/api/auth/register/', data);
    const { user: userData, tokens } = res.data.data;
    Cookies.set('access_token', tokens.access, { expires: 1 });
    Cookies.set('refresh_token', tokens.refresh, { expires: 7 });
    setUser(userData);
  };

  const logout = async () => {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        await api.post('/api/auth/logout/', { refresh: refreshToken });
      }
    } catch {
      // Ignore errors during logout
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User> | FormData) => {
    let headers = {};
    if (data instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.patch('/api/auth/me/', data, { headers });
    setUser(res.data.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
