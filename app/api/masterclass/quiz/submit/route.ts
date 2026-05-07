import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applyRateLimit, aiLimiter } from "@/middleware/rateLimiter"
import {
  evaluateMasterclassQuiz,
  type MasterclassQuizQuestion,
  type QuizAnswerInput,
} from "@/ai/quizAgent"
import { isMasterclassCompleted } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, aiLimiter)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { masterclassId, answers } = await req.json()
    if (!masterclassId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Masterclass ID and answers are required" }, { status: 400 })
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

    const quiz = await prisma.masterclassQuiz.findUnique({
      where: { masterclassId },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quizQuestions = quiz.questions as unknown as MasterclassQuizQuestion[]
    const answerMap = new Map<string, number>(
      (answers as QuizAnswerInput[]).map((a) => [a.questionId, a.selectedOption])
    )

    const missingAnswer = quizQuestions.some((q) => answerMap.get(q.id) == null)
    if (missingAnswer) {
      return NextResponse.json({ error: "Please answer all questions" }, { status: 400 })
    }

    const evaluation = await evaluateMasterclassQuiz({
      title: masterclass.title,
      questions: quizQuestions,
      answers,
    })

    const explanationMap = new Map(
      evaluation.feedback.map((item) => [item.questionId, item.explanation])
    )

    let score = 0
    const feedback = quizQuestions.map((q) => {
      const selectedOption = answerMap.get(q.id) ?? -1
      const isCorrect = selectedOption === q.correctOption
      if (isCorrect) score += 1
      return {
        questionId: q.id,
        selectedOption,
        correctOption: q.correctOption,
        isCorrect,
        explanation:
          explanationMap.get(q.id) ||
          q.rationale ||
          "Review the correct option and the concept behind this question.",
      }
    })

    const attempt = await prisma.masterclassQuizAttempt.create({
      data: {
        userId: user.id,
        masterclassId,
        quizId: quiz.id,
        answers,
        score,
        maxScore: quizQuestions.length,
        feedback: {
          summary: evaluation.summary,
          items: feedback,
        },
      },
    })

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score,
        maxScore: quizQuestions.length,
        summary: evaluation.summary,
        feedback,
        createdAt: attempt.createdAt,
      },
    })
  } catch (error) {
    console.error("Quiz submission error:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
