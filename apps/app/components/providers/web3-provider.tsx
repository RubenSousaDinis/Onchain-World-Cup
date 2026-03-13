"use client"

import type React from "react"
import { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { reconnect } from "@wagmi/core"
import { wagmiConfig } from "@/lib/wallet/wagmi-core"

/**
 * Kick off AppKit initialisation immediately when this module is parsed on
 * the client. The dynamic import keeps the heavy Reown bundle out of the
 * critical JS path (LCP unaffected), but starting it at module-eval time —
 * rather than inside a useEffect — gives the w3m-iframe (secure.walletconnect.org)
 * the maximum possible time to load and fire @w3m-frame/READY before the user
 * clicks a social login button. Without this head-start the iframe often isn't
 * ready yet, causing social login to hang forever.
 */
if (typeof window !== "undefined") {
  import("@/lib/wallet/appkit-modal").then(({ initAppKit }) => initAppKit())
}

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
 * 3. Post-mount     — reconnect() runs in useEffect, safely outside the render phase.
 *                     AppKit is already initialising from the module-level import above.
 */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Restore any previously connected wallet (deferred to avoid setState-
    // during-render; replaces the synchronous reconnectOnMount behavior).
    reconnect(wagmiConfig)
  }, [])

  return <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>{children}</WagmiProvider>
}
