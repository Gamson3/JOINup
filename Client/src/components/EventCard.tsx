"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin, Share2, ExternalLink } from "lucide-react";
import Link from "next/link";

// TypeScript interfaces
interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location: {
      city: string;
      country: string;
      venue?: string;
    };
    categories: EventCategory[];
    organizer: {
      name: string;
      logo?: string;
    };
    images: {
      banner?: string;
      thumbnail?: string;
    };
    slug: string;
    isFeatured?: boolean;
    isActive?: boolean;
    attendeeCount?: number;
    isEducational?: boolean;
  };
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onShare?: (event: any) => void;
  onEdit?: (event: any) => void;
  onDelete?: (event: any) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  showActions = true,
  onShare,
  onEdit,
  onDelete,
  className = ""
}) => {
  
  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    return `${start.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' })} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Handle share functionality
  const handleShare = async () => {
    if (onShare) {
      onShare(event);
    } else {
      // Default share logic
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
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`);
      }
    }
  };

  // Different variants
  const getImageHeight = () => {
    switch (variant) {
      case 'compact': return 'h-20';
      case 'detailed': return 'h-40';
      default: return 'h-32';
    }
  };

  const baseClasses = `bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group ${className}`;

  return (
    <div className={baseClasses}>
      
      {/* Event Image */}
      <div className={`relative ${getImageHeight()} bg-gradient-to-r from-gray-100 to-gray-200`}>
        {event.images.thumbnail ? (
          <Image
            src={event.images.thumbnail}
            alt={event.title}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to gradient background if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
            <span className="text-primary font-semibold text-lg">
              {event.title.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Event Logo */}
        <div className="absolute top-2 right-2 w-10 h-10 bg-white rounded shadow-sm flex items-center justify-center">
          {event.organizer.logo ? (
            <Image
              src={event.organizer.logo}
              alt={`${event.organizer.name} Logo`}
              width={24}
              height={24}
              className="rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-6 h-6 bg-primary rounded text-white text-xs flex items-center justify-center font-semibold">
              {event.organizer.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-2 left-2 flex gap-1">
            {/* Share Button */}
            <button 
              onClick={handleShare}
              className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              title="Share Event"
            >
              <Share2 className="h-3 w-3 text-text/60" />
            </button>
            
            {/* Edit Button (for organizer dashboard) */}
            {onEdit && (
              <button 
                onClick={() => onEdit(event)}
                className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                title="Edit Event"
              >
                <svg className="h-3 w-3 text-text/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {/* Delete Button (for organizer dashboard) */}
            {onDelete && (
              <button 
                onClick={() => onDelete(event)}
                className="w-7 h-7 bg-red-100/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                title="Delete Event"
              >
                <svg className="h-3 w-3 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Status Badges (for different contexts) */}
        {variant === 'detailed' && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {event.isFeatured && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
            {!event.isActive && (
              <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Draft
              </span>
            )}
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-3">
        {/* Date */}
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDateRange(event.startDate, event.endDate)}
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-text/90 mb-3 line-clamp-2 hover:underline transition-colors ${
          variant === 'compact' ? 'text-sm' : 'text-base'
        }`}>
          <Link href={`/events/${event.slug}`}>
            {event.title}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center text-sm text-text/60 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {event.location.city}, {event.location.country}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-3">
          {event.categories.slice(0, variant === 'compact' ? 1 : 2).map((category) => (
            <span
              key={category.id}
              className="px-2 py-1 bg-gray-100 text-text/60 text-xs rounded-xs hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              {category.name}
            </span>
          ))}
          {event.categories.length > (variant === 'compact' ? 1 : 2) && (
            <span className="px-2 py-1 bg-gray-100 text-text/60 text-xs rounded-xs">
              +{event.categories.length - (variant === 'compact' ? 1 : 2)}
            </span>
          )}
        </div>

        {/* Description (only for detailed variant) */}
        {variant === 'detailed' && event.description && (
          <p className="text-sm text-text/60 mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Attendee Count (only for detailed variant) */}
        {variant === 'detailed' && event.attendeeCount && (
          <div className="text-xs text-text/50 mb-3">
            {event.attendeeCount.toLocaleString()} registered
          </div>
        )}

        {/* View Event Link */}
        <div className="pt-3 border-t border-gray-100">
          <a
            href={`/events/${event.slug}`}
            className="inline-flex items-center text-sm text-accent hover:text-primary transition-colors font-medium"
          >
            View Details <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventCard;