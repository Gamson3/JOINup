"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Calendar } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { eventService } from '@/data/services/eventService';
import type { FeaturedEvent } from '@/types/event';

const OrganizerEvents = () => {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, draft, past

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        // Pass organizer ID (would come from auth context in real app)
        const data = await eventService.getOrganizerEvents('org_123');
        setEvents(data);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleEditEvent = (event: FeaturedEvent) => {
    console.log('Edit event:', event);
    // TODO: Navigate to edit page
  };

  const handleDeleteEvent = async (event: FeaturedEvent) => {
    try {
      await eventService.deleteEvent(event.id);
      // Refresh events list
      setEvents(events.filter(e => e.id !== event.id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && event.isActive) ||
      (filterStatus === 'draft' && !event.isActive);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A011D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-1">Manage and organize your educational events</p>
        </div>
        <Button className="bg-[#6A011D] hover:bg-[#550117]">
          <Plus className="h-4 w-4 mr-2" />
          Create New Event
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A011D] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6A011D] focus:border-transparent outline-none"
            >
              <option value="all">All Events</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="past">Past Events</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              variant="detailed"
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onShare={handleShareEvent}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No events found' : 'No events yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first educational event'}
          </p>
          <Button className="bg-[#6A011D] hover:bg-[#550117]">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Event
          </Button>
        </div>
      )}

      {/* Pagination (if needed) */}
      {filteredEvents.length > 0 && (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm" className="bg-[#6A011D] hover:bg-[#550117]">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizerEvents;