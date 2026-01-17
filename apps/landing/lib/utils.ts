import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the app URL based on the current domain.
 * If on example.com, returns https://app.example.com
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    // Handle localhost/development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3101"
    }
    // Handle production - prepend app. subdomain
    return `https://app.${hostname}`
  }
  // Server-side fallback
  return "https://app.onchainworldcup.xyz"
}
