import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'IT & Technology',
        slug: 'it-technology',
        description: 'Technology and software development events',
        color: '#3B82F6'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Education & Training',
        slug: 'education-training',
        description: 'Educational workshops and training programs',
        color: '#10B981'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Marketing & Communications',
        slug: 'marketing-communications',
        description: 'Marketing and communication conferences',
        color: '#F59E0B'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Business Services',
        slug: 'business-services',
        description: 'Business and professional services',
        color: '#EF4444'
      }
    })
  ]);

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'ORGANIZER'
    }
  });

  const attendee = await prisma.user.create({
    data: {
      email: 'attendee@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'ATTENDEE'
    }
  });

  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Modern Web Development Conference 2025',
        description: 'Learn the latest in web development technologies and frameworks. This comprehensive conference covers React, Next.js, TypeScript, and modern deployment strategies.',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-17'),
        city: 'San Francisco',
        country: 'USA',
        venue: 'Tech Convention Center',
        slug: 'modern-web-development-conference-2025',
        status: 'PUBLISHED',
        isFeatured: true,
        maxCapacity: 500,
        organizerId: organizer.id,
        categoryId: categories[0].id // IT & Technology
      }
    }),
    prisma.event.create({
      data: {
        title: 'Digital Marketing Strategies Workshop',
        description: 'Hands-on workshop for digital marketing professionals covering SEO, social media marketing, and analytics.',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-12'),
        city: 'New York',
        country: 'USA',
        venue: 'Marketing Innovation Center',
        slug: 'digital-marketing-strategies-workshop-2025',
        status: 'PUBLISHED',
        isFeatured: false,
        maxCapacity: 200,
        organizerId: organizer.id,
        categoryId: categories[2].id // Marketing & Communications
      }
    }),
    prisma.event.create({
      data: {
        title: 'AI and Machine Learning Summit',
        description: 'Educational summit on artificial intelligence and machine learning applications in business.',
        startDate: new Date('2025-04-20'),
        endDate: new Date('2025-04-22'),
        city: 'Seattle',
        country: 'USA',
        venue: 'Seattle Convention Center',
        slug: 'ai-machine-learning-summit-2025',
        status: 'DRAFT',
        isFeatured: true,
        maxCapacity: 800,
        organizerId: organizer.id,
        categoryId: categories[0].id // IT & Technology
      }
    })
  ]);

  // Register attendee for first event
  await prisma.eventAttendee.create({
    data: {
      userId: attendee.id,
      eventId: events[0].id,
      status: 'REGISTERED'
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log(`📧 Organizer: ${organizer.email} / password123`);
  console.log(`📧 Attendee: ${attendee.email} / password123`);
  console.log(`📁 Created ${categories.length} categories`);
  console.log(`🎯 Created ${events.length} events`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });