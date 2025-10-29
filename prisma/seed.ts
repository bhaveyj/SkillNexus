import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  console.log({ admin, instructor, user })
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