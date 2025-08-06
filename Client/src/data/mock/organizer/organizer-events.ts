import { FeaturedEvent } from '@/types/event';

export const mockOrganizerEvents: FeaturedEvent[] = [
  {
    id: "evt_org_001",
    title: "Modern Web Development Conference 2025",
    description: "Learn the latest in web development technologies and frameworks",
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
  },
  {
    id: "evt_org_003",
    title: "AI and Machine Learning Summit",
    description: "Educational summit on artificial intelligence and machine learning",
    startDate: "2025-04-20",
    endDate: "2025-04-22",
    location: {
      city: "Seattle",
      country: "USA",
      venue: "Seattle Convention Center"
    },
    categories: [
      { id: "cat_001", name: "IT & Technology", slug: "it-technology" },
      { id: "cat_002", name: "Education & Training", slug: "education-training" }
    ],
    organizer: {
      name: "AI Education Alliance",
      logo: ""
    },
    images: {
      banner: "",
      thumbnail: ""
    },
    slug: "ai-machine-learning-summit-2025",
    isFeatured: true,
    isActive: true,
    attendeeCount: 892,
    isEducational: true
  }
];