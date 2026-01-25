"use client"

import { useAccount, useDisconnect, useConnect } from "wagmi"
import { useFarcaster } from "@/lib/farcaster-provider"
import { useEffect, useState } from "react"

/**
 * Unified wallet connection hook that works for both:
 * - DESKTOP: Regular web app with Reown AppKit
 * - FARCASTER: Farcaster Mini App with SDK wallet
 *
 * This hook provides a consistent interface regardless of context.
 */
export function useWalletConnection() {
  const { isFrameContext, fid, username, displayName, pfpUrl, sdkReady } = useFarcaster()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const [walletContext, setWalletContext] = useState<"desktop" | "farcaster" | null>(null)

  // Determine wallet context
  useEffect(() => {
    if (isFrameContext && sdkReady) {
      setWalletContext("farcaster")
      console.log("[WalletConnection] Context: FARCASTER")
    } else {
      setWalletContext("desktop")
      console.log("[WalletConnection] Context: DESKTOP")
    }
  }, [isFrameContext, sdkReady])

  // FARCASTER CONTEXT: User info from Farcaster SDK
  const farcasterUser = isFrameContext
    ? {
        fid,
        username,
        displayName,
        pfpUrl,
      }
    : null

  // DESKTOP CONTEXT: Wallet can be disconnected
  const canDisconnect = !isFrameContext

  // Disconnect handler (only works in desktop context)
  const handleDisconnect = () => {
    if (canDisconnect) {
      disconnect()
    } else {
      console.warn("[WalletConnection] Disconnect not available in Farcaster context")
    }
  }

  return {
    // Wallet state
    address,
    isConnected,
    chain,

    // Context information
    walletContext,
    isDesktop: walletContext === "desktop",
    isFarcaster: walletContext === "farcaster",

    // Farcaster-specific user data
    farcasterUser,

    // Actions
    canDisconnect,
    disconnect: handleDisconnect,
  }
}
