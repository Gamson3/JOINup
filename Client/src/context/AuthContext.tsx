'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/state/redux';
import { setCredentials, clearCredentials, setError, clearError, setLoading } from '@/state/authSlice';
import { apiClient, getUser, clearTokens, setUser, getAccessToken, getRefreshToken, type User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUserRole: (role: 'ORGANIZER' | 'ATTENDEE') => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoadingState] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUserState(savedUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoadingState(true);
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await apiClient.login(email, password);
      const userData = response.user;
      const { accessToken, refreshToken } = response;

      setUserState(userData);
      dispatch(setCredentials({
        user: userData,
        accessToken,
        refreshToken
      }));

      // Redirect based on user role
      if (userData.role === 'PENDING') {
        router.push('/onboarding');
      } else if (userData.role === 'ORGANIZER') {
        router.push('/organizer');
      } else if (userData.role === 'ATTENDEE') {
        router.push('/attendee');
      } else if (userData.role === 'ADMIN') {
        router.push('/admin');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string
  ): Promise<void> => {
    try {
      setLoadingState(true);
      dispatch(setLoading(true));
      dispatch(clearError());

      // Register with PENDING role
      const response = await apiClient.register(email, password, name, 'PENDING');
      const userData = response.user;
      const { accessToken, refreshToken } = response;

      setUserState(userData);
      dispatch(setCredentials({
        user: userData,
        accessToken,
        refreshToken
      }));

      // Always redirect to onboarding after registration
      router.push('/onboarding');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  const updateUserRole = async (role: 'ORGANIZER' | 'ATTENDEE'): Promise<void> => {
    try {
      setLoadingState(true);
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await apiClient.updateUserRole(role);
      const updatedUser = response.user;

      // Update user in state and localStorage
      setUserState(updatedUser);
      setUser(updatedUser);
      
      // Get current tokens from localStorage
      const currentAccessToken = getAccessToken();
      const currentRefreshToken = getRefreshToken();
      
      // Update Redux state with existing tokens
      dispatch(setCredentials({
        user: updatedUser,
        accessToken: currentAccessToken || '',
        refreshToken: currentRefreshToken || ''
      }));

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update role';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUserState(null);
      dispatch(clearCredentials());
      clearTokens();
      router.push('/auth/login');
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      updateUserRole,
      logout,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};