"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { WagmiProvider, useReconnect, type Config } from "wagmi"
import { cookieToInitialState } from "@wagmi/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiAdapter } from "@/lib/wallet/wagmi-core"

// Static import so createAppKit() runs synchronously when this module is parsed
// on the client — matching the official Reown next-wagmi-app-router example.
// This gives the w3m-iframe maximum time to reach READY before any user interaction.
import "@/lib/wallet/appkit-modal"

/**
 * Triggers wagmi's reconnect on mount so connectors like baseAccount can
 * auto-detect their environment (e.g. Base App in-app browser) and connect.
 * Without this, baseAccount is registered but never activated on first visit.
 */
function WagmiAutoReconnect() {
  const { reconnect } = useReconnect()
  useEffect(() => {
    reconnect()
  }, [])
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
        <WagmiAutoReconnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
