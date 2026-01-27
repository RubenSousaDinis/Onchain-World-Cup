/**
 * API Authentication
 *
 * Simple API key authentication for protected endpoints.
 * API keys are stored in environment variables.
 */

/**
 * Check if API key is valid
 *
 * @param apiKey - API key from request header
 * @returns true if valid, false otherwise
 */
export function isValidApiKey(apiKey: string | null): boolean {
  if (!apiKey) {
    return false
  }

  // Get valid API keys from environment variables
  // You can have multiple keys separated by commas
  const validKeys = process.env.API_SECRET_KEYS?.split(",").map((k) => k.trim()) || []

  return validKeys.includes(apiKey)
}

/**
 * Extract API key from request headers
 *
 * Supports multiple header formats:
 * - Authorization: Bearer <api_key>
 * - X-API-Key: <api_key>
 *
 * @param request - Incoming request
 * @returns API key or null
 */
export function getApiKey(request: Request): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get("x-api-key")
  if (apiKeyHeader) {
    return apiKeyHeader
  }

  return null
}

/**
 * Check if request is authenticated
 *
 * @param request - Incoming request
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(request: Request): boolean {
  const apiKey = getApiKey(request)
  return isValidApiKey(apiKey)
}

/**
 * Check if request is from localhost (development)
 *
 * @param request - Incoming request
 * @returns true if localhost, false otherwise
 */
export function isLocalhost(request: Request): boolean {
  const host = request.headers.get("host") || ""
  return host.includes("localhost") || host.includes("127.0.0.1")
}
