"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { useConnect, useAccount } from "wagmi"

// Debug logging - only enable in development
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true"

interface FarcasterContextType {
  isFrameContext: boolean
  isFarcasterMiniApp: boolean
  fid?: number
  username?: string
  displayName?: string
  pfpUrl?: string
  isAutoConnecting: boolean
  sdkReady: boolean
  error?: string
  isLoading: boolean
}

const FarcasterContext = createContext<FarcasterContextType>({
  isFrameContext: false,
  isFarcasterMiniApp: false,
  isAutoConnecting: false,
  sdkReady: false,
  isLoading: true,
})

export function useFarcaster() {
  return useContext(FarcasterContext)
}

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FarcasterContextType>({
    isFrameContext: false,
    isFarcasterMiniApp: false,
    isAutoConnecting: false,
    sdkReady: false,
    isLoading: true,
  })

  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()
  const autoConnectAttempted = useRef(false)

  useEffect(() => {
    // Check if we're in a Farcaster Mini App context
    const checkFarcasterContext = async () => {
      try {
        // Use SDK context API for reliable detection (same method as AddAppCTA)
        let isInFarcaster = false
        let sdkContext = null

        try {
          const { sdk } = await import("@farcaster/miniapp-sdk")
          sdkContext = await sdk.context
          isInFarcaster = !!sdkContext
        } catch {
          // SDK not available or context failed - not in Farcaster
          isInFarcaster = false
        }

        // Always log detection result for debugging
        console.log("[FarcasterProvider] Context detection:", {
          isInFarcaster,
          hasContext: !!sdkContext,
          userAgent: navigator.userAgent.substring(0, 50)
        })

        if (DEBUG) {
          console.log("[Farcaster] Detection:", { isInFarcaster, sdkContext })
        }

        if (isInFarcaster && sdkContext) {
          // We're in Farcaster and have SDK context
          console.log("[FarcasterProvider] ✅ Farcaster context detected! Initializing...")

          try {
            if (DEBUG) {
              console.log("[Farcaster] SDK initialized with context:", sdkContext)
            }

            // Extract user info from SDK context
            const userInfo = sdkContext?.user
            const fid = userInfo?.fid
            const username = userInfo?.username
            const displayName = userInfo?.displayName
            const pfpUrl = userInfo?.pfpUrl

            console.log("[FarcasterProvider] User info extracted:", { fid, username, displayName, pfpUrl })

            if (DEBUG) {
              console.log("[Farcaster] User info:", { fid, username, displayName, pfpUrl })
            }

            setContext({
              isFrameContext: true,
              isFarcasterMiniApp: true,
              fid,
              username,
              displayName,
              pfpUrl,
              isAutoConnecting: true,
              sdkReady: true,
              isLoading: false,
            })

            console.log("[FarcasterProvider] Farcaster setup complete. Auto-connecting wallet...")
          } catch (walletError) {
            console.error("[FarcasterProvider] Error in Farcaster initialization:", walletError)
            setContext({
              isFrameContext: true,
              isFarcasterMiniApp: true,
              isAutoConnecting: false,
              sdkReady: true,
              error: walletError instanceof Error ? walletError.message : "Initialization error",
              isLoading: false,
            })
          }
        } else {
          // Standalone Base app (not in Farcaster)
          if (DEBUG) {
            console.log("[Farcaster] Running as standalone Base app")
          }
          setContext({
            isFrameContext: false,
            isFarcasterMiniApp: false,
            isAutoConnecting: false,
            sdkReady: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("[Farcaster] Context check failed:", error)
        setContext({
          isFrameContext: false,
          isFarcasterMiniApp: false,
          isAutoConnecting: false,
          sdkReady: false,
          error: error instanceof Error ? error.message : "Context check failed",
          isLoading: false,
        })
      }
    }

    checkFarcasterContext()
  }, []) // Run once on mount

  // Auto-connect wallet when in Farcaster context
  useEffect(() => {
    if (
      context.isFrameContext &&
      context.sdkReady &&
      !isConnected &&
      !autoConnectAttempted.current
    ) {
      autoConnectAttempted.current = true
      console.log("[FarcasterProvider] Auto-connecting wallet via injected connector...")

      const connector = connectors.find((c) => c.type === "injected")
      if (connector) {
        connect(
          { connector },
          {
            onSuccess: () => {
              console.log("[FarcasterProvider] Wallet auto-connected successfully!")
              setContext((prev) => ({ ...prev, isAutoConnecting: false }))
            },
            onError: (err) => {
              console.error("[FarcasterProvider] Wallet auto-connect failed:", err)
              setContext((prev) => ({ ...prev, isAutoConnecting: false }))
            },
          }
        )
      } else {
        console.warn("[FarcasterProvider] No injected connector found for auto-connect")
        setContext((prev) => ({ ...prev, isAutoConnecting: false }))
      }
    }
  }, [context.isFrameContext, context.sdkReady, isConnected, connect, connectors])

  // Clear isAutoConnecting when wallet connects
  useEffect(() => {
    if (isConnected && context.isAutoConnecting) {
      console.log("[FarcasterProvider] Wallet connected - clearing auto-connecting state")
      setContext((prev) => ({ ...prev, isAutoConnecting: false }))
    }
  }, [isConnected, context.isAutoConnecting])

  return <FarcasterContext.Provider value={context}>{children}</FarcasterContext.Provider>
}
