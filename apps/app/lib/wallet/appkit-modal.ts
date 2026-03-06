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

// Always default to Base mainnet — AppKit's embedded wallet (email login) requires
// a mainnet chain to set up the MPC wallet. Using baseSepolia as the default causes
// the embedded wallet creation to hang after OTP verification.
const defaultChain = base

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
      // Must be a registered HTTPS domain in the Reown project dashboard.
      // Reown checks the HTTP Origin header (localhost/prod) against allowed domains —
      // both http://localhost:3101 and https://app.onchainworldcup.xyz must be added there.
      url: process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz",
      icons: ["https://app.onchainworldcup.xyz/logo.jpg"],
    },
    features: {
      analytics: true,
      email: true,
      // google removed: accounts.google.com sets COOP: same-origin which breaks
      // the popup's window.opener reference — AppKit cannot detect popup close.
      socials: ['apple', 'github', 'x'],
      onramp: true,
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
