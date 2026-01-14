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
  isAutoConnecting: boolean
  sdkReady: boolean
}

const FarcasterContext = createContext<FarcasterContextType>({
  isFrameContext: false,
  isFarcasterMiniApp: false,
  isAutoConnecting: false,
  sdkReady: false,
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
          ((window as any).ethereum?.isFarcaster ||
            (window as any).farcaster ||
            navigator.userAgent.includes("Warpcast") ||
            navigator.userAgent.includes("Farcaster"))

        if (DEBUG) {
          console.log("[Farcaster] Detection:", { isInFarcaster, userAgent: navigator.userAgent })
        }

        if (isInFarcaster) {
          // Initialize Farcaster Mini App SDK
          try {
            const { sdk } = await import("@farcaster/miniapp-sdk")

            // Notify SDK that app is ready (prevents infinite splash screen)
            await sdk.actions.ready()

            if (DEBUG) {
              console.log("[Farcaster] SDK initialized and ready() called")
            }

            setContext({
              isFrameContext: true,
              isFarcasterMiniApp: true,
              isAutoConnecting: true,
              sdkReady: true,
            })

            // Auto-connect wallet if in Farcaster and not already connected
            if (!isConnected) {
              // Prefer Coinbase Wallet for Farcaster
              const coinbaseConnector = connectors.find((c) => c.name === "Coinbase Wallet")
              if (coinbaseConnector) {
                try {
                  await connect({ connector: coinbaseConnector })
                  if (DEBUG) {
                    console.log("[Farcaster] Wallet auto-connected")
                  }
                  setContext((prev) => ({ ...prev, isAutoConnecting: false }))
                } catch (error) {
                  if (DEBUG) {
                    console.log("[Farcaster] Auto-connect failed:", error)
                  }
                  setContext((prev) => ({ ...prev, isAutoConnecting: false }))
                }
              } else {
                setContext((prev) => ({ ...prev, isAutoConnecting: false }))
              }
            } else {
              setContext((prev) => ({ ...prev, isAutoConnecting: false }))
            }
          } catch (sdkError) {
            console.error("[Farcaster] SDK initialization failed:", sdkError)
            setContext({
              isFrameContext: true,
              isFarcasterMiniApp: false,
              isAutoConnecting: false,
              sdkReady: false,
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
          })
        }
      } catch (error) {
        console.error("[Farcaster] Context check failed:", error)
        setContext({
          isFrameContext: false,
          isFarcasterMiniApp: false,
          isAutoConnecting: false,
          sdkReady: false,
        })
      }
    }

    checkFarcasterContext()
  }, [connect, connectors, isConnected])

  return <FarcasterContext.Provider value={context}>{children}</FarcasterContext.Provider>
}
