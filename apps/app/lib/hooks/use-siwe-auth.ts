"use client"

import { useAccount, useSwitchChain } from "wagmi"
import { getAddress } from "viem"
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
  const { address, chain, connector } = useAccount()
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
    // eslint-disable-next-line no-console
    console.warn("[SIWE Auth] Starting SIWE authentication...", { address, chainId: chain?.id, defaultChainId, connectorId: connector?.id, connectorType: connector?.type })

    if (!address) {
      const error = "Wallet not connected"
      console.error("[SIWE Auth] Error:", error)
      throw new Error(error)
    }

    // NOTE: We intentionally do NOT switch chains here. SIWE uses personal_sign
    // which is chain-agnostic — the wallet can be on any chain (including mainnet)
    // to sign the auth message. Chain enforcement for voting is handled separately
    // in the vote modal's handleVote function.
    if (chain?.id !== defaultChainId) {
      console.log(`[SIWE Auth] Wallet on chain ${chain?.id} (default: ${defaultChainId}) — proceeding with sign-in without switching`)
    }

    // Fetch nonce from server
    // eslint-disable-next-line no-console
    console.warn("[SIWE Auth] Fetching nonce from /api/auth/nonce...")
    const nonceResponse = await fetch("/api/auth/nonce")
    const nonceData = await nonceResponse.json()
    // eslint-disable-next-line no-console
    console.warn("[SIWE Auth] Nonce response:", nonceData)
    const { nonce } = nonceData

    // Create SIWE message with default chain ID
    // Use checksummed address (EIP-55) - some wallets return lowercase addresses
    // but the SIWE library requires checksummed format for verification
    const checksummedAddress = getAddress(address)
    const message = new SiweMessage({
      domain: window.location.host,
      address: checksummedAddress,
      statement: "Sign in to Onchain World Cup with your wallet",
      uri: window.location.origin,
      version: "1",
      chainId: defaultChainId, // Use default chain ID for consistency
      nonce,
    })

    // eslint-disable-next-line no-console
    console.warn("[SIWE Auth] Requesting personal_sign from connector:", { connectorId: connector?.id, connectorType: connector?.type, address: message.address, chainId: message.chainId })

    // Sign directly via the connector's provider using personal_sign.
    // We bypass wagmi's signMessageAsync because it calls getConnectorClient
    // which throws "connector chain does not match" when the wallet is on a
    // chain (e.g. mainnet) that differs from wagmi's expected chain.
    // personal_sign is chain-agnostic so this is safe.
    if (!connector) {
      throw new Error("No wallet connector available")
    }

    const rawMessage = message.prepareMessage()
    let signature: string

    try {
      const provider = await connector.getProvider() as { request: (args: { method: string; params: unknown[] }) => Promise<string> }
      signature = await provider.request({
        method: "personal_sign",
        params: [rawMessage, address],
      })
    } catch (providerError: unknown) {
      const errMsg = providerError instanceof Error ? providerError.message : String(providerError)

      // WalletConnect sessions can go stale after page reload — the provider
      // throws "Please call connect() before request()". Re-establish the
      // session and retry.
      if (errMsg.includes("connect()") || errMsg.includes("session")) {
        console.warn("[SIWE Auth] Provider session stale, reconnecting connector...", errMsg)
        await connector.connect({ chainId: chain?.id ?? defaultChainId })
        const freshProvider = await connector.getProvider() as { request: (args: { method: string; params: unknown[] }) => Promise<string> }
        signature = await freshProvider.request({
          method: "personal_sign",
          params: [rawMessage, address],
        })
      } else {
        throw providerError
      }
    }

    // eslint-disable-next-line no-console
    console.warn("[SIWE Auth] Signature received, calling next-auth signIn...")

    // Authenticate with next-auth
    const result = await signIn("credentials", {
      message: JSON.stringify(message),
      signature,
      authType: "siwe",
      redirect: false,
    })

    // eslint-disable-next-line no-console
    console.warn("[SIWE Auth] signIn result:", result)

    if (result?.error) {
      console.error("[SIWE Auth] signIn returned error:", result.error)
      throw new Error(result.error)
    }

    if (!result?.ok) {
      console.error("[SIWE Auth] signIn returned NOT OK:", result)
      throw new Error("Sign in failed")
    }

    // eslint-disable-next-line no-console
    console.warn("[SIWE Auth] Login successful for:", address)
    return result
  }

  /**
   * Unified login method that chooses the right authentication method
   */
  const login = async () => {
    // eslint-disable-next-line no-console
    console.warn("[useSIWEAuth] login() called, state:", {
      address,
      chain: chain?.id,
      connectorId: connector?.id,
      connectorType: connector?.type,
      connectorName: connector?.name,
      isFarcasterMiniApp,
      fid,
      isLoggingIn,
    })

    setIsLoggingIn(true)
    try {
      // Choose authentication method based on context
      if (isFarcasterMiniApp && fid) {
        // eslint-disable-next-line no-console
        console.warn("[Auth] Using Farcaster authentication (SIWF)")
        return await loginWithFarcaster()
      } else {
        // eslint-disable-next-line no-console
        console.warn("[Auth] Using wallet authentication (SIWE)")
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
