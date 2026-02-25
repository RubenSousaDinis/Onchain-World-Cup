"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAccount, useSwitchChain } from "wagmi"
import { useSIWEAuth } from "@/lib/hooks/use-siwe-auth"
import { useNotifications } from "@/components/notifications"
import { useFarcaster } from "@/lib/farcaster-provider"

/** Returns true when running on a mobile/tablet browser (client-side only). */
function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
}

/**
 * Auto-Authentication Provider
 *
 * Automatically manages authentication based on wallet connection state:
 * - Wallet disconnects → Sign out automatically
 * - Wallet connects → Prompt for authentication
 *
 * Simple rule: No wallet connection = No authentication
 * This ensures the authenticated session always matches the connected wallet.
 *
 * On mobile (non-Farcaster) with external wallets (WalletConnect),
 * auto-sign is attempted first. If it fails (rejected / error), a
 * manual "Sign In" prompt is shown so the user can retry.
 */
export function AutoAuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, isReconnecting, status, chain, connector } = useAccount()
  const { isAuthenticated, login, isLoading, logout, session, walletAddress: sessionWallet, defaultChainId, defaultChain } = useSIWEAuth()
  const { switchChain } = useSwitchChain()
  const { info, success, error } = useNotifications()
  const { isFarcasterMiniApp, isLoading: isFarcasterLoading } = useFarcaster()
  const hasTriggeredAuth = useRef(false)
  const [showMobileSignPrompt, setShowMobileSignPrompt] = useState(false)
  const [isSigningInProgress, setIsSigningInProgress] = useState(false)

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
      setShowMobileSignPrompt(false)
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
          const switchErrorMessage = switchErr instanceof Error ? switchErr.message : JSON.stringify(switchErr)

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

  /**
   * Shared sign-in logic used by both auto-trigger and manual prompt.
   * When `showPromptOnFailure` is true, a failed attempt will surface the
   * mobile sign-in prompt instead of silently resetting.
   */
  const executeSignIn = useCallback(async (opts?: { showPromptOnFailure?: boolean }) => {
    if (isSigningInProgress) return
    setIsSigningInProgress(true)

    try {
      console.log("[AutoAuth] Executing authentication flow")

      const result = await login()

      console.log("[AutoAuth] Authentication successful:", {
        ok: result?.ok,
        status: result?.status,
      })

      setShowMobileSignPrompt(false)

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
        } catch (switchErr) {
          console.error("[AutoAuth] Failed to switch chain:", switchErr)
          const switchErrorMessage = switchErr instanceof Error ? switchErr.message : JSON.stringify(switchErr)
          if (switchErrorMessage.includes("rejected") || switchErrorMessage.includes("denied")) {
            info("Network Switch Required", `Please switch your wallet to ${defaultChain.name} to place votes`)
          } else {
            error("Network Switch Failed", `Unable to switch to ${defaultChain.name}. ${switchErrorMessage}`)
          }
        }
      }
    } catch (err) {
      console.error("[AutoAuth] Authentication failed:", err)
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)

      if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
        console.log("[AutoAuth] User rejected authentication")
      } else {
        error("Authentication Failed", errorMessage)
      }

      // If auto-sign failed on mobile, show the manual prompt as fallback
      if (opts?.showPromptOnFailure) {
        console.log("[AutoAuth] Auto-sign failed — showing manual sign prompt")
        setShowMobileSignPrompt(true)
      } else {
        setShowMobileSignPrompt(false)
      }
      // Reset so they can try again
      hasTriggeredAuth.current = false
    } finally {
      setIsSigningInProgress(false)
    }
  }, [login, isFarcasterMiniApp, chain, defaultChainId, defaultChain, switchChain, info, success, error, isSigningInProgress])

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

    const mobile = isMobileBrowser()
    // Detect WalletConnect-based connection (MetaMask mobile, etc.)
    const isWalletConnect = connector?.type === "walletConnect" || connector?.id === "walletConnect"
    // On mobile WalletConnect: try auto-sign, but show a manual prompt if it fails
    const isMobileWalletConnect = mobile && isWalletConnect && !isFarcasterMiniApp

    // Use a longer delay for mobile WalletConnect to let the connection settle
    const delay = isMobileWalletConnect ? 2000 : 1000
    const timer = setTimeout(async () => {
      console.log("[AutoAuth] Current state:", { address, isConnected, isAuthenticated, isFarcasterMiniApp, mobile, isWalletConnect })

      if (!isFarcasterMiniApp) {
        info("Authentication Required", "Please sign the message to authenticate with your wallet")
      }

      await executeSignIn({ showPromptOnFailure: isMobileWalletConnect })
    }, delay)

    return () => clearTimeout(timer)
  }, [isConnected, isReconnecting, status, isAuthenticated, address, sessionWallet, isLoading, isFarcasterLoading, isFarcasterMiniApp, connector, executeSignIn, info])

  /** Handle tapping the "Sign In" button on the mobile prompt. */
  const handleMobileSign = useCallback(async () => {
    if (isSigningInProgress) return
    info("Signature Required", "Please approve the sign request in your wallet app")
    await executeSignIn()
  }, [executeSignIn, info, isSigningInProgress])

  return (
    <>
      {children}
      {/* Mobile wallet sign prompt — shown only when auto-sign failed,
          so the user can retry at their own pace. */}
      {showMobileSignPrompt && (
        <div
          style={{ zIndex: 9998 }}
          className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-background border-2 border-accent rounded-sm p-4 shadow-xl"
        >
          <p className="text-sm font-bold text-foreground mb-1">Sign In Required</p>
          <p className="text-xs text-muted-foreground mb-3">
            Automatic sign-in didn&apos;t complete. Tap below to try again — you&apos;ll need to
            approve the request in your wallet app, then return here.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleMobileSign}
              disabled={isSigningInProgress}
              className="cm-nav-tab flex-1 py-1.5 text-xs font-bold rounded-sm disabled:opacity-50"
            >
              {isSigningInProgress ? "SIGNING..." : "SIGN IN"}
            </button>
            <button
              onClick={() => {
                setShowMobileSignPrompt(false)
                hasTriggeredAuth.current = false
              }}
              className="flex-1 py-1.5 text-xs font-bold rounded-sm border border-border text-muted-foreground"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}
    </>
  )
}
