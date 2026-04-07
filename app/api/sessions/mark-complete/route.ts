import { NextRequest } from "next/server";
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter";
import { markSessionCompleteController } from "@/lib/controllers/sessionController";

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  return markSessionCompleteController(req);
}
