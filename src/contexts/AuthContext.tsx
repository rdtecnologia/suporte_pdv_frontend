'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loginRequest, getMeRequest } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  commercialName: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (cnpjCpf: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'suporte_pdv_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const me = await getMeRequest(token);
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchUser(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = async (cnpjCpf: string, password: string) => {
    const { accessToken } = await loginRequest(cnpjCpf, password);
    localStorage.setItem(TOKEN_KEY, accessToken);
    await fetchUser(accessToken);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
