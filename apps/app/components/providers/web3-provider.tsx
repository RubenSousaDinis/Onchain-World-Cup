"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { WagmiProvider, useConnect, useAccount, type Config } from "wagmi"
import { cookieToInitialState } from "@wagmi/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiAdapter } from "@/lib/wallet/wagmi-core"

// Static import so createAppKit() runs synchronously when this module is parsed
// on the client — matching the official Reown next-wagmi-app-router example.
// This gives the w3m-iframe maximum time to reach READY before any user interaction.
import "@/lib/wallet/appkit-modal"

/**
 * Silently connects the wallet when running inside the Base App's in-app browser.
 *
 * `reconnect()` was tried first but causes an AppKit state mismatch: wagmi
 * connects via baseAccount, but AppKit's internal state still says "disconnected".
 * When AppKit finishes its async init it overwrites wagmi — hence the
 * "connects for an instant then disconnects" symptom.
 *
 * Using `connect({ connector })` goes through AppKit's WagmiAdapter layer,
 * so both AppKit and wagmi state are updated together.
 */
function BaseAppAutoConnect() {
  const { connect, connectors } = useConnect()
  const { isConnected, status } = useAccount()

  useEffect(() => {
    if (isConnected || status === "connecting" || status === "reconnecting") return
    if (typeof window === "undefined") return

    // Coinbase Wallet / Base App injects window.ethereum with isCoinbaseWallet=true
    const eth = (window as any).ethereum
    if (!eth?.isCoinbaseWallet) return

    // baseAccount from wagmi uses CoinbaseWalletSDK — its connector ID is "coinbaseWalletSDK"
    const connector = connectors.find((c) => c.id === "coinbaseWalletSDK")
    if (!connector) return

    console.log("[BaseAppAutoConnect] Base App detected, connecting via", connector.id)
    connect({ connector })
  }, [connect, connectors, isConnected, status])

  return null
}

export function Web3Provider({ children, cookies }: { children: React.ReactNode; cookies: string | null }) {
  // useRef ensures each client session gets its own QueryClient instance
  // rather than sharing a module-level singleton across SSR requests.
  const queryClientRef = useRef<QueryClient | null>(null)
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          retry: 2,
          refetchOnWindowFocus: process.env.NODE_ENV === "production",
          refetchOnMount: false,
        },
        mutations: { retry: 1 },
      },
    })
  }

  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClientRef.current}>
        <BaseAppAutoConnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
