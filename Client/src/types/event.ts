export interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FeaturedEvent {
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
  isFeatured: boolean;
  isActive: boolean;
  attendeeCount?: number;
  isEducational: boolean;
}

export interface FeaturedEventsResponse {
  events: FeaturedEvent[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}