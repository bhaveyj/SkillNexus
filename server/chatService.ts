import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client for the WebSocket server process.
 * Mirrors the singleton pattern used in the Next.js app.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SavedMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

// ─── Session helpers ─────────────────────────────────────────────────────────

/**
 * Validate that a user is a participant in the given chat session.
 * Returns the session record if valid, null otherwise.
 */
export async function validateSessionParticipant(
  sessionId: string,
  userId: string
) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      participant1: {
        select: { id: true, name: true, email: true, image: true },
      },
      participant2: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  if (!session) return null;
  if (session.participant1Id !== userId && session.participant2Id !== userId) {
    return null;
  }

  return session;
}

/**
 * Get the other participant's ID for a chat session.
 */
export function getOtherParticipantId(
  session: { participant1Id: string; participant2Id: string },
  userId: string
): string {
  return session.participant1Id === userId
    ? session.participant2Id
    : session.participant1Id;
}

// ─── Message helpers ─────────────────────────────────────────────────────────

/**
 * Persist a chat message to the database and return it with sender info.
 */
export async function saveMessage(
  sessionId: string,
  senderId: string,
  content: string
): Promise<SavedMessage> {
  return prisma.chatMessage.create({
    data: {
      sessionId,
      senderId,
      content,
    },
    include: {
      sender: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });
}

/**
 * Fetch paginated messages for a session (newest last).
 */
export async function getMessages(
  sessionId: string,
  cursor?: string,
  limit = 50
): Promise<{ messages: SavedMessage[]; nextCursor: string | null }> {
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    include: {
      sender: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  let nextCursor: string | null = null;
  if (messages.length > limit) {
    const extra = messages.pop();
    nextCursor = extra!.id;
  }

  return { messages, nextCursor };
}

/**
 * Find or create a chat session for an accepted exchange request.
 */
export async function findOrCreateChatSession(
  exchangeRequestId: string,
  participant1Id: string,
  participant2Id: string
) {
  const existing = await prisma.chatSession.findUnique({
    where: { exchangeRequestId },
  });

  if (existing) return existing;

  return prisma.chatSession.create({
    data: {
      exchangeRequestId,
      participant1Id,
      participant2Id,
    },
  });
}
