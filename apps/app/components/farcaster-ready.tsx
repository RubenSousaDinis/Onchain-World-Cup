"use client"

import { useEffect } from "react"

/**
 * Component that calls sdk.actions.ready() immediately to dismiss Farcaster splash screen
 * Must be rendered at the root of the app
 *
 * IMPORTANT: Calls ready() unconditionally and as early as possible
 */

// Call ready() at module load time (before component even renders)
if (typeof window !== "undefined") {
  import("@farcaster/miniapp-sdk")
    .then(({ sdk }) => {
      sdk.actions
        .ready()
        .then(() => {
          console.log("[Farcaster] SDK ready() called at module load")
        })
        .catch((err) => {
          console.log("[Farcaster] ready() call (normal if not in Farcaster):", err)
        })
    })
    .catch((err) => {
      console.log("[Farcaster] SDK import failed (expected outside Farcaster):", err)
    })
}

export function FarcasterReady() {
  useEffect(() => {
    // Also call in useEffect as a backup
    const callReady = async () => {
      try {
        if (typeof window === "undefined") return

        const { sdk } = await import("@farcaster/miniapp-sdk")
        await sdk.actions.ready()
        console.log("[Farcaster] SDK ready() called from useEffect (backup)")
      } catch (error) {
        // Ignore errors - already called at module level
      }
    }

    callReady()
  }, [])

  return null
}
