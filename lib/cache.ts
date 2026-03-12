import { redis } from "@/lib/redis"

/**
 * Get a cached value by key. Returns null if not found or on error.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data ?? null
  } catch (error) {
    console.error(`[Cache] Failed to get key "${key}":`, error)
    return null
  }
}

/**
 * Set a cached value with an optional TTL (in seconds).
 * Defaults to 60 seconds if no TTL is provided.
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds })
  } catch (error) {
    console.error(`[Cache] Failed to set key "${key}":`, error)
  }
}

/**
 * Delete a cached value by key.
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error(`[Cache] Failed to delete key "${key}":`, error)
  }
}
