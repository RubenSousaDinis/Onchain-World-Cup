"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useConnect, useAccount } from "wagmi"

interface FarcasterContext {
  isFrameContext: boolean
  fid?: number
  username?: string
  isAutoConnecting: boolean
}

const FarcasterContext = createContext<FarcasterContext>({
  isFrameContext: false,
  isAutoConnecting: false,
})

export function useFarcaster() {
  return useContext(FarcasterContext)
}

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FarcasterContext>({
    isFrameContext: false,
    isAutoConnecting: false,
  })
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    // Check if we're in a Farcaster frame context
    const checkFarcasterContext = async () => {
      try {
        const isFrame =
          typeof window !== "undefined" &&
          ((window as any).ethereum?.isFarcaster ||
            (window as any).farcaster ||
            // Check if running in Warpcast or Farcaster client
            navigator.userAgent.includes("Warpcast") ||
            navigator.userAgent.includes("Farcaster"))

        console.log("[v0] Farcaster detection:", { isFrame, userAgent: navigator.userAgent })

        if (isFrame) {
          setContext({
            isFrameContext: true,
            isAutoConnecting: true,
          })

          // Auto-connect if in Farcaster and not already connected
          if (!isConnected) {
            // Try to connect with Coinbase Wallet (preferred for Farcaster)
            const coinbaseConnector = connectors.find((c) => c.name === "Coinbase Wallet")
            if (coinbaseConnector) {
              try {
                await connect({ connector: coinbaseConnector })
                setContext((prev) => ({ ...prev, isAutoConnecting: false }))
              } catch (error) {
                console.log("[v0] Farcaster auto-connect failed:", error)
                setContext((prev) => ({ ...prev, isAutoConnecting: false }))
              }
            }
          } else {
            setContext((prev) => ({ ...prev, isAutoConnecting: false }))
          }
        } else {
          setContext({
            isFrameContext: false,
            isAutoConnecting: false,
          })
        }
      } catch (error) {
        console.log("[v0] Farcaster context check failed:", error)
        setContext({ isFrameContext: false, isAutoConnecting: false })
      }
    }

    checkFarcasterContext()
  }, [connect, connectors, isConnected])

  return <FarcasterContext.Provider value={context}>{children}</FarcasterContext.Provider>
}
