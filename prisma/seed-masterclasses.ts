import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Generate Google Meet link
function generateMeetLink(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  
  const generateSegment = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const segment1 = generateSegment(3);
  const segment2 = generateSegment(4);
  const segment3 = generateSegment(3);

  return `https://meet.google.com/${segment1}-${segment2}-${segment3}`;
}

async function main() {
  console.log('Starting seed...');

  // Create instructor users
  const instructor1 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@example.com' },
    update: {},
    create: {
      email: 'sarah.johnson@example.com',
      name: 'Dr. Sarah Johnson',
      password: await bcrypt.hash('password123', 10),
      role: 'INSTRUCTOR',
      bio: 'PhD in Machine Learning with 10+ years of experience',
      skills: ['Machine Learning', 'Deep Learning', 'AI'],
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'james.wilson@example.com' },
    update: {},
    create: {
      email: 'james.wilson@example.com',
      name: 'Prof. James Wilson',
      password: await bcrypt.hash('password123', 10),
      role: 'INSTRUCTOR',
      bio: 'Professor of AI and expert in Generative AI',
      skills: ['Generative AI', 'NLP', 'Computer Vision'],
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    },
  });

  const instructor3 = await prisma.user.upsert({
    where: { email: 'elena.martinez@example.com' },
    update: {},
    create: {
      email: 'elena.martinez@example.com',
      name: 'Elena Martinez',
      password: await bcrypt.hash('password123', 10),
      role: 'INSTRUCTOR',
      bio: 'ML Engineer specializing in production systems',
      skills: ['MLOps', 'Production ML', 'Cloud Architecture'],
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    },
  });

  const instructor4 = await prisma.user.upsert({
    where: { email: 'dev.shah@example.com' },
    update: {},
    create: {
      email: 'dev.shah@example.com',
      name: 'Dev Shah',
      password: await bcrypt.hash('password123', 10),
      role: 'INSTRUCTOR',
      bio: 'Cloud Native Developer and Kubernetes expert',
      skills: ['Kubernetes', 'Docker', 'Cloud Native', 'DevOps'],
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
    },
  });

  const instructor5 = await prisma.user.upsert({
    where: { email: 'amara.okafor@example.com' },
    update: {},
    create: {
      email: 'amara.okafor@example.com',
      name: 'Dr. Amara Okafor',
      password: await bcrypt.hash('password123', 10),
      role: 'INSTRUCTOR',
      bio: 'AI Ethics researcher and advocate for responsible AI',
      skills: ['AI Ethics', 'Responsible AI', 'Data Privacy'],
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amara',
    },
  });

  console.log('Created instructors');

  // Create masterclasses with auto-generated Meet links
  await prisma.masterclass.upsert({
    where: { id: 'masterclass-1' },
    update: {},
    create: {
      id: 'masterclass-1',
      title: 'Advanced Machine Learning',
      description: 'Deep dive into advanced ML algorithms and techniques',
      instructorId: instructor1.id,
      instructorName: instructor1.name!,
      category: 'AI/ML',
      level: 'ADVANCED',
      date: new Date('2024-12-15T14:00:00'),
      time: '2:00 PM',
      duration: '2 hours',
      meetLink: generateMeetLink(), // Auto-generated
      maxStudents: 50,
      avatar: instructor1.image,
    },
  });

  await prisma.masterclass.upsert({
    where: { id: 'masterclass-2' },
    update: {},
    create: {
      id: 'masterclass-2',
      title: 'GenAI Fundamentals',
      description: 'Introduction to Generative AI and its applications',
      instructorId: instructor2.id,
      instructorName: instructor2.name!,
      category: 'AI/ML',
      level: 'INTERMEDIATE',
      date: new Date('2024-12-18T15:00:00'),
      time: '3:00 PM',
      duration: '1.5 hours',
      meetLink: generateMeetLink(), // Auto-generated
      maxStudents: 100,
      avatar: instructor2.image,
    },
  });

  await prisma.masterclass.upsert({
    where: { id: 'masterclass-3' },
    update: {},
    create: {
      id: 'masterclass-3',
      title: 'Production ML Systems',
      description: 'Build and deploy ML models in production environments',
      instructorId: instructor3.id,
      instructorName: instructor3.name!,
      category: 'AI/ML',
      level: 'ADVANCED',
      date: new Date('2024-12-20T16:00:00'),
      time: '4:00 PM',
      duration: '2 hours',
      meetLink: generateMeetLink(), // Auto-generated
      maxStudents: 40,
      avatar: instructor3.image,
    },
  });

  await prisma.masterclass.upsert({
    where: { id: 'masterclass-4' },
    update: {},
    create: {
      id: 'masterclass-4',
      title: 'Cloud Native Development',
      description: 'Master Kubernetes and cloud-native application development',
      instructorId: instructor4.id,
      instructorName: instructor4.name!,
      category: 'Cloud',
      level: 'INTERMEDIATE',
      date: new Date('2024-12-22T14:00:00'),
      time: '2:00 PM',
      duration: '2.5 hours',
      meetLink: generateMeetLink(), // Auto-generated
      maxStudents: 60,
      avatar: instructor4.image,
    },
  });

  await prisma.masterclass.upsert({
    where: { id: 'masterclass-5' },
    update: {},
    create: {
      id: 'masterclass-5',
      title: 'AI Ethics & Responsible AI',
      description: 'Understanding ethical implications and responsible AI practices',
      instructorId: instructor5.id,
      instructorName: instructor5.name!,
      category: 'AI/ML',
      level: 'BEGINNER',
      date: new Date('2024-12-25T13:00:00'),
      time: '1:00 PM',
      duration: '1 hour',
      meetLink: generateMeetLink(), // Auto-generated
      maxStudents: 200,
      avatar: instructor5.image,
    },
  });

  console.log('Created masterclasses');

  // Create a test user
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
