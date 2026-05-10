import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Masterclass, MasterclassRegistration } from "@prisma/client"
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter"
import { getMasterclassEndAt, isMasterclassCompleted } from "@/lib/utils"

type RegistrationWithMasterclass = MasterclassRegistration & {
  masterclass: Masterclass
}

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter)
  if (limited) return limited

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

    const masterclassIds = registrations.map((reg) => reg.masterclass.id)
    const latestAttempts = masterclassIds.length > 0
      ? await prisma.masterclassQuizAttempt.findMany({
          where: {
            userId: user.id,
            masterclassId: { in: masterclassIds },
          },
          orderBy: { createdAt: "desc" },
        })
      : []

    const latestAttemptByMasterclass = new Map()

for (const attempt of latestAttempts) {
  if (!latestAttemptByMasterclass.has(attempt.masterclassId)) {
    latestAttemptByMasterclass.set(attempt.masterclassId, attempt)
  }
}

    const now = new Date()

    // Map to the format needed by the frontend
    const sessions = registrations.map((reg: RegistrationWithMasterclass) => {
      const attempt = latestAttemptByMasterclass.get(reg.masterclass.id) ?? null
      return {
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
        endAt: getMasterclassEndAt(reg.masterclass.date, reg.masterclass.time, reg.masterclass.duration)?.toISOString() ?? null,
        isCompleted: isMasterclassCompleted(reg.masterclass.date, reg.masterclass.time, reg.masterclass.duration, now),
        latestQuizAttempt: attempt
          ? {
              id: attempt.id,
              score: attempt.score,
              maxScore: attempt.maxScore,
              createdAt: attempt.createdAt,
            }
          : null,
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching user sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
