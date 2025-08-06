import { API_CONFIG, simulateApiDelay, apiClient } from './api';
import { mockFeaturedEventsResponse } from '../mock/events/featured-events';
import { mockOrganizerEvents } from '../mock/organizer/organizer-events';
import type { FeaturedEvent, FeaturedEventsResponse } from '@/types/event';

export const eventService = {
  // Get featured events
  getFeaturedEvents: async (page: number = 1, limit: number = 18): Promise<FeaturedEventsResponse> => {
    if (API_CONFIG.USE_MOCK) {
      // Mock implementation
      await simulateApiDelay();
      return {
        ...mockFeaturedEventsResponse,
        currentPage: page,
        totalPages: Math.ceil(mockFeaturedEventsResponse.totalCount / limit)
      };
    }
    
    // Real API implementation
    return apiClient.get<FeaturedEventsResponse>(`/events/featured?page=${page}&limit=${limit}`);
  },

  // Get organizer events
  getOrganizerEvents: async (organizerId: string, filters?: any): Promise<FeaturedEvent[]> => {
    if (API_CONFIG.USE_MOCK) {
      // Mock implementation
      await simulateApiDelay(800);
      return mockOrganizerEvents;
    }
    
    // Real API implementation
    const query = new URLSearchParams({
      organizerId,
      ...filters
    }).toString();
    return apiClient.get<FeaturedEvent[]>(`/organizer/events?${query}`);
  },

  // Create event
  createEvent: async (eventData: Partial<FeaturedEvent>): Promise<FeaturedEvent> => {
    if (API_CONFIG.USE_MOCK) {
      // Mock implementation
      await simulateApiDelay(1000);
      const newEvent: FeaturedEvent = {
        id: `evt_${Date.now()}`,
        ...eventData,
        isFeatured: false,
        isActive: false, // Draft by default
        attendeeCount: 0,
        isEducational: true,
      } as FeaturedEvent;
      return newEvent;
    }
    
    // Real API implementation
    return apiClient.post<FeaturedEvent>('/organizer/events', eventData);
  },

  // Update event
  updateEvent: async (eventId: string, updates: Partial<FeaturedEvent>): Promise<FeaturedEvent> => {
    if (API_CONFIG.USE_MOCK) {
      // Mock implementation
      await simulateApiDelay(800);
      const event = mockOrganizerEvents.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      return { ...event, ...updates };
    }
    
    // Real API implementation
    return apiClient.put<FeaturedEvent>(`/organizer/events/${eventId}`, updates);
  },

  // Delete event
  deleteEvent: async (eventId: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      // Mock implementation
      await simulateApiDelay(500);
      return;
    }
    
    // Real API implementation
    return apiClient.delete<void>(`/organizer/events/${eventId}`);
  },

  // Get event by ID
  getEventById: async (eventId: string): Promise<FeaturedEvent> => {
    if (API_CONFIG.USE_MOCK) {
      // Mock implementation
      await simulateApiDelay();
      const event = mockOrganizerEvents.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      return event;
    }
    
    // Real API implementation
    return apiClient.get<FeaturedEvent>(`/events/${eventId}`);
  }
};