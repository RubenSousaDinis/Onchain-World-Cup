/**
 * Application constants
 */

// TODO: Update this date when qualification opening is confirmed
export const QUALIFICATION_OPEN_DATE = new Date('2026-02-15T00:00:00Z')

// Contract addresses (placeholder - update when contracts are deployed)
export const QUALIFICATION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_ADDRESS || '0x...'

/**
 * Open Graph Image Constants
 * Standard configuration for all OG images
 */
export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

// NOTE: Do not use OG_IMAGE_RUNTIME in opengraph-image.tsx files
// Next.js requires `export const runtime = 'edge'` to be a literal string
// for static analysis at build time. Import constants cannot be used.
export const OG_IMAGE_CONTENT_TYPE = 'image/png' as const

/**
 * Typography constants for OG images
 * Championship Manager 01/02 inspired condensed font stack
 */
export const OG_IMAGE_FONT_FAMILY = 'Arial Narrow, Helvetica Condensed, Arial, sans-serif'

/**
 * Logo dimensions for OG images
 */
export const OG_IMAGE_LOGO = {
  SMALL: { width: 56, height: 52 },
  LARGE: { width: 70, height: 65 },
} as const

/**
 * Color palette for OG images
 * Matches the Championship Manager theme
 */
export const OG_IMAGE_COLORS = {
  BACKGROUND_GRADIENT: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f3e 50%, #0a0f1a 100%)',
  HIGHLIGHT_YELLOW: '#d4ff00',
  HIGHLIGHT_YELLOW_ALT: '#c6ff00',
  TEXT_GRAY: '#a0a0a0',
  TEXT_WHITE: '#ffffff',
  BASE_BLUE: '#0052FF',
  GOLD: '#FFD700',
  SILVER: '#C0C0C0',
  BRONZE: '#CD7F32',
} as const
