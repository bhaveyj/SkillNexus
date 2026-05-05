import type { Prisma, PrismaClient, CreditTransactionType } from "@prisma/client";
import { EXCHANGE_CREDIT, MASTERCLASS_COST, ONBOARDING_BONUS } from "@/lib/credits";

export type CreditTxClient = PrismaClient | Prisma.TransactionClient;

export async function createTransaction(
  tx: CreditTxClient,
  userId: string,
  amount: number,
  type: CreditTransactionType,
  source?: string | null
) {
  if (source) {
    const existing = await tx.creditTransaction.findFirst({
      where: { userId, source },
    });
    if (existing) {
      if (existing.amount !== amount || existing.type !== type) {
        throw new Error("CREDIT_IDEMPOTENCY_CONFLICT");
      }
      return { txRow: existing, newBalance: existing.balanceAfter };
    }
  }

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const newBalance = user.creditBalance + amount;

  await tx.user.update({
    where: { id: userId },
    data: { creditBalance: newBalance },
  });

  const txRow = await tx.creditTransaction.create({
    data: {
      userId,
      amount,
      type,
      source,
      balanceAfter: newBalance,
    },
  });

  return { txRow, newBalance };
}

export async function awardOnboarding(tx: CreditTxClient, userId: string) {
  if (ONBOARDING_BONUS <= 0) return null;
  return createTransaction(tx, userId, ONBOARDING_BONUS, "ONBOARDING", "onboarding");
}

export async function settleExchange(
  tx: CreditTxClient,
  teacherId: string,
  learnerId: string,
  sessionId: string,
  creditAmount?: number | null
) {
  const cost = creditAmount ?? EXCHANGE_CREDIT;

  if (!Number.isInteger(cost) || cost <= 0) {
    throw new Error("INVALID_EXCHANGE_CREDIT");
  }

  const learner = await tx.user.findUnique({
    where: { id: learnerId },
    select: { creditBalance: true },
  });

  if (!learner) throw new Error("LEARNER_NOT_FOUND");
  if (learner.creditBalance < cost) throw new Error("INSUFFICIENT_CREDITS");

  await createTransaction(tx, learnerId, -cost, "LEARN_SPEND", sessionId);
  await createTransaction(tx, teacherId, cost, "TEACH_REWARD", sessionId);
}

export async function chargeMasterclassRegistration(
  tx: CreditTxClient,
  learnerId: string,
  instructorId: string,
  masterclassId: string,
  creditCost?: number | null
) {
  const cost = creditCost ?? MASTERCLASS_COST;

  if (!Number.isInteger(cost) || cost <= 0) {
    return null;
  }

  const learner = await tx.user.findUnique({
    where: { id: learnerId },
    select: { creditBalance: true },
  });

  if (!learner) throw new Error("LEARNER_NOT_FOUND");
  if (learner.creditBalance < cost) throw new Error("INSUFFICIENT_CREDITS");

  await createTransaction(tx, learnerId, -cost, "LEARN_SPEND", masterclassId);
  await createTransaction(tx, instructorId, cost, "TEACH_REWARD", masterclassId);
}
