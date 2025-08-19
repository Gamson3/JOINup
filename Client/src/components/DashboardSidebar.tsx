"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, Menu, X, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number; // For notifications/counts
}

interface UserProfile {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
  role: string; // 'organizer', 'attendee', 'admin'
}

interface DashboardSidebarProps {
  navigation: NavigationItem[];
  user: UserProfile;
  onSignOut?: () => void;
  headerTitle?: string;
  className?: string;
  children: React.ReactNode; // Content area
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  navigation,
  user,
  onSignOut,
  headerTitle = "Dashboard",
  className = "",
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Handle root dashboard routes
    if (href.endsWith('/organizer') || href.endsWith('/attendee') || href.endsWith('/admin')) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="text-xl font-bold text-[#6A011D]">JOINup</div>
            <span className="ml-2 text-sm text-gray-500 capitalize">{user.role}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive(item.href)
                        ? 'bg-[#6A011D] text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#6A011D]'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${isActive(item.href)
                          ? 'bg-white text-[#6A011D]'
                          : 'bg-[#6A011D] text-white'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-[#6A011D] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{user.initials}</span>
              </div>
            )}
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-700 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                {headerTitle}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-md hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Profile */}
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-[#6A011D] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user.initials}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* This is where the page content will be rendered */}
        <main className="p-6">
          {/* Content will be passed as children in the layout components */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardSidebar;