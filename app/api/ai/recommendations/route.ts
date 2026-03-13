import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateRecommendations } from "@/ai/recommendationAgent"
import { applyRateLimit, aiLimiter } from "@/middleware/rateLimiter"
import { getCache, setCache } from "@/lib/cache"

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, aiLimiter)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cacheKey = `recommendations:${session.user.id}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, data: cached })
    }

    const recommendations = await generateRecommendations(session.user.id)
    await setCache(cacheKey, recommendations, 300)

    return NextResponse.json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    console.error("Recommendation error:", error)
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    )
  }
}
