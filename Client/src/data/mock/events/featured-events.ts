import { FeaturedEvent } from '@/types/event';

export const mockFeaturedEvents: FeaturedEvent[] = [
  {
    id: "evt_001",
    title: "China International Screen Printing and Digital Intelligent Printing Expo",
    description: "Educational workshop on modern printing technologies and sustainable practices",
    startDate: "2025-08-07",
    endDate: "2025-08-09",
    location: {
      city: "Shanghai",
      country: "China",
      venue: "Shanghai New International Expo Centre"
    },
    categories: [
      { id: "cat_001", name: "Packing & Packaging", slug: "packing-packaging" },
      { id: "cat_002", name: "Education & Training", slug: "education-training" }
    ],
    organizer: {
      name: "DSPE China Educational Foundation",
      logo: "/event-logos/dspe.jpg"
    },
    images: {
      banner: "/event-images/printing-expo-banner.jpg",
      thumbnail: "/event-images/printing-expo-thumb.jpg"
    },
    slug: "china-international-screen-printing-expo-2025",
    isFeatured: true,
    isActive: true,
    attendeeCount: 2500,
    isEducational: true
  },
  {
    id: "evt_002",
    title: "International Famous Furniture Fair",
    description: "Educational conference on sustainable furniture design and manufacturing",
    startDate: "2025-08-18",
    endDate: "2025-08-21",
    location: {
      city: "Dongguan",
      country: "China",
      venue: "Dongguan Modern International Exhibition Centre"
    },
    categories: [
      { id: "cat_003", name: "Home & Office", slug: "home-office" },
      { id: "cat_004", name: "Design & Architecture", slug: "design-architecture" }
    ],
    organizer: {
      name: "Furniture Education Institute",
      logo: "/event-logos/furniture-fair.jpg"
    },
    images: {
      banner: "/event-images/furniture-fair-banner.jpg",
      thumbnail: "/event-images/furniture-fair-thumb.jpg"
    },
    slug: "international-famous-furniture-fair-2025",
    isFeatured: true,
    isActive: true,
    attendeeCount: 3200,
    isEducational: true
  },
  // ... more events
];

export const mockFeaturedEventsResponse = {
  events: mockFeaturedEvents,
  totalCount: mockFeaturedEvents.length,
  currentPage: 1,
  totalPages: Math.ceil(mockFeaturedEvents.length / 18)
};