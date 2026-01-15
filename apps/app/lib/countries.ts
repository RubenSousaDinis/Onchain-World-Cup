/**
 * Countries Data
 *
 * Static reference data for World Cup 2026 countries.
 * Countries are stored as JSON to avoid unnecessary database queries for static data.
 *
 * Usage:
 *   import { countries, getCountryByCode, getCountryName } from '@/lib/countries'
 */

import countriesData from "@/data/countries.json"

export interface Country {
  code: string // ISO 3166-1 alpha-2 code
  name: string
  flagEmoji: string
}

/**
 * All countries participating in World Cup 2026 qualification
 */
export const countries: Country[] = countriesData

/**
 * Get country by ISO code
 * @param code ISO 3166-1 alpha-2 code (e.g., "BR", "AR")
 * @returns Country object or undefined if not found
 */
export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code)
}

/**
 * Get country name by ISO code
 * @param code ISO 3166-1 alpha-2 code (e.g., "BR", "AR")
 * @returns Country name or the code if not found
 */
export function getCountryName(code: string): string {
  return getCountryByCode(code)?.name || code
}

/**
 * Get country flag emoji by ISO code
 * @param code ISO 3166-1 alpha-2 code (e.g., "BR", "AR")
 * @returns Flag emoji or empty string if not found
 */
export function getCountryFlag(code: string): string {
  return getCountryByCode(code)?.flagEmoji || ""
}

/**
 * Validate if a country code is valid
 * @param code ISO 3166-1 alpha-2 code
 * @returns true if the country exists in our list
 */
export function isValidCountryCode(code: string): boolean {
  return countries.some((c) => c.code === code)
}
