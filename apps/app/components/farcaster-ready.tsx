"use client"

import { useEffect } from "react"

/**
 * Component that calls sdk.actions.ready() immediately to dismiss Farcaster splash screen
 * Must be rendered at the root of the app
 */
export function FarcasterReady() {
  useEffect(() => {
    // Call ready() as soon as possible to dismiss splash screen
    const initializeFarcasterSDK = async () => {
      try {
        // Check if we're in a Farcaster context
        if (typeof window === "undefined") return

        const isInFarcaster =
          (window as any).ethereum?.isFarcaster ||
          (window as any).farcaster ||
          navigator.userAgent.includes("Warpcast") ||
          navigator.userAgent.includes("Farcaster")

        if (isInFarcaster) {
          // Dynamically import the SDK to avoid SSR issues
          const { sdk } = await import("@farcaster/miniapp-sdk")

          // Initialize and call ready immediately
          await sdk.actions.ready()

          console.log("[Farcaster] SDK ready() called successfully")
        }
      } catch (error) {
        console.error("[Farcaster] Failed to initialize SDK:", error)
      }
    }

    initializeFarcasterSDK()
  }, [])

  return null
}
