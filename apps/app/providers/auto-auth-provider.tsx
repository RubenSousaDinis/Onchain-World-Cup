"use client"

import { useEffect, useRef } from "react"
import { useAccount } from "wagmi"
import { useSIWEAuth } from "@/lib/hooks/use-siwe-auth"
import { useNotifications } from "@/components/notifications"
import { useFarcaster } from "@/lib/farcaster-provider"

/**
 * Auto-Authentication Provider
 *
 * Automatically manages authentication based on wallet connection state:
 * - Wallet disconnects → Sign out automatically
 * - Wallet connects → Prompt for authentication
 *
 * Simple rule: No wallet connection = No authentication
 * This ensures the authenticated session always matches the connected wallet.
 */
export function AutoAuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { isAuthenticated, login, isLoading, logout } = useSIWEAuth()
  const { info, success, error } = useNotifications()
  const { isFarcasterMiniApp } = useFarcaster()
  const hasTriggeredAuth = useRef(false)

  // Sign out when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      console.log("[AutoAuth] Wallet disconnected → Signing out")
      logout()
    }

    // Reset auth trigger when wallet disconnects
    if (!isConnected) {
      hasTriggeredAuth.current = false
    }
  }, [isConnected, isAuthenticated, logout])

  // Trigger authentication when wallet connects
  useEffect(() => {
    // Only proceed if wallet is connected
    if (!isConnected || !address) {
      return
    }

    // Don't trigger if already authenticated or already tried
    if (isAuthenticated || hasTriggeredAuth.current || isLoading) {
      return
    }

    console.log("[AutoAuth] Wallet connected → Triggering authentication")
    hasTriggeredAuth.current = true

    // Trigger authentication after a short delay to allow UI to settle
    const timer = setTimeout(async () => {
      console.log("[AutoAuth] Executing authentication flow")
      console.log("[AutoAuth] Current state:", { address, isConnected, isAuthenticated, isFarcasterMiniApp })

      try {
        // In Farcaster, authentication is automatic (no user interaction needed)
        // In desktop, user needs to sign a message
        if (!isFarcasterMiniApp) {
          info("Authentication Required", "Please sign the message to authenticate with your wallet")
        }

        console.log("[AutoAuth] Calling login()...")
        const result = await login()

        console.log("[AutoAuth] Authentication successful:", result)
        console.log("[AutoAuth] Result details:", {
          ok: result?.ok,
          status: result?.status,
          url: result?.url,
          error: result?.error,
        })

        // Show success message
        if (isFarcasterMiniApp) {
          success("Authenticated", "You can now place votes!")
        } else {
          success("Authenticated Successfully", "You're now signed in and can place votes")
        }
      } catch (err) {
        console.error("[AutoAuth] Authentication failed:", err)
        console.error("[AutoAuth] Error details:", {
          name: err instanceof Error ? err.name : "Unknown",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        })
        const errorMessage = err instanceof Error ? err.message : "Unknown error"

        // Don't show error if user rejected (they might want to skip auth)
        if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
          console.log("[AutoAuth] User rejected authentication")
        } else {
          error("Authentication Failed", errorMessage)
        }

        // Reset so they can try again
        hasTriggeredAuth.current = false
      }
    }, 1000) // 1 second delay to let wallet connection settle

    return () => clearTimeout(timer)
  }, [isConnected, isAuthenticated, address, isLoading, login, info, success, error, isFarcasterMiniApp])

  // This provider doesn't render anything, just manages authentication
  return <>{children}</>
}
