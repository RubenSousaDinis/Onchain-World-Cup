import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format an ETH value for display, stripping trailing zeros.
 *
 * formatEth(0.001)       → "0.001"
 * formatEth("0.001000")  → "0.001"
 * formatEth(1.5)         → "1.5"
 * formatEth(null)        → "0"
 */
export function formatEth(value: string | number | null | undefined, decimals = 6): string {
  const n = parseFloat(String(value ?? 0))
  if (isNaN(n)) return "0"
  return parseFloat(n.toFixed(decimals)).toString()
}
