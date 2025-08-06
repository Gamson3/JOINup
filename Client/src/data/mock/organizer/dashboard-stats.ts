export const mockOrganizerDashboard = {
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
    }
    // ... more events
  ]
};