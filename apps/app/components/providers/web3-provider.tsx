"use client"

import type React from "react"
import { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { wagmiConfig } from "@/lib/wallet/wagmi-core"

/**
 * Web3Provider — three-phase loading strategy:
 *
 * 1. Static shell   — server renders HTML immediately (no wagmi needed)
 * 2. Hydration      — WagmiProvider mounts with lightweight wagmiConfig
 * 3. Load web3      — AppKit modal (Reown/WalletConnect/MetaMask bundle)
 *                     initialises in useEffect, AFTER first paint.
 *                     The wallet UI is only needed when the user clicks
 *                     Connect Wallet — by then it's always ready.
 */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Dynamically import the heavy AppKit bundle after first paint.
    // This keeps wagmi/reown out of the critical JS path.
    import("@/lib/wallet/appkit-modal").then(({ initAppKit }) => {
      initAppKit()
    })
  }, [])

  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
}
