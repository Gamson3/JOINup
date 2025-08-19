'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect authenticated users away from auth pages
      if (user.role === 'ORGANIZER') {
        router.push('/organizer');
      } else if (user.role === 'ATTENDEE') {
        router.push('/attendee');
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      }
    }
  }, [user, router]);

  // Don't render auth forms if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A011D]"></div>
      </div>
    );
  }

  return <>{children}</>;
};