"use client";

import DashboardSidebar from '@/components/DashboardSidebar';
import { OrganizerRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { organizerNavigation } from '@/data/navigation/dashboard-navigation';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const userProfile = {
    name: user.name,
    email: user.email,
    initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    role: 'organizer'
  };

  return (
    <OrganizerRoute>
      <DashboardSidebar
        navigation={organizerNavigation}
        user={userProfile}
        onSignOut={logout}
        headerTitle="Organizer Dashboard"
      >
        {children}
      </DashboardSidebar>
    </OrganizerRoute>
  );
}