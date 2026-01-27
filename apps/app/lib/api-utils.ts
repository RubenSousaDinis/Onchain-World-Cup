/**
 * API Utilities
 *
 * Helper functions for API routes including CORS, rate limiting, and authentication
 */

import { NextResponse } from "next/server"
import { checkRateLimit, getClientIdentifier, type RateLimitConfig } from "./rate-limit"
import { isAuthenticated, isLocalhost } from "./api-auth"

/**
 * CORS headers for API routes
 * Allows Swagger UI and other clients to make requests
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

/**
 * Add CORS headers to a NextResponse
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse(data: any, status = 200): NextResponse {
  const response = NextResponse.json(data, { status })
  return addCorsHeaders(response)
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

/**
 * Apply rate limiting to a request
 *
 * @param request - Incoming request
 * @param config - Rate limit configuration
 * @returns NextResponse with 429 status if rate limited, null if allowed
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): NextResponse | null {
  const identifier = getClientIdentifier(request)
  const rateLimit = checkRateLimit(identifier, config)

  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      {
        error: "Too many requests",
        message: "You have exceeded the rate limit. Please try again later.",
        retryAfter: new Date(rateLimit.resetAt).toISOString(),
      },
      { status: 429 }
    )

    // Add rate limit headers
    Object.entries(rateLimit.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Add Retry-After header
    const retryAfterSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
    response.headers.set("Retry-After", String(retryAfterSeconds))

    return addCorsHeaders(response)
  }

  return null
}

/**
 * Check if request is authenticated (has valid API key)
 * In development (localhost), authentication is bypassed
 *
 * @param request - Incoming request
 * @returns NextResponse with 401 status if not authenticated, null if authenticated
 */
export function requireAuth(request: Request): NextResponse | null {
  // Skip auth check in development
  if (isLocalhost(request)) {
    return null
  }

  if (!isAuthenticated(request)) {
    const response = NextResponse.json(
      {
        error: "Unauthorized",
        message: "Valid API key required. Include in Authorization header: 'Bearer YOUR_API_KEY'",
      },
      { status: 401 }
    )
    return addCorsHeaders(response)
  }

  return null
}

/**
 * Add rate limit headers to response
 *
 * @param response - Response to add headers to
 * @param request - Original request for identifier
 * @param config - Rate limit configuration
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: Request,
  config: RateLimitConfig
): NextResponse {
  const identifier = getClientIdentifier(request)
  const rateLimit = checkRateLimit(identifier, config)

  Object.entries(rateLimit.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
