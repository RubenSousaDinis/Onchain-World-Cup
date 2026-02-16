"use client"

import type React from "react"

import { WagmiProvider } from "wagmi"
import { config } from "@/lib/reown-config"

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  )
}
