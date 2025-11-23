import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all registered masterclasses for this user
    const registrations = await prisma.masterclassRegistration.findMany({
      where: {
        userId: user.id,
      },
      include: {
        masterclass: true,
      },
      orderBy: {
        masterclass: {
          date: 'asc'
        }
      }
    })

    // Map to the format needed by the frontend
    const sessions = registrations.map((reg: any) => ({
      id: reg.masterclass.id,
      title: reg.masterclass.title,
      description: reg.masterclass.description,
      instructorName: reg.masterclass.instructorName,
      category: reg.masterclass.category,
      level: reg.masterclass.level,
      date: reg.masterclass.date,
      time: reg.masterclass.time,
      duration: reg.masterclass.duration,
      meetLink: reg.masterclass.meetLink,
      avatar: reg.masterclass.avatar,
      registeredAt: reg.registeredAt,
    }))

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching user sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
