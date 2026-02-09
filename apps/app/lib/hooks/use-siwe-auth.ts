"use client"

import { useAccount, useSignMessage, useSwitchChain } from "wagmi"
import { signIn, signOut, useSession } from "next-auth/react"
import { SiweMessage } from "siwe"
import { useState } from "react"
import { useFarcaster } from "@/lib/farcaster-provider"
import { getDefaultChainId, getDefaultChain } from "@/lib/chain-config"

/**
 * Custom hook for unified authentication (SIWE + SIWF)
 * - Uses SIWF (Sign in with Farcaster) when in Farcaster Mini App
 * - Uses SIWE (Sign in with Ethereum) for regular web
 *
 * Usage:
 * ```tsx
 * const { login, logout, isAuthenticated, isLoading, session } = useSIWEAuth()
 *
 * // Check if user is authenticated
 * if (!isAuthenticated) {
 *   await login()
 * }
 * ```
 */
export function useSIWEAuth() {
  const { address, chain } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { switchChain } = useSwitchChain()
  const { data: session, status } = useSession()
  const { isFarcasterMiniApp, fid, displayName, pfpUrl } = useFarcaster()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const defaultChainId = getDefaultChainId()
  const defaultChain = getDefaultChain()

  /**
   * Farcaster authentication using SIWF
   */
  const loginWithFarcaster = async () => {
    console.log("[Farcaster Auth] Starting SIWF authentication...")
    console.log("[Farcaster Auth] FID:", fid)

    try {
      // Import Farcaster SDK dynamically
      const { sdk } = await import("@farcaster/miniapp-sdk")

      // Fetch nonce from server
      console.log("[Farcaster Auth] Fetching nonce from /api/auth/nonce...")
      const nonceResponse = await fetch("/api/auth/nonce")
      const nonceData = await nonceResponse.json()
      console.log("[Farcaster Auth] Nonce response:", nonceData)
      const { nonce } = nonceData

      console.log("[Farcaster Auth] Nonce received, requesting signature from user...")

      // Request signature from Farcaster
      const { signature, message } = await sdk.actions.signIn({
        nonce,
        acceptAuthAddress: true, // Accept auth addresses for better UX
      })

      console.log("[Farcaster Auth] Signature received:", signature.slice(0, 20) + "...")
      console.log("[Farcaster Auth] Message:", message)
      console.log("[Farcaster Auth] Profile data from context:", {
        displayName,
        pfpUrl: pfpUrl ? pfpUrl.substring(0, 50) + '...' : undefined,
        fid
      })
      console.log("[Farcaster Auth] Calling signIn with credentials...")

      // Authenticate with next-auth using Farcaster credentials
      // Only include fields that have actual values (not undefined) to avoid NextAuth serialization issues
      const credentials: Record<string, any> = {
        message,
        signature,
        authType: "farcaster",
        redirect: false,
      }

      if (fid) {
        credentials.fid = fid.toString()
      }

      if (displayName) {
        credentials.farcasterDisplayName = displayName
      }

      if (pfpUrl) {
        credentials.farcasterPfpUrl = pfpUrl
      }

      console.log("[Farcaster Auth] Credentials to send:", {
        authType: credentials.authType,
        fid: credentials.fid,
        farcasterDisplayName: credentials.farcasterDisplayName,
        farcasterPfpUrl: credentials.farcasterPfpUrl ? credentials.farcasterPfpUrl.substring(0, 50) + '...' : undefined,
        hasDisplayName: !!credentials.farcasterDisplayName,
        hasPfpUrl: !!credentials.farcasterPfpUrl,
      })

      const result = await signIn("credentials", credentials)

      console.log("[Farcaster Auth] signIn result:", result)

      if (result?.error) {
        console.error("[Farcaster Auth] signIn returned error:", result.error)
        throw new Error(result.error)
      }

      if (!result?.ok) {
        console.error("[Farcaster Auth] signIn returned NOT OK:", result)
        throw new Error("Sign in failed")
      }

      console.log("[Farcaster Auth] Login successful for FID:", fid)
      return result
    } catch (error) {
      // Handle user rejection specifically
      if (error && typeof error === "object" && "name" in error && error.name === "RejectedByUser") {
        console.log("[Farcaster Auth] User rejected sign-in request")
        throw new Error("User rejected the sign-in request")
      }
      console.error("[Farcaster Auth] Login failed:", error)
      throw error
    }
  }

  /**
   * Standard SIWE authentication for web
   */
  const loginWithSIWE = async () => {
    console.log("[SIWE Auth] Starting SIWE authentication...")
    console.log("[SIWE Auth] Wallet state:", { address, chainId: chain?.id, defaultChainId })

    if (!address) {
      const error = "Wallet not connected"
      console.error("[SIWE Auth] Error:", error)
      throw new Error(error)
    }

    // Check if user is on the correct chain, if not, switch them
    if (chain?.id !== defaultChainId) {
      console.log(`[SIWE Auth] Wrong chain detected (${chain?.id}), switching to ${defaultChainId}...`)
      try {
        await switchChain({ chainId: defaultChainId })
        console.log(`[SIWE Auth] Successfully switched to chain ${defaultChainId}`)
        // Give the wallet a moment to update
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error("[SIWE Auth] Failed to switch chain:", error)
        throw new Error(`Please switch your wallet to ${defaultChain.name} to continue`)
      }
    }

    // Fetch nonce from server
    console.log("[SIWE Auth] Fetching nonce from /api/auth/nonce...")
    const nonceResponse = await fetch("/api/auth/nonce")
    const nonceData = await nonceResponse.json()
    console.log("[SIWE Auth] Nonce response:", nonceData)
    const { nonce } = nonceData

    // Create SIWE message with default chain ID
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in to Onchain World Cup with your wallet",
      uri: window.location.origin,
      version: "1",
      chainId: defaultChainId, // Use default chain ID for consistency
      nonce,
    })

    console.log("[SIWE Auth] SIWE message created:", {
      domain: message.domain,
      address: message.address,
      uri: message.uri,
      chainId: message.chainId,
    })
    console.log("[SIWE Auth] Requesting signature from wallet...")

    // Sign message with wallet
    const signature = await signMessageAsync({
      message: message.prepareMessage(),
    })

    console.log("[SIWE Auth] Signature received:", signature.slice(0, 20) + "...")
    console.log("[SIWE Auth] Calling signIn with credentials...")

    // Authenticate with next-auth
    const result = await signIn("credentials", {
      message: JSON.stringify(message),
      signature,
      authType: "siwe",
      redirect: false,
    })

    console.log("[SIWE Auth] signIn result:", result)

    if (result?.error) {
      console.error("[SIWE Auth] signIn returned error:", result.error)
      throw new Error(result.error)
    }

    if (!result?.ok) {
      console.error("[SIWE Auth] signIn returned NOT OK:", result)
      throw new Error("Sign in failed")
    }

    console.log("[SIWE Auth] Login successful for:", address)
    return result
  }

  /**
   * Unified login method that chooses the right authentication method
   */
  const login = async () => {
    console.log("[useSIWEAuth] login() called, state:", {
      address,
      chain: chain?.id,
      isFarcasterMiniApp,
      fid,
      isLoggingIn
    })

    setIsLoggingIn(true)
    try {
      // Choose authentication method based on context
      if (isFarcasterMiniApp && fid) {
        console.log("[Auth] Using Farcaster authentication (SIWF)")
        return await loginWithFarcaster()
      } else {
        console.log("[Auth] Using wallet authentication (SIWE)")
        return await loginWithSIWE()
      }
    } catch (error) {
      console.error("[Auth] Login failed:", error)
      throw error
    } finally {
      setIsLoggingIn(false)
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      console.log("[Auth] Logout successful")
    } catch (error) {
      console.error("[Auth] Logout failed:", error)
      throw error
    }
  }

  return {
    login,
    logout,
    session,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || isLoggingIn,
    walletAddress: session?.user?.walletAddress,
    authMethod: isFarcasterMiniApp ? "farcaster" : "siwe",
    defaultChainId,
    defaultChain,
    switchChain,
  }
}
