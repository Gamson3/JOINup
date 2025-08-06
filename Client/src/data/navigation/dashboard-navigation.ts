import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  BookOpen,
  Star,
  CreditCard,
  UserCheck,
  Shield,
  Database
} from 'lucide-react';

// Organizer Navigation
export const organizerNavigation = [
  { name: 'Dashboard', href: '/organizer', icon: LayoutDashboard },
  { name: 'My Events', href: '/organizer/events', icon: Calendar },
  { name: 'Create Event', href: '/organizer/events/create', icon: Plus },
  { name: 'Attendees', href: '/organizer/attendees', icon: Users },
  { name: 'Analytics', href: '/organizer/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/organizer/settings', icon: Settings },
];

// Attendee Navigation
export const attendeeNavigation = [
  { name: 'Dashboard', href: '/attendee', icon: LayoutDashboard },
  { name: 'My Events', href: '/attendee/events', icon: Calendar },
  { name: 'Browse Events', href: '/attendee/browse', icon: BookOpen },
  { name: 'Favorites', href: '/attendee/favorites', icon: Star, badge: '3' },
  { name: 'Certificates', href: '/attendee/certificates', icon: UserCheck },
  { name: 'Settings', href: '/attendee/settings', icon: Settings },
];

// Admin Navigation (for future use)
export const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'All Events', href: '/admin/events', icon: Calendar },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
  { name: 'Database', href: '/admin/database', icon: Database },
];