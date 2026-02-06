/**
 * Open Graph Image Utilities for Landing App
 */

/**
 * Get the base URL for assets in OG images
 * Works across different environments (local, preview, production)
 */
export function getBaseUrl(): string {
  // Prefer NEXT_PUBLIC_APP_URL if explicitly set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // On Vercel, use VERCEL_URL with https
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback to production URL
  return 'https://app.onchainworldcup.xyz'
}

/**
 * OG Image Constants
 */
export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

// NOTE: Do not use OG_IMAGE_RUNTIME in opengraph-image.tsx files
// Next.js requires `export const runtime = 'edge'` to be a literal string
// for static analysis at build time. Import constants cannot be used.
export const OG_IMAGE_CONTENT_TYPE = 'image/png' as const
export const OG_IMAGE_FONT_FAMILY = 'Arial Narrow, Helvetica Condensed, Arial, sans-serif'

export const OG_IMAGE_LOGO = {
  LARGE: { width: 70, height: 65 },
} as const
