import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsersRatedByReviewer, getUsersRatingSummary } from "@/lib/services/ratingService";
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter";
import { getCache, setCache } from "@/lib/cache";

const MAX_IDS = 200;

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "";

    const ids = Array.from(
      new Set(
        idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      )
    ).slice(0, MAX_IDS);

    if (ids.length === 0) {
      return NextResponse.json({ summaries: {}, ratedByMe: {} });
    }

    const cacheKey = `user-ratings:summary:${session.user.id}:${ids.slice().sort().join(",")}`;
    const cached = await getCache<{
      summaries: Record<string, { averageRating: number; totalRatings: number }>;
      ratedByMe: Record<string, boolean>;
    }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const [summaries, ratedByMe] = await Promise.all([
      getUsersRatingSummary(ids),
      getUsersRatedByReviewer(session.user.id, ids),
    ]);
    await setCache(cacheKey, { summaries, ratedByMe }, 120);

    return NextResponse.json({ summaries, ratedByMe });
  } catch (error) {
    console.error("Error fetching users ratings summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch users ratings summary" },
      { status: 500 }
    );
  }
}
