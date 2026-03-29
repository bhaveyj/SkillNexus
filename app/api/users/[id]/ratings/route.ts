import { NextRequest } from "next/server";
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter";
import { getUserRatingsController } from "@/lib/controllers/ratingController";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  return getUserRatingsController(req, ctx);
}
