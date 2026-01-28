
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import type { AuthContextType } from '../types';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    setAccessToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);
    setIsLoading(false);
  }, []);

  const handleLogin = async (data: { access_token: string; refresh_token: string }) => {
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    navigate('/chat');
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    await handleLogin(data);
  }, [navigate]);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.register(email, password);
    return res;
    // NOTE: We intentionally do NOT auto-login after registration.
    // email verification is required for all users.
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    navigate('/auth');
  }, [navigate]);

  const value = useMemo(() => ({
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    register,
    logout,
  }), [accessToken, isLoading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
