/**
 * API Utilities
 *
 * Helper functions for API routes including CORS configuration
 */

import { NextResponse } from "next/server"

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
