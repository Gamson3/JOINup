"use client";

import DashboardSidebar from '@/components/DashboardSidebar';
import { attendeeNavigation } from '@/data/navigation/dashboard-navigation';

const AttendeeLayout = ({ children }: { children: React.ReactNode }) => {
  
  // Mock user data - replace with actual auth context
  const mockUser = {
    name: "Jane Smith",
    email: "jane@example.com",
    initials: "JS",
    role: "attendee",
    avatar: ""
  };

  const handleSignOut = () => {
    // TODO: Implement actual sign out logic
    console.log('Attendee signing out...');
  };

  return (
    <DashboardSidebar
      navigation={attendeeNavigation}
      user={mockUser}
      onSignOut={handleSignOut}
      headerTitle="My Events"
    >
      {children}
    </DashboardSidebar>
  );
};

export default AttendeeLayout;