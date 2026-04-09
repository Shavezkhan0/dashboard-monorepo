'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@dashboard/api-client';
import { useAuth, useLogin, useRegister } from '@dashboard/api-client';
import type { User, LoginRequest, RegisterRequest } from '@dashboard/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AuthContextType {
  user: User | null;
  token: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setPendingRedirect: (path: string) => void;
  getPendingRedirect: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [client, setClient] = useState<ApiClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Logout function - must be defined before use
  const logout = () => {
    setToken(null);
    setExpiresAt(null);
    setRefreshToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('expiresAt');
      localStorage.removeItem('refreshToken');
    }
  };

  // Load token from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedExpiresAt = localStorage.getItem('expiresAt');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken && storedExpiresAt) {
        const expiry = new Date(storedExpiresAt);
        if (expiry > new Date()) {
          // Token is still valid
          setToken(storedToken);
          setExpiresAt(storedExpiresAt);
          setRefreshToken(storedRefreshToken);
        } else {
          // Token expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('expiresAt');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Create API client when token changes - pass function that gets current token from localStorage
  useEffect(() => {
    const apiClient = new ApiClient(API_URL, () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
      }
      return null;
    });
    setClient(apiClient);
  }, []);

  // Auto-refresh token 1 hour before expiration
  useEffect(() => {
    if (!expiresAt || !refreshToken || !token) return;

    const expiry = new Date(expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiry.getTime() - now.getTime();
    const refreshTime = timeUntilExpiry - (60 * 60 * 1000); // 1 hour before

    if (refreshTime > 0) {
      const timeout = setTimeout(async () => {
        try {
          const tempClient = new ApiClient(API_URL, () => null);
          const result = await tempClient.refreshToken(refreshToken);
          setToken(result.token);
          setRefreshToken(result.refreshToken);
          setExpiresAt(result.expiresAt);
          localStorage.setItem('token', result.token);
          localStorage.setItem('refreshToken', result.refreshToken);
          localStorage.setItem('expiresAt', result.expiresAt);
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      }, refreshTime);

      return () => clearTimeout(timeout);
    }
  }, [expiresAt, refreshToken, token]);

  const setPendingRedirect = (path: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingRedirect', path);
    }
  };

  const getPendingRedirect = (): string | null => {
    if (typeof window !== 'undefined') {
      const path = sessionStorage.getItem('pendingRedirect');
      sessionStorage.removeItem('pendingRedirect');
      return path;
    }
    return null;
  };

  const getTokenGetter = () => {
    if (typeof window !== 'undefined') {
      return () => localStorage.getItem('token');
    }
    return () => null;
  };

  const loginMutation = useLogin(new ApiClient(API_URL, getTokenGetter()));
  const registerMutation = useRegister(new ApiClient(API_URL, getTokenGetter()));

  // Fetch user data when we have a token - always use a valid client with localStorage token getter
  const { data: user, isLoading: isLoadingUser } = useAuth(
    new ApiClient(API_URL, getTokenGetter()),
    {
      enabled: !!token && isInitialized,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const login = async (credentials: LoginRequest) => {
    try {
      const tempClient = new ApiClient(API_URL, () => null);
      const result = await tempClient.login(credentials);

      // The API client already unwraps the 'data' field, so result is AuthResponse
      setToken(result.token);
      setRefreshToken(result.refreshToken);
      setExpiresAt(result.expiresAt);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('expiresAt', result.expiresAt);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const tempClient = new ApiClient(API_URL, () => null);
      const result = await tempClient.register(data);

      // The API client already unwraps the 'data' field, so result is AuthResponse
      setToken(result.token);
      setRefreshToken(result.refreshToken);
      setExpiresAt(result.expiresAt);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('expiresAt', result.expiresAt);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Show loading until we've checked localStorage and fetched user data (if token exists)
  const isLoading = !isInitialized || (!!token && isLoadingUser) || loginMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user: user as User | null,
        token,
        expiresAt,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        setPendingRedirect,
        getPendingRedirect,
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
