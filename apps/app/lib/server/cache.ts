/**
 * Server-side caching utility using Next.js unstable_cache
 *
 * Features:
 * - Integrates with Next.js Data Cache
 * - Supports revalidation tags
 * - Works with serverless/edge deployments
 * - Automatic cache management
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/unstable_cache
 */

import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'

/**
 * Create a cached function with Next.js Data Cache
 *
 * @example
 * const getCachedMatches = createCachedFunction(
 *   async () => fetchMatches(),
 *   ['matches'],
 *   { revalidate: 3600, tags: ['matches'] }
 * )
 */
export function createCachedFunction<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options?: {
    revalidate?: number | false
    tags?: string[]
  }
) {
  return unstable_cache(fn, keyParts, options)
}

/**
 * Revalidate cache by tag
 *
 * @example
 * invalidateCacheTag('matches') // Invalidates all matches cache
 */
export function invalidateCacheTag(tag: string) {
  revalidateTag(tag)
}

/**
 * Invalidate multiple cache tags
 */
export function invalidateCacheTags(tags: string[]) {
  tags.forEach((tag) => revalidateTag(tag))
}

/**
 * Cache TTL presets (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 900,           // 15 minutes
  HOUR: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
} as const

/**
 * Helper to generate cache keys
 */
export function getCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|')

  return `${prefix}:${sortedParams}`
}
