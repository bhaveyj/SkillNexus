import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { applyRateLimit, aiLimiter } from "@/middleware/rateLimiter"
import { generateMasterclassQuiz, type MasterclassQuizQuestion } from "@/ai/quizAgent"
import { isMasterclassCompleted } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, aiLimiter)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { masterclassId } = await req.json()
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

    const masterclass = await prisma.masterclass.findUnique({
      where: { id: masterclassId },
    })

    if (!masterclass) {
      return NextResponse.json({ error: "Masterclass not found" }, { status: 404 })
    }

    const registration = await prisma.masterclassRegistration.findUnique({
      where: {
        userId_masterclassId: {
          userId: user.id,
          masterclassId,
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: "You are not registered for this masterclass" }, { status: 403 })
    }

    if (!isMasterclassCompleted(masterclass.date, masterclass.time, masterclass.duration)) {
      return NextResponse.json({ error: "Masterclass is not completed yet" }, { status: 400 })
    }

    let quiz = await prisma.masterclassQuiz.findUnique({
      where: { masterclassId },
    })

    if (!quiz) {
      const questions = await generateMasterclassQuiz({
        title: masterclass.title,
        description: masterclass.description,
        category: masterclass.category,
        level: masterclass.level,
      })

      const questionsJson = JSON.parse(JSON.stringify(questions)) as Prisma.InputJsonValue

      quiz = await prisma.masterclassQuiz.create({
        data: {
          masterclassId,
          questions: questionsJson,
        },
      })
    }

    const quizQuestions = quiz.questions as unknown as MasterclassQuizQuestion[]
    const safeQuestions = quizQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }))

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        masterclassId,
        title: masterclass.title,
        questions: safeQuestions,
      },
    })
  } catch (error) {
    console.error("Quiz generation error:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
