"use client";

import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation: any[];
  user: any;
  onSignOut?: () => void;
  headerTitle?: string;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navigation,
  user,
  onSignOut,
  headerTitle,
  className
}) => {
  return (
    <DashboardSidebar
      navigation={navigation}
      user={user}
      onSignOut={onSignOut}
      headerTitle={headerTitle}
      className={className}
    >
      <div className="space-y-6">
        {children}
      </div>
    </DashboardSidebar>
  );
};

export default DashboardLayout;