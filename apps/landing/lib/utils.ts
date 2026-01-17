import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the app URL based on the current domain.
 * If on example.com, returns https://app.example.com
 * Strips www. prefix if present to avoid app.www.example.com
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    // Handle localhost/development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3101"
    }
    // Strip www. prefix if present to avoid app.www.domain.com
    const domain = hostname.startsWith("www.") ? hostname.slice(4) : hostname
    // Handle production - prepend app. subdomain
    return `https://app.${domain}`
  }
  // Server-side fallback
  return "https://app.onchainworldcup.xyz"
}
