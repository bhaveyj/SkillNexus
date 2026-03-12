import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

// --- Rate limiter presets ---

/** General API: 100 requests per 1-minute sliding window */
export const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "ratelimit:general",
})

/** Auth routes: 10 requests per 1-minute sliding window */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "ratelimit:auth",
})

/** AI endpoints: 20 requests per 1-minute sliding window */
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "ratelimit:ai",
})

// --- Helper ---

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous"
}

/**
 * Apply rate limiting to a request.
 * Returns null if allowed, or a 429 Response if the limit is exceeded.
 *
 * Usage in any API route:
 *
 *   const limited = await applyRateLimit(req, generalLimiter)
 *   if (limited) return limited
 */
export async function applyRateLimit(
  req: Request,
  limiter: Ratelimit = generalLimiter
): Promise<NextResponse | null> {
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
