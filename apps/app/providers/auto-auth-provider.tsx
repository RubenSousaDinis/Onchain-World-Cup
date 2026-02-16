"use client"

import { useEffect, useRef } from "react"
import { useAccount, useSwitchChain } from "wagmi"
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
  const { address, isConnected, isReconnecting, status, chain } = useAccount()
  const { isAuthenticated, login, isLoading, logout, session, walletAddress: sessionWallet, defaultChainId, defaultChain } = useSIWEAuth()
  const { switchChain } = useSwitchChain()
  const { info, success, error } = useNotifications()
  const { isFarcasterMiniApp, isLoading: isFarcasterLoading } = useFarcaster()
  const hasTriggeredAuth = useRef(false)

  // Sign out when wallet disconnects (but not during reconnection/connection)
  useEffect(() => {
    console.log("[AutoAuth] Disconnect check:", { isConnected, isReconnecting, status, isAuthenticated })

    // Don't logout during reconnection - wait for wagmi to finish
    if (isReconnecting) {
      console.log("[AutoAuth] Skipping logout - wallet is reconnecting")
      return
    }

    // Only logout if wallet is truly disconnected (not connecting/reconnecting)
    if (!isConnected && isAuthenticated && status === 'disconnected') {
      console.log("[AutoAuth] Wallet fully disconnected → Signing out")
      logout()
      hasTriggeredAuth.current = false
    }
  }, [isConnected, isReconnecting, status, isAuthenticated, logout])

  // Sign out when wallet address changes (user switched wallets)
  // IMPORTANT: Skip this check in Farcaster context - embedded wallet addresses can differ
  useEffect(() => {
    // Don't check wallet mismatch in Farcaster - the SDK manages wallet state
    if (isFarcasterMiniApp) {
      console.log("[AutoAuth] Skipping wallet mismatch check - Farcaster context")
      return
    }

    if (isConnected && address && isAuthenticated && sessionWallet) {
      const normalizedAddress = address.toLowerCase()
      const normalizedSessionWallet = sessionWallet.toLowerCase()

      if (normalizedAddress !== normalizedSessionWallet) {
        console.log("[AutoAuth] Wallet address mismatch → Signing out and re-authenticating")
        console.log("[AutoAuth] Connected wallet:", normalizedAddress)
        console.log("[AutoAuth] Session wallet:", normalizedSessionWallet)
        logout()
        hasTriggeredAuth.current = false
      }
    }
  }, [address, isConnected, isAuthenticated, sessionWallet, logout, isFarcasterMiniApp])

  // Auto-switch chain when authenticated and on wrong chain
  useEffect(() => {
    // Wait for all states to be ready
    if (!isAuthenticated || !chain || !defaultChainId || isLoading || isFarcasterLoading) {
      return
    }

    // Skip during reconnection
    if (isReconnecting) {
      return
    }

    // Only proceed if wallet is fully connected
    if (!isConnected || status !== 'connected') {
      return
    }

    // If on wrong chain, switch automatically
    if (chain.id !== defaultChainId) {
      console.log(`[AutoAuth] Authenticated but on wrong chain (${chain.id}), switching to ${defaultChainId}`)

      // Use a small delay to avoid conflicting with the auth flow
      const switchTimer = setTimeout(async () => {
        try {
          console.log(`[AutoAuth] Switching to ${defaultChain.name}...`)
          await switchChain({ chainId: defaultChainId })
          console.log("[AutoAuth] Chain switched successfully")
        } catch (switchErr) {
          console.error("[AutoAuth] Failed to auto-switch chain:", switchErr)
          const switchErrorMessage = switchErr instanceof Error ? switchErr.message : "Unknown error"

          // Only show error if it's not a user rejection
          if (!switchErrorMessage.includes("rejected") && !switchErrorMessage.includes("denied")) {
            info(
              "Network Switch Required",
              `Please switch to ${defaultChain.name} to place votes`
            )
          }
        }
      }, 500)

      return () => clearTimeout(switchTimer)
    }
  }, [isAuthenticated, chain, defaultChainId, defaultChain, isLoading, isFarcasterLoading, isReconnecting, status, isConnected, switchChain, info])

  // Trigger authentication when wallet connects
  useEffect(() => {
    console.log("[AutoAuth] Effect triggered - State:", {
      isConnected,
      isReconnecting,
      status,
      address: address?.slice(0, 10),
      isAuthenticated,
      sessionWallet: sessionWallet?.slice(0, 10),
      isLoading,
      hasTriggeredAuth: hasTriggeredAuth.current,
    })

    // Wait for wagmi reconnection to finish
    if (isReconnecting) {
      console.log("[AutoAuth] Skipping - wallet is reconnecting")
      return
    }

    // Only proceed if wallet is fully connected
    if (!isConnected || !address || status !== 'connected') {
      console.log("[AutoAuth] Skipping - wallet not fully connected")
      return
    }

    // Wait for session to load before making decisions
    if (isLoading) {
      console.log("[AutoAuth] Skipping - session is still loading")
      return
    }

    // Wait for Farcaster context detection to complete before choosing auth method
    if (isFarcasterLoading) {
      console.log("[AutoAuth] Skipping - Farcaster context is still loading")
      return
    }

    // If authenticated and session wallet matches connected wallet, we're good
    if (isAuthenticated && sessionWallet) {
      // In Farcaster, don't check wallet match - just trust the session
      if (isFarcasterMiniApp) {
        console.log("[AutoAuth] Already authenticated in Farcaster - skipping auth")
        return
      }

      const normalizedAddress = address.toLowerCase()
      const normalizedSessionWallet = sessionWallet.toLowerCase()

      if (normalizedAddress === normalizedSessionWallet) {
        console.log("[AutoAuth] Already authenticated with matching wallet - skipping auth")
        return
      } else {
        console.log("[AutoAuth] Wallet mismatch detected", {
          connected: normalizedAddress,
          session: normalizedSessionWallet,
        })
      }
    }

    // Don't trigger if already tried
    if (hasTriggeredAuth.current) {
      console.log("[AutoAuth] Skipping - already triggered auth for this session")
      return
    }

    console.log("[AutoAuth] Wallet connected and not authenticated → Triggering authentication")
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

        // Check if user is on the correct chain and switch if needed
        if (chain?.id !== defaultChainId) {
          console.log(`[AutoAuth] Wrong chain detected (${chain?.id}), switching to ${defaultChainId}`)

          try {
            info("Switching Network", `Switching to ${defaultChain.name}...`)
            await switchChain({ chainId: defaultChainId })
            success("Network Switched", `Successfully switched to ${defaultChain.name}`)
            console.log("[AutoAuth] Chain switched successfully")
          } catch (switchErr) {
            console.error("[AutoAuth] Failed to switch chain:", switchErr)
            const switchErrorMessage = switchErr instanceof Error ? switchErr.message : "Unknown error"

            // User rejected the switch request
            if (switchErrorMessage.includes("rejected") || switchErrorMessage.includes("denied")) {
              info(
                "Network Switch Required",
                `Please switch your wallet to ${defaultChain.name} to place votes`
              )
            } else {
              error(
                "Network Switch Failed",
                `Unable to switch to ${defaultChain.name}. ${switchErrorMessage}`
              )
            }
          }
        } else {
          console.log(`[AutoAuth] Already on correct chain (${chain?.id})`)
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
  }, [isConnected, isReconnecting, status, isAuthenticated, address, sessionWallet, isLoading, isFarcasterLoading, login, info, success, error, isFarcasterMiniApp])

  // This provider doesn't render anything, just manages authentication
  return <>{children}</>
}
