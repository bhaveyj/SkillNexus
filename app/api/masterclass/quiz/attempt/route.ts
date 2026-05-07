import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter"
import type { MasterclassQuizQuestion } from "@/ai/quizAgent"

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const masterclassId = searchParams.get("masterclassId")

    if (!masterclassId) {
      return NextResponse.json({ error: "Masterclass ID is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const attempt = await prisma.masterclassQuizAttempt.findFirst({
      where: { userId: user.id, masterclassId },
      orderBy: { createdAt: "desc" },
      include: {
        quiz: true,
        masterclass: { select: { title: true } },
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: "No quiz attempt found" }, { status: 404 })
    }

    const quizQuestions = attempt.quiz.questions as unknown as MasterclassQuizQuestion[]
    const feedbackPayload = attempt.feedback as unknown as {
      summary?: string
      items?: Array<{
        questionId: string
        selectedOption: number
        correctOption: number
        isCorrect: boolean
        explanation: string
      }>
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        summary: feedbackPayload?.summary ?? "",
        feedback: feedbackPayload?.items ?? [],
        createdAt: attempt.createdAt,
      },
      quiz: {
        id: attempt.quiz.id,
        title: attempt.masterclass.title,
        questions: quizQuestions,
      },
    })
  } catch (error) {
    console.error("Quiz attempt fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch quiz attempt" }, { status: 500 })
  }
}
