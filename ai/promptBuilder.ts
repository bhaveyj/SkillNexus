interface UserContext {
  name: string
  interests: string[]
  skills: string[]
}

interface CompletedSession {
  senderSkill: string
  receiverSkill: string
  partnerName: string
}

interface AvailableExchange {
  id: string
  userName: string
  matchedSkill: string
  matchedSkillCategory: string
  theyWantFromMe: string
  theyWantCategory: string
}

interface AvailableMasterclass {
  id: string
  title: string
  instructorName: string
  category: string
  level: string
  date: string
  time: string
  duration: string
}

export interface PromptData {
  user: UserContext
  completedSessions: CompletedSession[]
  availableExchanges: AvailableExchange[]
  availableMasterclasses: AvailableMasterclass[]
}

export function buildRecommendationPrompt(data: PromptData): string {
  const { user, completedSessions, availableExchanges, availableMasterclasses } = data

  const interestsStr = user.interests.length > 0
    ? user.interests.join(", ")
    : "Not specified"

  const skillsStr = user.skills.length > 0
    ? user.skills.join(", ")
    : "None listed"

  const sessionsStr = completedSessions.length > 0
    ? completedSessions
        .map((s) => `- Exchanged "${s.senderSkill}" for "${s.receiverSkill}" with ${s.partnerName}`)
        .join("\n")
    : "No completed sessions yet."

  const exchangesStr = availableExchanges.length > 0
    ? availableExchanges
        .map(
          (e) =>
            `- Exchange ID: ${e.id} | Partner: ${e.userName} | I learn: ${e.matchedSkill} (${e.matchedSkillCategory}) | I teach: ${e.theyWantFromMe} (${e.theyWantCategory})`
        )
        .join("\n")
    : "No exchanges available."

  const masterclassesStr = availableMasterclasses.length > 0
    ? availableMasterclasses
        .map(
          (m) =>
            `- Masterclass ID: ${m.id} | "${m.title}" by ${m.instructorName} | Category: ${m.category} | Level: ${m.level} | Date: ${m.date} at ${m.time} (${m.duration})`
        )
        .join("\n")
    : "No masterclasses available."

  return `You are a learning advisor for SkillNexus, a peer-to-peer skill exchange platform.

Your job is to recommend the best next learning steps for a user based on their interests, current skills, past sessions, and what is currently available on the platform.

IMPORTANT RULES:
- You must ONLY recommend from the provided exchanges and masterclasses below.
- Do NOT invent or fabricate any recommendations.
- Masterclasses may include past sessions — still recommend them if they are the best match, the user can watch recordings or reach out to the instructor.
- For exchanges marked as "interest-based" (id starts with "interest_"), note that they are potential partners aligned by skill area — the exact swap terms would be negotiated.
- If nothing aligns well, recommend the closest options and explain why.
- Return at most 3 recommended exchanges and 3 recommended masterclasses.

---

USER PROFILE:
Name: ${user.name}
Interests (career direction): ${interestsStr}
Current Skills: ${skillsStr}

COMPLETED SESSIONS:
${sessionsStr}

AVAILABLE EXCHANGES:
${exchangesStr}

AVAILABLE MASTERCLASSES:
${masterclassesStr}

---

Based on the above, select the best exchanges and masterclasses for this user to pursue next. Prioritize options that:
1. Align with their stated interests
2. Build on or complement their existing skills
3. Fill gaps based on their career direction
4. Avoid redundancy with completed sessions

Respond with valid JSON only, no markdown formatting, in this exact structure:
{
  "recommendedExchanges": [{"id": "...", "reason": "..."}],
  "recommendedMasterclasses": [{"id": "...", "reason": "..."}],
  "reasoning": "A brief overall explanation of why these were chosen."
}`
}
