import { NextRequest } from "next/server";
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter";
import { createRatingController } from "@/lib/controllers/ratingController";

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  return createRatingController(req);
}
