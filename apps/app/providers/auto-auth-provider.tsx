"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAccount } from "wagmi"
import { useSIWEAuth } from "@/lib/hooks/use-siwe-auth"
import { useNotifications } from "@/components/notifications"
import { useFarcaster } from "@/lib/farcaster-provider"

/** Returns true when running on a mobile/tablet browser (client-side only). */
function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
}

/** Returns true when the connector is an AppKit embedded wallet (email/social login). */
function isEmbeddedWalletConnector(connector: { id?: string; type?: string } | undefined): boolean {
  if (!connector) return false
  // AppKit embedded wallet connector uses "w3mAuth" as id/type.
  // Also check for generic "auth" patterns for forward compatibility.
  const id = connector.id?.toLowerCase() ?? ""
  const type = connector.type?.toLowerCase() ?? ""
  return id.includes("auth") || type.includes("auth")
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
  const { isAuthenticated, login, isLoading, logout, session, walletAddress: sessionWallet, defaultChainId } = useSIWEAuth()
  const { info, success, error } = useNotifications()
  const { isFarcasterMiniApp, isLoading: isFarcasterLoading } = useFarcaster()
  const hasTriggeredAuth = useRef(false)
  const [showMobileSignPrompt, setShowMobileSignPrompt] = useState(false)
  const [isSigningInProgress, setIsSigningInProgress] = useState(false)

  // Detect OAuth popup context (social login callback opens our app in a popup).
  // Skip ALL auth logic in that case — any modal.close() call would destroy the
  // social login handshake before FRAME_CONNECT_SOCIAL_SUCCESS can fire.
  const isOAuthPopup = typeof window !== "undefined" && window.opener !== null

  // Sign out when wallet disconnects (but not during reconnection/connection)
  useEffect(() => {
    if (isOAuthPopup) return

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
    if (isOAuthPopup) return

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

  // Log when authenticated on a non-default chain — no auto-switch.
  // Chain enforcement is handled by the vote modal when the user actually votes.
  useEffect(() => {
    if (!isAuthenticated || !chain || !defaultChainId || isLoading || isFarcasterLoading) {
      return
    }
    if (chain.id !== defaultChainId) {
      console.log(`[AutoAuth] Authenticated on chain ${chain.id} (default: ${defaultChainId}) — chain switch deferred to vote time`)
    }
  }, [isAuthenticated, chain, defaultChainId, isLoading, isFarcasterLoading])

  /**
   * Shared sign-in logic used by both auto-trigger and manual prompt.
   * - `showPromptBeforeSign`: immediately show the wallet prompt before the
   *   sign request is sent (mobile UX — user needs to switch to wallet app).
   * - `showPromptOnFailure`: show the prompt only if the attempt fails.
   */
  const executeSignIn = useCallback(async (opts?: { showPromptOnFailure?: boolean; showPromptBeforeSign?: boolean }) => {
    if (isSigningInProgress) return
    setIsSigningInProgress(true)

    // On mobile WalletConnect, surface the prompt BEFORE sending the sign
    // request so the user knows to switch to their wallet app immediately.
    if (opts?.showPromptBeforeSign) {
      setShowMobileSignPrompt(true)
    }

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

      // Don't switch chains here — let the vote modal handle it when the user
      // actually tries to vote. This avoids confusing WalletConnect popups
      // right after sign-in.
      if (chain?.id !== defaultChainId) {
        console.log(`[AutoAuth] Post-login: on chain ${chain?.id} (default: ${defaultChainId}) — will switch when voting`)
      }
    } catch (err) {
      console.error("[AutoAuth] Authentication failed:", err)
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)

      if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
        console.log("[AutoAuth] User rejected authentication")
        // User explicitly dismissed — hide the prompt; don't re-show automatically
        setShowMobileSignPrompt(false)
      } else {
        error("Authentication Failed", errorMessage)
        // Show (or keep showing) the manual prompt so the user can retry
        if (opts?.showPromptOnFailure || opts?.showPromptBeforeSign) {
          console.log("[AutoAuth] Auto-sign failed — showing manual sign prompt")
          setShowMobileSignPrompt(true)
        } else {
          setShowMobileSignPrompt(false)
        }
      }
      // Reset so they can try again
      hasTriggeredAuth.current = false
    } finally {
      setIsSigningInProgress(false)
    }
  }, [login, isFarcasterMiniApp, chain, defaultChainId, success, error, isSigningInProgress])

  // Trigger authentication when wallet connects
  useEffect(() => {
    if (isOAuthPopup) return

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
    const isEmbedded = isEmbeddedWalletConnector(connector)
    // Detect WalletConnect-based connection (MetaMask mobile, etc.)
    const isWalletConnect = connector?.type === "walletConnect" || connector?.id === "walletConnect"
    // On mobile WalletConnect: try auto-sign, but show a manual prompt if it fails
    const isMobileWalletConnect = mobile && isWalletConnect && !isFarcasterMiniApp

    // Embedded wallets (social/email login) need a longer delay — the AppKit modal
    // must finish its MPC wallet initialisation and close before we send a
    // personal_sign request, otherwise the signing iframe conflicts with the
    // still-open connection modal and the UI hangs.
    const delay = isEmbedded ? 3000 : isMobileWalletConnect ? 2000 : 1000
    const timer = setTimeout(async () => {
      console.log("[AutoAuth] Current state:", { address, isConnected, isAuthenticated, isFarcasterMiniApp, mobile, isWalletConnect, isEmbedded })

      // Close the AppKit modal before triggering SIWE for embedded wallets.
      // The modal may still be open from the social login flow — sending a
      // personal_sign while the modal is open causes the embedded wallet's
      // signing iframe to conflict with the connection UI, hanging the modal.
      if (isEmbedded) {
        try {
          const { modal: appKit } = await import("@/lib/wallet/appkit-modal")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (appKit as any).close === "function") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (appKit as any).close()
            console.log("[AutoAuth] Closed AppKit modal before SIWE sign")
          }
        } catch {
          // Non-critical — proceed with sign-in even if modal close fails
        }
      }

      if (!isFarcasterMiniApp) {
        info("Authentication Required", "Please sign the message to authenticate with your wallet")
      }

      await executeSignIn({ showPromptOnFailure: isMobileWalletConnect, showPromptBeforeSign: isMobileWalletConnect })
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
          <p className="text-sm font-bold text-foreground mb-1">
            {isSigningInProgress ? "Sign Request Sent" : "Sign In Required"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {isSigningInProgress
              ? "Open your wallet app and approve the sign request, then come back here."
              : "Didn\u2019t see the sign request? Tap below to try again — approve it in your wallet app, then return here."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleMobileSign}
              disabled={isSigningInProgress}
              className="cm-nav-tab flex-1 py-1.5 text-xs font-bold rounded-sm disabled:opacity-50"
            >
              {isSigningInProgress ? "WAITING..." : "SIGN IN"}
            </button>
            <button
              onClick={() => {
                setShowMobileSignPrompt(false)
                hasTriggeredAuth.current = false
              }}
              disabled={isSigningInProgress}
              className="flex-1 py-1.5 text-xs font-bold rounded-sm border border-border text-muted-foreground disabled:opacity-50"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}
    </>
  )
}
