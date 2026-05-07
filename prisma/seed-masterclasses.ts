import { MasterclassLevel, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

export async function seedMasterclasses(prisma: PrismaClient) {
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

  const pickCreditCost = () => Math.floor(Math.random() * 16);

  const masterclasses = [
    {
      id: 'masterclass-1',
      title: 'Cloud Native Development',
      description: 'Master Kubernetes and cloud-native application development',
      instructor: instructor4,
      category: 'Cloud',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-05-28T14:00:00',
      time: '2:00 PM',
      duration: '2.5 hours',
      maxStudents: 60,
    },
    {
      id: 'masterclass-2',
      title: 'AI Ethics & Responsible AI',
      description: 'Understanding ethical implications and responsible AI practices',
      instructor: instructor5,
      category: 'AI/ML',
      level: MasterclassLevel.BEGINNER,
      date: '2026-05-30T13:00:00',
      time: '1:00 PM',
      duration: '1 hour',
      maxStudents: 200,
    },
    {
      id: 'masterclass-3',
      title: 'Advanced Machine Learning',
      description: 'Deep dive into advanced ML algorithms and techniques',
      instructor: instructor1,
      category: 'AI/ML',
      level: MasterclassLevel.ADVANCED,
      date: '2026-06-02T14:00:00',
      time: '2:00 PM',
      duration: '2 hours',
      maxStudents: 50,
    },
    {
      id: 'masterclass-4',
      title: 'GenAI Fundamentals',
      description: 'Introduction to Generative AI and its applications',
      instructor: instructor2,
      category: 'AI/ML',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-06-05T15:00:00',
      time: '3:00 PM',
      duration: '1.5 hours',
      maxStudents: 120,
    },
    {
      id: 'masterclass-5',
      title: 'Production ML Systems',
      description: 'Build and deploy ML models in production environments',
      instructor: instructor3,
      category: 'AI/ML',
      level: MasterclassLevel.ADVANCED,
      date: '2026-06-07T16:00:00',
      time: '4:00 PM',
      duration: '2 hours',
      maxStudents: 40,
    },
    {
      id: 'masterclass-6',
      title: 'Kubernetes for Developers',
      description: 'Deploy, scale, and troubleshoot containerized apps',
      instructor: instructor4,
      category: 'Cloud',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-06-10T11:00:00',
      time: '11:00 AM',
      duration: '2 hours',
      maxStudents: 80,
    },
    {
      id: 'masterclass-7',
      title: 'MLOps Essentials',
      description: 'Monitoring, pipelines, and reliable ML delivery',
      instructor: instructor3,
      category: 'AI/ML',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-06-12T13:30:00',
      time: '1:30 PM',
      duration: '2 hours',
      maxStudents: 60,
    },
    {
      id: 'masterclass-8',
      title: 'Responsible Data Practices',
      description: 'Privacy, bias, and accountability in ML projects',
      instructor: instructor5,
      category: 'AI/ML',
      level: MasterclassLevel.BEGINNER,
      date: '2026-06-14T12:00:00',
      time: '12:00 PM',
      duration: '1.5 hours',
      maxStudents: 150,
    },
    {
      id: 'masterclass-9',
      title: 'Building Data Products',
      description: 'From datasets to shipped features with measurable impact',
      instructor: instructor1,
      category: 'Data Science',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-06-18T10:00:00',
      time: '10:00 AM',
      duration: '2 hours',
      maxStudents: 90,
    },
    {
      id: 'masterclass-10',
      title: 'Feature Engineering Playbook',
      description: 'Practical techniques to boost model performance',
      instructor: instructor1,
      category: 'Data Science',
      level: MasterclassLevel.ADVANCED,
      date: '2026-06-21T09:30:00',
      time: '9:30 AM',
      duration: '2 hours',
      maxStudents: 75,
    },
    {
      id: 'masterclass-11',
      title: 'Scalable APIs with Node.js',
      description: 'Design resilient services and optimize performance',
      instructor: instructor4,
      category: 'Web Development',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-06-24T15:00:00',
      time: '3:00 PM',
      duration: '2 hours',
      maxStudents: 120,
    },
    {
      id: 'masterclass-12',
      title: 'NLP in Production',
      description: 'Deploy language models with practical constraints',
      instructor: instructor2,
      category: 'AI/ML',
      level: MasterclassLevel.ADVANCED,
      date: '2026-06-28T17:00:00',
      time: '5:00 PM',
      duration: '1.5 hours',
      maxStudents: 70,
    },
    {
      id: 'masterclass-13',
      title: 'Intro to Data Storytelling',
      description: 'Turn analysis into compelling narratives with clear visuals',
      instructor: instructor1,
      category: 'Data Science',
      level: MasterclassLevel.BEGINNER,
      date: '2026-04-05T11:00:00',
      time: '11:00 AM',
      duration: '1.5 hours',
      maxStudents: 80,
    },
    {
      id: 'masterclass-14',
      title: 'Serverless on the Edge',
      description: 'Build fast, global APIs with edge runtimes',
      instructor: instructor4,
      category: 'Web Development',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-04-09T14:30:00',
      time: '2:30 PM',
      duration: '2 hours',
      maxStudents: 100,
    },
    {
      id: 'masterclass-15',
      title: 'Practical Prompt Engineering',
      description: 'Design prompts that steer reliable LLM outputs',
      instructor: instructor2,
      category: 'AI/ML',
      level: MasterclassLevel.INTERMEDIATE,
      date: '2026-04-16T16:00:00',
      time: '4:00 PM',
      duration: '1.5 hours',
      maxStudents: 120,
    },
    {
      id: 'masterclass-16',
      title: 'Cloud Cost Optimization',
      description: 'Reduce spend with rightsizing, budgeting, and alerts',
      instructor: instructor4,
      category: 'Cloud',
      level: MasterclassLevel.BEGINNER,
      date: '2026-04-23T13:00:00',
      time: '1:00 PM',
      duration: '1 hour',
      maxStudents: 90,
    },
  ];

  for (const mc of masterclasses) {
    const creditCost = pickCreditCost();
    const data = {
      title: mc.title,
      description: mc.description,
      instructorId: mc.instructor.id,
      instructorName: mc.instructor.name!,
      category: mc.category,
      level: mc.level,
      date: new Date(mc.date),
      time: mc.time,
      duration: mc.duration,
      meetLink: generateMeetLink(),
      maxStudents: mc.maxStudents,
      avatar: mc.instructor.image,
      creditCost,
    };

    await prisma.masterclass.upsert({
      where: { id: mc.id },
      update: data,
      create: {
        id: mc.id,
        ...data,
      },
    });
  }

  console.log('Created masterclasses');

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
    },
  });

  const completedMasterclassIds = [
    'masterclass-13',
    'masterclass-14',
    'masterclass-15',
    'masterclass-16',
  ];

  const allUsers = await prisma.user.findMany({
    select: { id: true },
  });

  await prisma.masterclassRegistration.createMany({
    data: allUsers.flatMap((user) =>
      completedMasterclassIds.map((masterclassId) => ({
        userId: user.id,
        masterclassId,
      }))
    ),
    skipDuplicates: true,
  });

  console.log('Seed completed successfully!');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedMasterclasses(prisma);
  } catch (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes('seed-masterclasses')) {
  void main();
}
