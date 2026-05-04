import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const SEED_CREDITS = 50

const reviewSamples = [
  "Great session, explained concepts clearly.",
  "Very helpful and practical guidance.",
  "Loved the structured approach and examples.",
  "Super collaborative and easy to learn from.",
  "Good interaction, learned exactly what I needed.",
  "Patient and knowledgeable, highly recommend.",
  "Solid exchange and clear communication.",
  "Great mentor vibe and actionable feedback.",
]

function getBiasedRating() {
  const roll = Math.random()
  if (roll < 0.55) return 5
  if (roll < 0.9) return 4
  return 3
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillnexus.com' },
    update: {},
    create: {
      email: 'admin@skillnexus.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'System administrator',
      skills: ['Management', 'Technology'],
    },
  })

  // Create sample instructor
  const instructorPassword = await bcrypt.hash('instructor123', 12)
  
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@skillnexus.com' },
    update: {},
    create: {
      email: 'instructor@skillnexus.com',
      name: 'John Instructor',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      bio: 'Experienced software engineer and instructor',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      location: 'San Francisco, CA',
      website: 'https://johninstructor.com',
    },
  })

  // Create sample user
  const userPassword = await bcrypt.hash('user123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'user@skillnexus.com' },
    update: {},
    create: {
      email: 'user@skillnexus.com',
      name: 'Jane Student',
      password: userPassword,
      role: 'USER',
      bio: 'Eager to learn new skills',
      skills: ['HTML', 'CSS'],
      location: 'New York, NY',
    },
  })

  const allUsers = await prisma.user.findMany({
    select: { id: true },
  })

  const seedUsers = [admin, instructor, user]
  for (const u of seedUsers) {
    const existing = await prisma.creditTransaction.findFirst({
      where: { userId: u.id, source: "seed" },
    })

    if (!existing) {
      await prisma.$transaction(async (tx) => {
        const current = await tx.user.findUnique({
          where: { id: u.id },
          select: { creditBalance: true },
        })
        const newBalance = (current?.creditBalance ?? 0) + SEED_CREDITS
        await tx.user.update({
          where: { id: u.id },
          data: { creditBalance: newBalance },
        })
        await tx.creditTransaction.create({
          data: {
            userId: u.id,
            amount: SEED_CREDITS,
            type: "ONBOARDING",
            source: "seed",
            balanceAfter: newBalance,
          },
        })
      })
    }
  }

  // Refresh demo ratings each seed run so the demo stays realistic and non-duplicated.
  await prisma.rating.deleteMany({ where: { sessionId: null } })

  const ratingsToCreate: {
    reviewerId: string
    revieweeId: string
    sessionId: string | null
    rating: number
    review: string | null
  }[] = []

  for (const reviewee of allUsers) {
    const reviewers = allUsers.filter(u => u.id !== reviewee.id)
    const targetCount = Math.min(reviewers.length, 3 + Math.floor(Math.random() * 3))

    const shuffled = [...reviewers].sort(() => Math.random() - 0.5).slice(0, targetCount)

    for (const reviewer of shuffled) {
      ratingsToCreate.push({
        reviewerId: reviewer.id,
        revieweeId: reviewee.id,
        sessionId: null,
        rating: getBiasedRating(),
        review: Math.random() < 0.8 ? pickRandom(reviewSamples) : null,
      })
    }
  }

  if (ratingsToCreate.length > 0) {
    await prisma.rating.createMany({
      data: ratingsToCreate,
    })
  }

  const refreshedUsers = await prisma.user.findMany({
    where: { id: { in: seedUsers.map((u) => u.id) } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      creditBalance: true,
    },
  })

  const seededUsers = Object.fromEntries(
    refreshedUsers.map((u) => [u.email, u])
  )

  console.log({ seededUsers, ratingsSeeded: ratingsToCreate.length })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })