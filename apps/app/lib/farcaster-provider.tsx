"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
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

  useEffect(() => {
    // Check if we're in a Farcaster Mini App context
    const checkFarcasterContext = async () => {
      try {
        // Detect if running in Farcaster context
        const isInFarcaster =
          typeof window !== "undefined" &&
          ((window as unknown as { ethereum?: { isFarcaster?: boolean }; farcaster?: unknown }).ethereum?.isFarcaster ||
            (window as unknown as { ethereum?: { isFarcaster?: boolean }; farcaster?: unknown }).farcaster ||
            navigator.userAgent.includes("Warpcast") ||
            navigator.userAgent.includes("Farcaster"))

        // Always log detection result for debugging
        console.log("[FarcasterProvider] Context detection:", {
          isInFarcaster,
          connectors: connectors.length,
          isConnected,
          userAgent: navigator.userAgent.substring(0, 50)
        })

        if (DEBUG) {
          console.log("[Farcaster] Detection:", { isInFarcaster, userAgent: navigator.userAgent })
        }

        if (isInFarcaster) {
          // Initialize Farcaster Frame SDK
          try {
            const sdk = await import("@farcaster/frame-sdk")

            // Note: ready() is already called in FarcasterReady component
            // Fetch user context data from SDK
            const sdkContext = await sdk.context

            if (DEBUG) {
              console.log("[Farcaster] SDK initialized with context:", sdkContext)
            }

            // Extract user info from SDK context
            const userInfo = sdkContext?.user
            const fid = userInfo?.fid
            const username = userInfo?.username
            const displayName = userInfo?.displayName
            const pfpUrl = userInfo?.pfpUrl

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

            // Auto-connect wallet if in Farcaster and not already connected
            if (!isConnected) {
              // Check if connectors are available yet
              if (connectors.length === 0) {
                console.log("[FarcasterProvider] No connectors available yet, will retry when connectors load")
                setContext((prev) => ({ ...prev, isAutoConnecting: true }))
                return
              }

              // In Farcaster, the embedded wallet appears as an injected provider
              // Priority: injected (Farcaster embedded wallet) > Coinbase Wallet
              const injectedConnector = connectors.find((c) => c.type === "injected")
              const coinbaseConnector = connectors.find((c) => c.name === "Coinbase Wallet")
              const connectorToUse = injectedConnector || coinbaseConnector

              // Always log wallet connection attempt
              console.log("[FarcasterProvider] Wallet auto-connect attempt:", {
                isConnected,
                connectorCount: connectors.length,
                connectors: connectors.map(c => ({ name: c.name, type: c.type })),
                injectedFound: !!injectedConnector,
                coinbaseFound: !!coinbaseConnector,
                willUse: connectorToUse?.name
              })

              if (connectorToUse) {
                try {
                  console.log("[FarcasterProvider] Calling connect() with:", connectorToUse.name)
                  await connect({ connector: connectorToUse })
                  console.log("[FarcasterProvider] Wallet connected successfully using:", connectorToUse.name)
                  setContext((prev) => ({ ...prev, isAutoConnecting: false }))
                } catch (error) {
                  console.error("[FarcasterProvider] Auto-connect failed:", error)
                  console.log("[FarcasterProvider] Available connectors after error:", connectors.map(c => ({ name: c.name, type: c.type })))
                  setContext((prev) => ({
                    ...prev,
                    isAutoConnecting: false,
                    error: `Wallet auto-connect failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                  }))
                }
              } else {
                console.warn("[FarcasterProvider] No suitable wallet connector found. Available:", connectors.map(c => ({ name: c.name, type: c.type })))
                setContext((prev) => ({
                  ...prev,
                  isAutoConnecting: false,
                  error: 'No wallet connector available',
                }))
              }
            } else {
              // Already connected
              console.log("[FarcasterProvider] Wallet already connected, skipping auto-connect")
              setContext((prev) => ({ ...prev, isAutoConnecting: false }))
            }
          } catch (sdkError) {
            console.error("[Farcaster] SDK initialization failed:", sdkError)
            setContext({
              isFrameContext: true,
              isFarcasterMiniApp: false,
              isAutoConnecting: false,
              sdkReady: false,
              error: sdkError instanceof Error ? sdkError.message : "SDK initialization failed",
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
  }, [connect, connectors, isConnected])

  return <FarcasterContext.Provider value={context}>{children}</FarcasterContext.Provider>
}
