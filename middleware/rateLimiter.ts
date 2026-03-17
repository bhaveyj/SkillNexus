import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

// --- Rate limiter presets ---

function createLimiter(limit: number, prefix: string): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, "1 m"),
    prefix,
  })
}

/** General API: 100 requests per 1-minute sliding window */
export const generalLimiter = createLimiter(100, "ratelimit:general")

/** Auth routes: 10 requests per 1-minute sliding window */
export const authLimiter = createLimiter(10, "ratelimit:auth")

/** AI endpoints: 20 requests per 1-minute sliding window */
export const aiLimiter = createLimiter(20, "ratelimit:ai")

// --- Helper ---

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous"
}

export async function applyRateLimit(
  req: Request,
  limiter: Ratelimit | null = generalLimiter
): Promise<NextResponse | null> {
  if (!limiter) {
    return null
  }

  try {
    const ip = getClientIp(req)
    const { success, limit, remaining, reset } = await limiter.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      )
    }

    return null
  } catch (error) {
    // If Redis is down, fail open — don't block legitimate traffic
    console.error("[RateLimiter] Error checking rate limit:", error)
    return null
  }
}
