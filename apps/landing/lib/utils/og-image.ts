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

  // On Vercel, prefer the stable production URL over the per-deployment URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Fallback to per-deployment Vercel URL (preview deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback to production URL
  return 'https://onchainworldcup.xyz'
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
