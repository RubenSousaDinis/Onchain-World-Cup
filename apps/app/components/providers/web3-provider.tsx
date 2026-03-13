"use client"

import type React from "react"
import { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { reconnect } from "@wagmi/core"
import { wagmiConfig } from "@/lib/wallet/wagmi-core"

/**
 * Web3Provider — three-phase loading strategy:
 *
 * 1. Static shell   — server renders HTML immediately (no wagmi needed)
 * 2. Hydration      — WagmiProvider mounts with lightweight wagmiConfig.
 *                     reconnectOnMount={false} prevents wagmi's internal
 *                     Hydrate component from calling setState synchronously
 *                     during React's render phase, which would trigger the
 *                     "Cannot update a component while rendering a different
 *                     component" warning in AutoAuthProvider.
 * 3. Post-mount     — reconnect() + AppKit modal init run in useEffect,
 *                     safely outside the render phase.
 */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Restore any previously connected wallet (deferred to avoid setState-
    // during-render; replaces the synchronous reconnectOnMount behavior).
    reconnect(wagmiConfig)

    // Dynamically import the heavy AppKit bundle after first paint.
    // This keeps wagmi/reown out of the critical JS path.
    import("@/lib/wallet/appkit-modal").then(({ initAppKit }) => {
      initAppKit()
    })
  }, [])

  return <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>{children}</WagmiProvider>
}
