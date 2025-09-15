import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding…');

  // Users
  const [organizer, attendee] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'organizer@example.com' },
      update: {},
      create: {
        email: 'organizer@example.com',
        name: 'John Doe',
        password: await bcrypt.hash('password123', 10),
        roles: ['organizer'],
      },
    }),
    prisma.user.upsert({
      where: { email: 'attendee@example.com' },
      update: {},
      create: {
        email: 'attendee@example.com',
        name: 'Jane Smith',
        password: await bcrypt.hash('password123', 10),
        roles: ['attendee'],
      },
    }),
  ]);

  // Conference
  const conference = await prisma.conference.create({
    data: {
      name: 'JOINup Summit 2025',
      description: 'An academic conference focused on modern research workflows.',
      startDate: new Date('2025-11-10T09:00:00Z'),
      endDate: new Date('2025-11-12T17:00:00Z'),
      location: 'San Francisco, CA',
      status: 'published',
      topics: ['AI', 'HCI', 'Systems'],
      createdById: organizer.id,
    },
  });

  // Categories (conference-scoped, no slug)
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'IT & Technology', conferenceId: conference.id, order: 1 },
    }),
    prisma.category.create({
      data: { name: 'Education & Training', conferenceId: conference.id, order: 2 },
    }),
    prisma.category.create({
      data: { name: 'Marketing & Communications', conferenceId: conference.id, order: 3 },
    }),
    prisma.category.create({
      data: { name: 'Business Services', conferenceId: conference.id, order: 4 },
    }),
  ]);

  // Presentation types
  const [talkType, workshopType, keynoteType] = await Promise.all([
    prisma.presentationType.create({
      data: { name: 'Talk', description: 'Standard 20-min talk', defaultDuration: 20, conferenceId: conference.id, order: 1 },
    }),
    prisma.presentationType.create({
      data: { name: 'Workshop', description: 'Hands-on session', defaultDuration: 90, conferenceId: conference.id, order: 2 },
    }),
    prisma.presentationType.create({
      data: { name: 'Keynote', description: 'Keynote address', defaultDuration: 45, conferenceId: conference.id, order: 0 },
    }),
  ]);

  // Submission settings
  await prisma.submissionSettings.create({
    data: {
      conferenceId: conference.id,
      submissionDeadline: new Date('2025-09-30T23:59:59Z'),
      requireAbstract: true,
      requireFullPaper: false,
      allowedFileTypes: ['pdf', 'docx'],
      maxFileSize: 25, // MB
      maxCoAuthors: 8,
      minKeywords: 3,
      maxKeywords: 8,
      enableSubmissions: true,
      sendConfirmationEmail: true,
    },
  });

  // Days
  const [day1, day2] = await Promise.all([
    prisma.day.create({
      data: {
        conferenceId: conference.id,
        date: new Date('2025-11-10'),
        name: 'Day 1',
        order: 1,
      },
    }),
    prisma.day.create({
      data: {
        conferenceId: conference.id,
        date: new Date('2025-11-11'),
        name: 'Day 2',
        order: 2,
      },
    }),
  ]);

  // Sections
  const [openingKeynote, researchTrack] = await Promise.all([
    prisma.section.create({
      data: {
        name: 'Opening Keynote',
        type: 'keynote',
        startTime: new Date('2025-11-10T09:00:00Z'),
        endTime: new Date('2025-11-10T10:00:00Z'),
        conferenceId: conference.id,
        dayId: day1.id,
        room: 'Main Hall',
      },
    }),
    prisma.section.create({
      data: {
        name: 'Research Track A',
        type: 'presentation',
        startTime: new Date('2025-11-10T10:30:00Z'),
        endTime: new Date('2025-11-10T12:30:00Z'),
        conferenceId: conference.id,
        dayId: day1.id,
        room: 'Room A',
        categoryId: categories[0].id, // IT & Technology
      },
    }),
  ]);

  // Presentation
  const presentation = await prisma.presentation.create({
    data: {
      conferenceId: conference.id,
      title: 'Modern Web Tooling for Research Apps',
      abstract: 'Exploring practical stacks for academic conference management.',
      status: 'scheduled',
      sectionId: researchTrack.id,
      categoryId: categories[0].id,
      presentationTypeId: talkType.id,
      authors: {
        create: [
          {
            authorName: organizer.name,
            authorEmail: organizer.email,
            userId: organizer.id,
            isPresenter: true,
            isExternal: false,
          },
        ],
      },
    },
  });

  // Time slots (link one to the presentation)
  await Promise.all([
    prisma.timeSlot.create({
      data: {
        sectionId: openingKeynote.id,
        startTime: new Date('2025-11-10T09:00:00Z'),
        endTime: new Date('2025-11-10T09:45:00Z'),
        slotType: 'OPENING',
        title: 'Welcome & Opening Remarks',
        isOccupied: false,
      },
    }),
    prisma.timeSlot.create({
      data: {
        sectionId: researchTrack.id,
        startTime: new Date('2025-11-10T10:30:00Z'),
        endTime: new Date('2025-11-10T10:50:00Z'),
        slotType: 'PRESENTATION',
        presentationId: presentation.id,
        title: presentation.title,
        isOccupied: true,
      },
    }),
  ]);

  // Conference membership (attendee registers)
  await prisma.conferenceMember.upsert({
    where: { conferenceId_userId: { conferenceId: conference.id, userId: attendee.id } },
    update: {},
    create: {
      conferenceId: conference.id,
      userId: attendee.id,
      isAttendee: true,
      isSpeaker: false,
    },
  });

  console.log('✅ Seed complete.');
  console.log(`Organizer: ${organizer.email} / password123`);
  console.log(`Attendee:  ${attendee.email} / password123`);
  console.log(`Conference: ${conference.name} (#${conference.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });