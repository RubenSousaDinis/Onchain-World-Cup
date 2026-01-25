"use client"

/**
 * FARCASTER WALLET CONFIGURATION
 *
 * This configuration is used when the app runs inside a Farcaster Mini App.
 * The Farcaster SDK provides:
 * - Automatic wallet connection (user's Farcaster wallet)
 * - User profile information (FID, username, pfp)
 * - Seamless transaction signing
 *
 * No manual wallet connection is needed - the user is already authenticated
 * through Farcaster.
 */

import { useEffect, useState } from "react"
import { useConnect, useAccount } from "wagmi"
import { useFarcaster } from "@/lib/farcaster-provider"

/**
 * Hook to automatically connect wallet in Farcaster context
 * This only runs when the app is opened inside Farcaster
 */
export function useFarcasterWalletConnection() {
  const { isFrameContext, sdkReady } = useFarcaster()
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false)

  useEffect(() => {
    // Only attempt auto-connect once in Farcaster context
    if (
      isFrameContext &&
      sdkReady &&
      !isConnected &&
      !autoConnectAttempted
    ) {
      console.log("[Farcaster Wallet] Attempting auto-connect...")

      // Find the appropriate connector
      // In Farcaster, the SDK provides an injected wallet
      const connector = connectors.find((c) => c.type === "injected")

      if (connector) {
        connect({ connector })
        console.log("[Farcaster Wallet] Connected via Farcaster SDK wallet")
      } else {
        console.warn("[Farcaster Wallet] No injected connector found")
      }

      setAutoConnectAttempted(true)
    }
  }, [isFrameContext, sdkReady, isConnected, autoConnectAttempted, connect, connectors])

  return {
    isAutoConnecting: isFrameContext && sdkReady && !isConnected && !autoConnectAttempted,
    autoConnectAttempted,
  }
}

/**
 * Helper to determine if we should show manual connect button
 * In Farcaster, wallet connects automatically
 * In desktop, user must manually connect
 */
export function shouldShowConnectButton(isFrameContext: boolean, isConnected: boolean): boolean {
  // FARCASTER: Don't show connect button, wallet connects automatically
  if (isFrameContext) {
    return false
  }

  // DESKTOP: Show connect button if not connected
  return !isConnected
}

/**
 * Helper to get display name for connected user
 * Farcaster: Uses Farcaster username/display name
 * Desktop: Uses truncated wallet address
 */
export function getWalletDisplayName(
  address: string | undefined,
  isFrameContext: boolean,
  farcasterUsername?: string,
  farcasterDisplayName?: string
): string {
  if (!address) return "Not Connected"

  // FARCASTER: Show Farcaster identity
  if (isFrameContext) {
    return farcasterDisplayName || farcasterUsername || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // DESKTOP: Show truncated address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

console.log("[Farcaster Wallet] Farcaster wallet utilities loaded")
