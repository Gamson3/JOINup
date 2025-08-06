"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Eye, Plus, ArrowRight } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual API calls later
const mockDashboardData = {
  stats: {
    totalEvents: 12,
    totalAttendees: 1547,
    upcomingEvents: 5,
    totalViews: 8432
  },
  recentEvents: [
    {
      id: "evt_org_001",
      title: "Modern Web Development Conference 2025",
      description: "Learn the latest in web development technologies",
      startDate: "2025-02-15",
      endDate: "2025-02-17",
      location: {
        city: "San Francisco",
        country: "USA",
        venue: "Tech Convention Center"
      },
      categories: [
        { id: "cat_001", name: "IT & Technology", slug: "it-technology" },
        { id: "cat_002", name: "Education & Training", slug: "education-training" }
      ],
      organizer: {
        name: "Tech Education Hub",
        logo: ""
      },
      images: {
        banner: "",
        thumbnail: ""
      },
      slug: "modern-web-development-conference-2025",
      isFeatured: true,
      isActive: true,
      attendeeCount: 324,
      isEducational: true
    },
    {
      id: "evt_org_002", 
      title: "Digital Marketing Strategies Workshop",
      description: "Hands-on workshop for digital marketing professionals",
      startDate: "2025-03-10",
      endDate: "2025-03-12",
      location: {
        city: "New York",
        country: "USA",
        venue: "Marketing Innovation Center"
      },
      categories: [
        { id: "cat_003", name: "Marketing & Communications", slug: "marketing-communications" },
        { id: "cat_004", name: "Business Services", slug: "business-services" }
      ],
      organizer: {
        name: "Marketing Pros Institute",
        logo: ""
      },
      images: {
        banner: "",
        thumbnail: ""
      },
      slug: "digital-marketing-strategies-workshop-2025",
      isFeatured: false,
      isActive: true,
      attendeeCount: 186,
      isEducational: true
    }
  ]
};

const OrganizerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/organizer/dashboard');
        // const data = await response.json();
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDashboardData(mockDashboardData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A011D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your events today.</p>
          </div>
          <Button className="bg-[#6A011D] hover:bg-[#550117]">
            <Plus className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalAttendees.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.upcomingEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
            <Button variant="outline" size="sm">
              View All Events
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {dashboardData.recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardData.recentEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="detailed"
                  onEdit={(event) => {
                    console.log('Edit event:', event);
                    // TODO: Navigate to edit page
                  }}
                  onDelete={(event) => {
                    console.log('Delete event:', event);
                    // TODO: Show delete confirmation
                  }}
                  onShare={(event) => {
                    console.log('Share event:', event);
                    // TODO: Implement share functionality
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first event.</p>
              <Button className="bg-[#6A011D] hover:bg-[#550117]">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start h-auto p-4">
            <Plus className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Create Event</div>
              <div className="text-sm text-gray-600">Start organizing a new event</div>
            </div>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-4">
            <Users className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">View Attendees</div>
              <div className="text-sm text-gray-600">Manage event participants</div>
            </div>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-4">
            <TrendingUp className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Analytics</div>
              <div className="text-sm text-gray-600">View performance metrics</div>
            </div>
          </Button>
        </div>
      </div>

    </div>
  );
};

export default OrganizerDashboard;