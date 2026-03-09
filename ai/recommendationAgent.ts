import { prisma } from "@/lib/prisma"
import { buildRecommendationPrompt, PromptData } from "./promptBuilder"
import OpenAI from "openai"
import { SkillCategory } from "@prisma/client"

export interface RecommendedExchange {
  id: string
  reason: string
  userName: string
  matchedSkill: string
  theyWantFromMe: string
}

export interface RecommendedMasterclass {
  id: string
  reason: string
  title: string
  instructorName: string
  category: string
  level: string
  date: string
}

export interface RecommendationResult {
  recommendedExchanges: RecommendedExchange[]
  recommendedMasterclasses: RecommendedMasterclass[]
  reasoning: string
}

export async function generateRecommendations(userId: string): Promise<RecommendationResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // 1. Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      interests: true,
      skills: true,
      offers: { include: { skill: true } },
      requests: { include: { skill: true } },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // 2. Fetch completed exchange sessions (ACCEPTED exchanges)
  const completedExchanges = await prisma.exchangeRequest.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: "ACCEPTED",
    },
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
      senderSkill: true,
      receiverSkill: true,
    },
  })

  const completedSessions = completedExchanges.map((ex) => {
    const isSender = ex.senderId === userId
    return {
      senderSkill: ex.senderSkill.name,
      receiverSkill: ex.receiverSkill.name,
      partnerName: isSender
        ? ex.receiver.name || "Unknown"
        : ex.sender.name || "Unknown",
    }
  })

  // 3. Fetch available matches (users who offer what I want and want what I offer)
  const myOffers = await prisma.offer.findMany({
    where: { userId },
    include: { skill: true },
  })

  const myRequests = await prisma.request.findMany({
    where: { userId },
    include: { skill: true },
  })

  const availableExchanges: PromptData["availableExchanges"] = []

  // Primary: perfect 2-way matches
  for (const myRequest of myRequests) {
    const potentialInstructors = await prisma.offer.findMany({
      where: {
        skillId: myRequest.skill.id,
        userId: { not: userId },
      },
      include: {
        user: { select: { id: true, name: true } },
        skill: true,
      },
    })

    for (const instructorOffer of potentialInstructors) {
      const instructorRequests = await prisma.request.findMany({
        where: { userId: instructorOffer.user.id },
        include: { skill: true },
      })

      for (const instructorRequest of instructorRequests) {
        const iOfferThis = myOffers.find((o) => o.skillId === instructorRequest.skillId)
        if (iOfferThis) {
          const alreadyAdded = availableExchanges.some(
            (e) =>
              e.userName === (instructorOffer.user.name || "Anonymous") &&
              e.matchedSkill === myRequest.skill.name &&
              e.theyWantFromMe === instructorRequest.skill.name
          )
          if (!alreadyAdded) {
            availableExchanges.push({
              id: `${instructorOffer.user.id}_${myRequest.skill.id}_${instructorRequest.skillId}`,
              userName: instructorOffer.user.name || "Anonymous",
              matchedSkill: myRequest.skill.name,
              matchedSkillCategory: myRequest.skill.category,
              theyWantFromMe: instructorRequest.skill.name,
              theyWantCategory: instructorRequest.skill.category,
            })
          }
        }
      }
    }
  }

  // Fallback: if no 2-way matches, surface users offering skills aligned to the user's interests
  if (availableExchanges.length === 0) {
    const interestCategories = user.interests.length > 0
      ? user.interests
      : user.offers.map((o) => o.skill.category)

    const validCategories = interestCategories.filter(
      (c): c is SkillCategory => Object.values(SkillCategory).includes(c as SkillCategory)
    )

    if (validCategories.length > 0) {
      const interestOffers = await prisma.offer.findMany({
        where: {
          userId: { not: userId },
          skill: { category: { in: validCategories } },
        },
        include: {
          user: { select: { id: true, name: true } },
          skill: true,
        },
        take: 10,
      })

      for (const offer of interestOffers) {
        // Find a skill the user can teach them in return (any of user's offers)
        const myOfferForThem = myOffers[0]
        const alreadyAdded = availableExchanges.some(
          (e) => e.id === `interest_${offer.user.id}_${offer.skillId}`
        )
        if (!alreadyAdded) {
          availableExchanges.push({
            id: `interest_${offer.user.id}_${offer.skillId}`,
            userName: offer.user.name || "Anonymous",
            matchedSkill: offer.skill.name,
            matchedSkillCategory: offer.skill.category,
            theyWantFromMe: myOfferForThem ? myOfferForThem.skill.name : "TBD",
            theyWantCategory: myOfferForThem ? myOfferForThem.skill.category : "OTHER",
          })
        }
      }
    }
  }

  // 4. Fetch masterclasses the user has not registered for
  // No date filter here — recommendations surface all relevant content,
  // not just upcoming ones (seed data may have past dates in dev/staging).
  const masterclasses = await prisma.masterclass.findMany({
    where: {
      registrations: {
        none: { userId },
      },
    },
    include: {
      instructor: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  })

  const availableMasterclasses: PromptData["availableMasterclasses"] = masterclasses.map((mc) => ({
    id: mc.id,
    title: mc.title,
    instructorName: mc.instructorName,
    category: mc.category,
    level: mc.level,
    date: mc.date.toISOString().split("T")[0],
    time: mc.time,
    duration: mc.duration,
  }))

  // 5. Build prompt
  const promptData: PromptData = {
    user: {
      name: user.name || "User",
      interests: user.interests,
      skills: user.offers.map((o) => o.skill.name),
    },
    completedSessions,
    availableExchanges,
    availableMasterclasses,
  }

  const prompt = buildRecommendationPrompt(promptData)

  // 6. Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a learning advisor AI. You must respond with valid JSON only, no markdown code fences.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  })

  const responseText = completion.choices[0]?.message?.content?.trim()
  if (!responseText) {
    throw new Error("Empty response from AI")
  }

  // 7. Parse AI response
  let parsed: {
    recommendedExchanges: { id: string; reason: string }[]
    recommendedMasterclasses: { id: string; reason: string }[]
    reasoning: string
  }

  try {
    parsed = JSON.parse(responseText)
  } catch {
    throw new Error("Failed to parse AI response as JSON")
  }

  // 8. Enrich exchange recommendations with display data
  const enrichedExchanges: RecommendedExchange[] = parsed.recommendedExchanges
    .map((rec) => {
      const exchange = availableExchanges.find((e) => e.id === rec.id)
      if (!exchange) return null
      return {
        id: rec.id,
        reason: rec.reason,
        userName: exchange.userName,
        matchedSkill: exchange.matchedSkill,
        theyWantFromMe: exchange.theyWantFromMe,
      }
    })
    .filter((e): e is RecommendedExchange => e !== null)

  // 9. Enrich masterclass recommendations with display data
  const enrichedMasterclasses: RecommendedMasterclass[] = parsed.recommendedMasterclasses
    .map((rec) => {
      const mc = availableMasterclasses.find((m) => m.id === rec.id)
      if (!mc) return null
      return {
        id: rec.id,
        reason: rec.reason,
        title: mc.title,
        instructorName: mc.instructorName,
        category: mc.category,
        level: mc.level,
        date: mc.date,
      }
    })
    .filter((m): m is RecommendedMasterclass => m !== null)

  return {
    recommendedExchanges: enrichedExchanges,
    recommendedMasterclasses: enrichedMasterclasses,
    reasoning: parsed.reasoning,
  }
}
