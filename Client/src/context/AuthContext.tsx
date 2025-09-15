'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/state/redux';
import { setCredentials, clearCredentials, setError, clearError, setLoading } from '@/state/authSlice';
import { apiClient, getUser, clearTokens, setUser as persistUser, getAccessToken, setTokens, type User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  loginAttendee: (email: string, password: string, remember?: boolean) => Promise<void>;
  loginOrganizer: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, remember?: boolean) => Promise<void>;
  registerAttendee: (email: string, password: string, name: string, remember?: boolean) => Promise<void>;
  registerOrganizer: (email: string, password: string, name: string, remember?: boolean) => Promise<void>;
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

  const redirectByRoles = (roles: User['roles']) => {
    // Adjust priority if needed
    if (roles?.includes('admin')) return router.push('/admin');
    if (roles?.includes('organizer')) return router.push('/organizer');
    if (roles?.includes('attendee')) return router.push('/attendee');
    if (roles?.includes('pending' as any)) return router.push('/onboarding');
    return router.push('/');
  };

  function handleAuthSuccess(userData: User, accessToken: string, remember: boolean) {
    setTokens(accessToken, remember);
    persistUser(userData, remember);
    setUserState(userData);
    dispatch(setCredentials({ user: userData, accessToken }));
    redirectByRoles(userData.roles);
  }

  const loginAttendee = async (email: string, password: string, remember: boolean = false) => {
    try {
      setLoadingState(true); dispatch(setLoading(true)); dispatch(clearError());
      const response = await apiClient.loginAttendee(email, password);
      const { user: userData, accessToken } = response.data;
      handleAuthSuccess(userData, accessToken, remember);
    } catch (error: any) {
      const msg = error?.message || 'Login failed';
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      setLoadingState(false); dispatch(setLoading(false));
    }
  };

  const loginOrganizer = async (email: string, password: string, remember: boolean = false) => {
    try {
      setLoadingState(true); dispatch(setLoading(true)); dispatch(clearError());
      const response = await apiClient.loginOrganizer(email, password);
      const { user: userData, accessToken } = response.data;
      handleAuthSuccess(userData, accessToken, remember);
    } catch (error: any) {
      const msg = error?.message || 'Login failed';
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      setLoadingState(false); dispatch(setLoading(false));
    }
  };

  // Keep existing login for attendee default
  const login = (email: string, password: string, remember: boolean = false) =>
    loginAttendee(email, password, remember);

  const registerAttendee = async (email: string, password: string, name: string, remember: boolean = true) => {
    try {
      setLoadingState(true); dispatch(setLoading(true)); dispatch(clearError());
      const response = await apiClient.registerAttendee(email, password, name);
      const { user: userData, accessToken } = response.data;
      handleAuthSuccess(userData, accessToken, remember);
      // New users flow
      // router.push('/onboarding'); // enable if you want onboarding for attendees
    } catch (error: any) {
      const msg = error?.message || 'Registration failed';
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      setLoadingState(false); dispatch(setLoading(false));
    }
  };

  const registerOrganizer = async (email: string, password: string, name: string, remember: boolean = true) => {
    try {
      setLoadingState(true); dispatch(setLoading(true)); dispatch(clearError());
      const response = await apiClient.registerOrganizer(email, password, name);
      const { user: userData, accessToken } = response.data;
      handleAuthSuccess(userData, accessToken, remember);
      // router.push('/organizer/onboarding'); // optional organizer-specific onboarding
    } catch (error: any) {
      const msg = error?.message || 'Registration failed';
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      setLoadingState(false); dispatch(setLoading(false));
    }
  };

  // Keep existing register as attendee default
  const register = (email: string, password: string, name: string, remember: boolean = true) =>
    registerAttendee(email, password, name, remember);

  const updateUserRole = async (role: 'ORGANIZER' | 'ATTENDEE'): Promise<void> => {
    try {
      setLoadingState(true);
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await apiClient.updateUserRole(role);
      const updatedUser = response.data.user;

      // Update user in state and localStorage
      setUserState(updatedUser);
      persistUser(updatedUser);

      // Keep current access token (or call refresh if your JWT embeds roles)
      const currentAccessToken = getAccessToken() || '';
      dispatch(setCredentials({
        user: updatedUser,
        accessToken: currentAccessToken
      }));
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update role';
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
      loginAttendee,
      loginOrganizer,
      register,
      registerAttendee,
      registerOrganizer,
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