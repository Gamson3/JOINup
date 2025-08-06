import { API_CONFIG, simulateApiDelay, apiClient } from './api';
import { mockOrganizerDashboard } from '../mock/organizer/dashboard-stats';

export interface OrganizerDashboardData {
  stats: {
    totalEvents: number;
    totalAttendees: number;
    upcomingEvents: number;
    totalViews: number;
  };
  recentEvents: any[];
}

export const organizerService = {
  // Get dashboard data
  getDashboardData: async (organizerId: string): Promise<OrganizerDashboardData> => {
    if (API_CONFIG.USE_MOCK) {
      // Mock implementation
      await simulateApiDelay(1000);
      return mockOrganizerDashboard;
    }
    
    // Real API implementation
    return apiClient.get<OrganizerDashboardData>(`/organizer/${organizerId}/dashboard`);
  },

  // Get organizer profile
  getProfile: async (organizerId: string) => {
    if (API_CONFIG.USE_MOCK) {
      await simulateApiDelay();
      return {
        id: organizerId,
        name: "John Doe",
        email: "john@example.com",
        organization: "Tech Education Hub",
        phone: "+1-234-567-8900",
        website: "https://techeducationhub.com"
      };
    }
    
    return apiClient.get(`/organizer/${organizerId}/profile`);
  }
};