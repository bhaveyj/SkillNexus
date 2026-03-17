import { Redis } from "@upstash/redis"

let redisInstance: Redis | null = null
let hasLoggedMissingEnv = false

export function getRedisClient(): Redis | null {
  if (redisInstance) {
    return redisInstance
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (!hasLoggedMissingEnv) {
      hasLoggedMissingEnv = true
      console.warn(
        "[Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. " +
          "Caching and rate limiting are disabled in this environment."
      )
    }
    return null
  }

  redisInstance = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  return redisInstance
}

export const redis = getRedisClient()
