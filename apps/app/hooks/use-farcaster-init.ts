"use client"

import { useEffect, useState } from "react"

export interface FarcasterInitStatus {
  isInitialized: boolean
  isReady: boolean
  error?: string
  inFarcasterContext: boolean
}

/**
 * Hook to handle Farcaster SDK initialization
 * Detects if running in Farcaster context and calls ready() when initialized
 *
 * Note: The actual ready() call happens at module load in FarcasterReady component
 * This hook provides status information for components that need to know initialization state
 *
 * @returns Initialization status object
 */
export function useFarcasterInit(): FarcasterInitStatus {
  const [status, setStatus] = useState<FarcasterInitStatus>({
    isInitialized: false,
    isReady: false,
    inFarcasterContext: false,
  })

  useEffect(() => {
    const detectAndInit = async () => {
      try {
        // Detect if running in Farcaster context
        const isInFarcaster =
          typeof window !== "undefined" &&
          ((window as unknown as { ethereum?: { isFarcaster?: boolean }; farcaster?: unknown }).ethereum?.isFarcaster ||
            (window as unknown as { ethereum?: { isFarcaster?: boolean }; farcaster?: unknown }).farcaster ||
            navigator.userAgent.includes("Warpcast") ||
            navigator.userAgent.includes("Farcaster"))

        if (!isInFarcaster) {
          // Not in Farcaster - set status accordingly
          setStatus({
            isInitialized: true,
            isReady: true,
            inFarcasterContext: false,
          })
          return
        }

        // In Farcaster context - verify SDK is available
        try {
          const { sdk } = await import("@farcaster/miniapp-sdk")

          // SDK ready() is already called at module load by FarcasterReady component
          // We just verify the SDK is available and working
          await sdk.context

          setStatus({
            isInitialized: true,
            isReady: true,
            inFarcasterContext: true,
          })
        } catch (sdkError) {
          console.error("[useFarcasterInit] SDK error:", sdkError)
          setStatus({
            isInitialized: true,
            isReady: false,
            inFarcasterContext: true,
            error: sdkError instanceof Error ? sdkError.message : "SDK initialization failed",
          })
        }
      } catch (error) {
        console.error("[useFarcasterInit] Detection error:", error)
        setStatus({
          isInitialized: true,
          isReady: false,
          inFarcasterContext: false,
          error: error instanceof Error ? error.message : "Context detection failed",
        })
      }
    }

    detectAndInit()
  }, [])

  return status
}
