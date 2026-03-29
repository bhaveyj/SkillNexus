import { prisma } from "@/lib/prisma";

export interface CreateRatingInput {
  reviewerId: string;
  revieweeId: string;
  rating: number;
  review?: string;
  sessionId?: string | null;
}

export interface UserRatingSummary {
  averageRating: number;
  totalRatings: number;
}

export interface UserRatingItem {
  id: string;
  rating: number;
  review: string | null;
  sessionId: string | null;
  createdAt: Date;
  reviewer: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export async function createRating(input: CreateRatingInput) {
  const existing = await prisma.rating.findFirst({
    where: {
      reviewerId: input.reviewerId,
      revieweeId: input.revieweeId,
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("DUPLICATE_RATING");
  }

  try {
    return await prisma.rating.create({
      data: {
        reviewerId: input.reviewerId,
        revieweeId: input.revieweeId,
        rating: input.rating,
        review: input.review?.trim() || null,
        sessionId: input.sessionId ?? null,
      },
      select: {
        id: true,
        reviewerId: true,
        revieweeId: true,
        sessionId: true,
        rating: true,
        review: true,
        createdAt: true,
      },
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (code === "P2002") {
      throw new Error("DUPLICATE_RATING");
    }

    throw error;
  }
}

export async function getUserRatings(userId: string, limit = 20): Promise<{ summary: UserRatingSummary; ratings: UserRatingItem[] }> {
  const safeLimit = Math.max(1, Math.min(limit, 100));

  const [aggregate, ratings] = await Promise.all([
    prisma.rating.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.rating.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
    }),
  ]);

  return {
    summary: {
      averageRating: aggregate._avg.rating ?? 0,
      totalRatings: aggregate._count.rating,
    },
    ratings,
  };
}

export async function getUsersRatingSummary(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueUserIds.length === 0) return {} as Record<string, UserRatingSummary>;

  const grouped = await prisma.rating.groupBy({
    by: ["revieweeId"],
    where: {
      revieweeId: { in: uniqueUserIds },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const summaryMap: Record<string, UserRatingSummary> = {};
  for (const id of uniqueUserIds) {
    summaryMap[id] = { averageRating: 0, totalRatings: 0 };
  }

  for (const row of grouped) {
    summaryMap[row.revieweeId] = {
      averageRating: row._avg.rating ?? 0,
      totalRatings: row._count.rating,
    };
  }

  return summaryMap;
}

export async function getUsersRatedByReviewer(reviewerId: string, userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!reviewerId || uniqueUserIds.length === 0) return {} as Record<string, boolean>;

  const ratings = await prisma.rating.findMany({
    where: {
      reviewerId,
      revieweeId: { in: uniqueUserIds },
    },
    select: {
      revieweeId: true,
    },
  });

  const ratedByMe: Record<string, boolean> = {};
  for (const id of uniqueUserIds) {
    ratedByMe[id] = false;
  }
  for (const row of ratings) {
    ratedByMe[row.revieweeId] = true;
  }

  return ratedByMe;
}
