"use client";

import DashboardSidebar from '@/components/DashboardSidebar';
import { organizerNavigation } from '@/data/navigation/dashboard-navigation';

const OrganizerLayout = ({ children }: { children: React.ReactNode }) => {
  
  // Mock user data - replace with actual auth context
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    initials: "JD",
    role: "organizer",
    avatar: "" // Optional: URL to user avatar
  };

  const handleSignOut = () => {
    // TODO: Implement actual sign out logic
    console.log('Organizer signing out...');
  };

  return (
    <DashboardSidebar
      navigation={organizerNavigation}
      user={mockUser}
      onSignOut={handleSignOut}
      headerTitle="Organizer Dashboard"
    >
      {children}
    </DashboardSidebar>
  );
};

export default OrganizerLayout;