import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateRecommendations } from "@/ai/recommendationAgent"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recommendations = await generateRecommendations(session.user.id)

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
