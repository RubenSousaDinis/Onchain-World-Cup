/**
 * Open Graph Image Utilities
 *
 * Shared utilities for generating OG images across the application.
 * These functions are optimized for Edge runtime.
 */

import { createClient } from '@supabase/supabase-js'

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
 * Create a Supabase client for use in OG image generation
 * Optimized for Edge runtime with minimal configuration
 */
export function createOgImageSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials for OG image generation')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get country flag emoji from country code
 * Converts 2-letter country codes (e.g., "BR") to flag emojis (e.g., "🇧🇷")
 */
export function getCountryFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
