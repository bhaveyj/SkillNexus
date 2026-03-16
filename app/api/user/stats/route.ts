import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter"

function parseDurationToHours(duration: string): number {
  const match = duration.match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : 0
}

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const [skillsShared, activeExchanges, registrations] = await Promise.all([
      prisma.offer.count({ where: { userId } }),
      prisma.exchangeRequest.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: "ACCEPTED",
        },
      }),
      prisma.masterclassRegistration.findMany({
        where: { userId },
        include: { masterclass: { select: { duration: true } } },
      }),
    ])

    const masterclasses = registrations.length
    const learningHours = registrations.reduce(
      (sum, reg) => sum + parseDurationToHours(reg.masterclass.duration),
      0
    )

    return NextResponse.json({
      skillsShared,
      activeExchanges,
      masterclasses,
      learningHours,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
