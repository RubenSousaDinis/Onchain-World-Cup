/**
 * Rate Limiting
 *
 * Simple in-memory rate limiting for API endpoints.
 * For production with multiple instances, use Redis (Upstash) or Vercel KV.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number

  /**
   * Time window in seconds
   */
  windowSeconds: number
}

/**
 * Default rate limits for different endpoint types
 */
export const RATE_LIMITS = {
  // Public read endpoints (countries, leaderboard, etc.)
  PUBLIC_READ: { limit: 100, windowSeconds: 60 }, // 100 requests per minute

  // Expensive read endpoints (indexer status)
  EXPENSIVE_READ: { limit: 20, windowSeconds: 60 }, // 20 requests per minute

  // Write endpoints (indexer sync, admin operations)
  WRITE: { limit: 5, windowSeconds: 60 }, // 5 requests per minute

  // Default fallback
  DEFAULT: { limit: 50, windowSeconds: 60 }, // 50 requests per minute
} as const

/**
 * Check if a request exceeds rate limit
 *
 * @param identifier - Unique identifier (IP address, API key, user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and rate limit headers
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): {
  allowed: boolean
  remaining: number
  resetAt: number
  headers: Record<string, string>
} {
  const now = Date.now()
  const key = `${identifier}:${config.limit}:${config.windowSeconds}`

  let entry = rateLimitMap.get(key)

  // Create or reset entry if window has passed
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowSeconds * 1000,
    }
    rateLimitMap.set(key, entry)
  }

  // Increment request count
  entry.count++

  const allowed = entry.count <= config.limit
  const remaining = Math.max(0, config.limit - entry.count)

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    headers: {
      "X-RateLimit-Limit": String(config.limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": new Date(entry.resetAt).toISOString(),
    },
  }
}

/**
 * Get client identifier from request
 * Uses IP address or forwarded IP
 */
export function getClientIdentifier(request: Request): string {
  // Check for forwarded IP (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    // x-forwarded-for can be comma-separated list, take first one
    return forwarded.split(",")[0].trim()
  }

  // Check for real IP (Vercel)
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback to generic identifier
  return "unknown"
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
