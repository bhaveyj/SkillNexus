import OpenAI from "openai"

export interface MasterclassQuizQuestion {
  id: string
  question: string
  options: string[]
  correctOption: number
  rationale: string
}

export interface QuizAnswerInput {
  questionId: string
  selectedOption: number
}

export interface QuizEvaluationResult {
  summary: string
  feedback: Array<{ questionId: string; explanation: string }>
}

const DEFAULT_QUESTION_COUNT = 10

export async function generateMasterclassQuiz(input: {
  title: string
  description?: string | null
  category: string
  level: string
  questionCount?: number
}): Promise<MasterclassQuizQuestion[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const questionCount = input.questionCount ?? DEFAULT_QUESTION_COUNT
  const prompt = [
    `Create a ${questionCount}-question multiple-choice quiz for the masterclass below.`,
    "Each question must have exactly 4 options.",
    "Return JSON only with this shape:",
    "{\"questions\":[{\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOption\":0-3,\"rationale\":\"short explanation\"}]}",
    "No markdown or extra text.",
    "Masterclass:",
    `Title: ${input.title}`,
    `Category: ${input.category}`,
    `Level: ${input.level}`,
    input.description ? `Description: ${input.description}` : "",
  ].filter(Boolean).join("\n")

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You generate quizzes and must return valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 1200,
  })

  const responseText = completion.choices[0]?.message?.content?.trim()
  if (!responseText) {
    throw new Error("Empty response from AI")
  }

  let parsed: { questions?: Array<{ question: string; options: string[]; correctOption: number; rationale?: string }> }
  try {
    parsed = JSON.parse(responseText)
  } catch {
    throw new Error("Failed to parse quiz JSON")
  }

  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : []
  const cleaned = rawQuestions
    .map((q) => {
      if (!q || typeof q.question !== "string") return null
      const options = Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : []
      if (options.length !== 4) return null
      const correctOption = Number(q.correctOption)
      if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length) return null
      return {
        question: q.question.trim(),
        options: options.map((opt) => opt.trim()),
        correctOption,
        rationale: typeof q.rationale === "string" ? q.rationale.trim() : "",
      }
    })
    .filter((q): q is Omit<MasterclassQuizQuestion, "id"> => q !== null)

  if (cleaned.length < questionCount) {
    throw new Error("Quiz generation returned insufficient valid questions")
  }

  return cleaned.slice(0, questionCount).map((q, index) => ({
    id: `q_${index + 1}`,
    ...q,
  }))
}

export async function evaluateMasterclassQuiz(input: {
  title: string
  questions: MasterclassQuizQuestion[]
  answers: QuizAnswerInput[]
}): Promise<QuizEvaluationResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const answerMap = new Map(input.answers.map((a) => [a.questionId, a.selectedOption]))
  const evaluationPayload = input.questions.map((q) => ({
    questionId: q.id,
    question: q.question,
    options: q.options,
    correctOption: q.correctOption,
    selectedOption: answerMap.get(q.id),
  }))

  const prompt = [
    "Evaluate the quiz attempt and provide brief, helpful explanations.",
    "Return JSON only with this shape:",
    "{\"summary\":\"...\",\"feedback\":[{\"questionId\":\"q_1\",\"explanation\":\"...\"}]}",
    "The explanation should mention why the correct option is right and why the selected option is wrong if applicable.",
    "Quiz:",
    `Title: ${input.title}`,
    JSON.stringify(evaluationPayload),
  ].join("\n")

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You evaluate quizzes and must return valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1200,
  })

  const responseText = completion.choices[0]?.message?.content?.trim()
  if (!responseText) {
    return fallbackEvaluation(input.questions)
  }

  try {
    const parsed = JSON.parse(responseText) as QuizEvaluationResult
    if (!parsed.summary || !Array.isArray(parsed.feedback)) {
      return fallbackEvaluation(input.questions)
    }
    return parsed
  } catch {
    return fallbackEvaluation(input.questions)
  }
}

function fallbackEvaluation(questions: MasterclassQuizQuestion[]): QuizEvaluationResult {
  return {
    summary: "Review the explanations below to strengthen your understanding of this topic.",
    feedback: questions.map((q) => ({
      questionId: q.id,
      explanation: q.rationale || "Review the correct option and the concept behind this question.",
    })),
  }
}
