"use client";

import React, { useState, useEffect } from "react";
import EventCard from "./EventCard";
import { eventService } from "@/data/services/eventService";
import type { FeaturedEvent, FeaturedEventsResponse } from "@/types/event";

const FeaturedEvents = () => {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventService.getFeaturedEvents(currentPage);
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentPage]);

  // Handle share functionality
  const handleShare = async (event: FeaturedEvent) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: `/events/${event.slug}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A011D] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#6A011D] text-white rounded-lg hover:bg-[#550117]"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Featured Educational Events</h2>
            <p className="text-sm text-gray-600 mt-1">Educational conferences and workshops</p>
          </div>
          
          {/* Pagination dots */}
          <div className="hidden md:flex space-x-2">
            <div className="w-2 h-2 bg-[#6A011D] rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              variant="default"
              onShare={handleShare}
            />
          ))}
        </div>

        {/* Add Event Button */}
        <div className="text-center">
          <a
            href="/organizer/auth"
            className="inline-flex items-center px-8 py-3 bg-[#6A011D] text-white rounded-lg hover:bg-[#550117] transition-colors font-medium"
          >
            Host Your Educational Event
          </a>
        </div>

      </div>
    </section>
  );
};

export default FeaturedEvents;