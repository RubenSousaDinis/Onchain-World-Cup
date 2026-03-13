"use client"

import type React from "react"
import { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { reconnect } from "@wagmi/core"
import { wagmiConfig } from "@/lib/wallet/wagmi-core"

// Static import so createAppKit() runs synchronously when this module is parsed
// on the client — matching the official Reown next-wagmi-app-router example.
// This gives the w3m-iframe maximum time to reach READY before any user interaction.
import "@/lib/wallet/appkit-modal"

export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Restore any previously connected wallet (deferred to avoid setState-
    // during-render; replaces the synchronous reconnectOnMount behavior).
    reconnect(wagmiConfig)
  }, [])

  return <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>{children}</WagmiProvider>
}
