'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ORGANIZER' | 'ATTENDEE' | 'ADMIN';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login'
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = user || getUser();
      
      if (!currentUser) {
        router.push(redirectTo);
        return;
      }

      // If user role is PENDING, redirect to onboarding
      if (currentUser.role === 'PENDING') {
        router.push('/onboarding');
        return;
      }

      if (requiredRole && currentUser.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (currentUser.role === 'ORGANIZER') {
          router.push('/organizer');
        } else if (currentUser.role === 'ATTENDEE') {
          router.push('/attendee');
        } else {
          router.push('/admin');
        }
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [user, requiredRole, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A011D]"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Specific route guards
export const OrganizerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="ORGANIZER">{children}</ProtectedRoute>
);

export const AttendeeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="ATTENDEE">{children}</ProtectedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>
);