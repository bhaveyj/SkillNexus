import { prisma } from "@/lib/prisma";
import { settleExchange } from "@/lib/services/creditService";

export type SessionParticipantRole = "teacher" | "learner";

export interface SessionCompletionSnapshot {
  id: string;
  status: "pending" | "accepted" | "completed";
  sessionType: "exchange" | "paid";
  teacherCompleted: boolean;
  learnerCompleted: boolean;
}

export interface MarkSessionCompleteResult {
  session: SessionCompletionSnapshot;
  userRole: SessionParticipantRole;
  waitingForOtherUser: boolean;
}

const sessionSelect = {
  id: true,
  exchangeRequestId: true,
  participant1Id: true,
  participant2Id: true,
  status: true,
  sessionType: true,
  teacherCompleted: true,
  learnerCompleted: true,
} as const;

function toSnapshot(session: {
  id: string;
  status: "pending" | "accepted" | "completed";
  sessionType: "exchange" | "paid";
  teacherCompleted: boolean;
  learnerCompleted: boolean;
}): SessionCompletionSnapshot {
  return {
    id: session.id,
    status: session.status,
    sessionType: session.sessionType,
    teacherCompleted: session.teacherCompleted,
    learnerCompleted: session.learnerCompleted,
  };
}

export async function markSessionComplete(
  sessionId: string,
  userId: string
): Promise<MarkSessionCompleteResult> {
  const result = await prisma.$transaction(async (tx) => {
    const existingSession = await tx.chatSession.findUnique({
      where: { id: sessionId },
      select: sessionSelect,
    });

    if (!existingSession) {
      throw new Error("SESSION_NOT_FOUND");
    }

    const userRole: SessionParticipantRole | null =
      existingSession.participant1Id === userId
        ? "teacher"
        : existingSession.participant2Id === userId
          ? "learner"
          : null;

    if (!userRole) {
      throw new Error("UNAUTHORIZED_SESSION_USER");
    }

    if (existingSession.status === "completed") {
      throw new Error("SESSION_ALREADY_COMPLETED");
    }

    if (
      (userRole === "teacher" && existingSession.teacherCompleted) ||
      (userRole === "learner" && existingSession.learnerCompleted)
    ) {
      throw new Error("USER_ALREADY_MARKED_COMPLETED");
    }

    let updatedSession = await tx.chatSession.update({
      where: { id: sessionId },
      data:
        userRole === "teacher"
          ? { teacherCompleted: true }
          : { learnerCompleted: true },
      select: sessionSelect,
    });

    if (
      updatedSession.teacherCompleted &&
      updatedSession.learnerCompleted &&
      updatedSession.status !== "completed"
    ) {
      updatedSession = await tx.chatSession.update({
        where: { id: sessionId },
        data: { status: "completed" },
        select: sessionSelect,
      });

      if (
        updatedSession.sessionType === "exchange" ||
        updatedSession.sessionType === "paid"
      ) {
        const exchangeRequest = await tx.exchangeRequest.findUnique({
          where: { id: updatedSession.exchangeRequestId },
          select: { creditAmount: true },
        });
        const teacherId = updatedSession.participant1Id;
        const learnerId = updatedSession.participant2Id;
        await settleExchange(
          tx,
          teacherId,
          learnerId,
          updatedSession.id,
          exchangeRequest?.creditAmount ?? null
        );
      }
    }

    return { updatedSession, userRole };
  });

  return {
    session: toSnapshot(result.updatedSession),
    userRole: result.userRole,
    waitingForOtherUser:
      !(result.updatedSession.teacherCompleted &&
        result.updatedSession.learnerCompleted),
  };
}
