'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@dashboard/api-client';
import { useAuth, useLogin, useRegister } from '@dashboard/api-client';
import type { User, LoginRequest, RegisterRequest } from '@dashboard/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [client, setClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    // Create API client with current token
    const apiClient = new ApiClient(API_URL, () => token);
    setClient(apiClient);
  }, [token]);

  const loginMutation = useLogin(client || new ApiClient(API_URL, () => null));
  const registerMutation = useRegister(client || new ApiClient(API_URL, () => null));
  const { data: user, isLoading: isLoadingUser } = useAuth(
    client || new ApiClient(API_URL, () => null),
    {
      enabled: !!token && !!client,
    }
  );

  const login = async (credentials: LoginRequest) => {
    if (!client) {
      const tempClient = new ApiClient(API_URL, () => null);
      const result = await tempClient.login(credentials);
      setToken(result.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
      }
      return;
    }
    const result = await loginMutation.mutateAsync(credentials);
    setToken(result.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', result.token);
    }
  };

  const register = async (data: RegisterRequest) => {
    if (!client) {
      const tempClient = new ApiClient(API_URL, () => null);
      const result = await tempClient.register(data);
      setToken(result.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
      }
      return;
    }
    const result = await registerMutation.mutateAsync(data);
    setToken(result.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', result.token);
    }
  };

  const logout = () => {
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  const isLoading = isLoadingUser || loginMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
