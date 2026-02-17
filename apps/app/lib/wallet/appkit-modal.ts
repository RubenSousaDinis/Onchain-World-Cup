/**
 * APPKIT MODAL — deferred, loaded after first paint.
 *
 * createAppKit() brings in the Reown/WalletConnect/MetaMask bundle.
 * It is NOT imported at layout load time. It initialises lazily in
 * Web3Provider's useEffect, so the wallet UI never blocks the LCP render.
 *
 * Components call `modal.open()` (from reown-config.ts) which awaits
 * this initialisation automatically, so callers need no changes.
 */

import { createAppKit } from "@reown/appkit/react"
import { base, baseSepolia } from "@reown/appkit/networks"
import { wagmiAdapter, projectId, networks } from "./wagmi-core"

const isProduction = process.env.NODE_ENV === "production"
const defaultChain = isProduction ? base : baseSepolia

let _modal: ReturnType<typeof createAppKit> | null = null

export function initAppKit(): ReturnType<typeof createAppKit> {
  if (_modal) return _modal

  _modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [...networks],
    defaultNetwork: defaultChain,
    projectId,
    metadata: {
      name: "Onchain World Cup",
      description: "Vote on World Cup 2026 matches with ETH on Base network",
      url: process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz",
      icons: ["https://app.onchainworldcup.xyz/logo.png"],
    },
    features: {
      analytics: true,
      email: false,
      socials: false,
    },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "hsl(142.1 76.2% 36.3%)",
      "--w3m-border-radius-master": "2px",
    },
    allowUnsupportedChain: false,
  })

  return _modal
}
