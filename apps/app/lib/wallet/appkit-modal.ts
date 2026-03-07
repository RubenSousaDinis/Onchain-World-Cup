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
import { base } from "@reown/appkit/networks"
import { wagmiAdapter, projectId, appKitNetworks } from "./wagmi-core"

let _modal: ReturnType<typeof createAppKit> | null = null

export function initAppKit(): ReturnType<typeof createAppKit> {
  if (_modal) return _modal

  // Clear any persisted AppKit network selection from localStorage.
  // AppKit persists the last-used network and restores it on next visit,
  // overriding defaultNetwork. If the user previously selected Base Sepolia,
  // social login would hang because the embedded wallet (MPC) doesn't support
  // testnets. Clearing this forces AppKit to use defaultNetwork (Base mainnet).
  if (typeof window !== 'undefined') {
    try {
      const keysToCheck = ['@appkit/active_caip_network', '@w3m/active_caip_network']
      for (const key of keysToCheck) {
        const stored = localStorage.getItem(key)
        if (stored && stored.includes('84532')) {
          localStorage.removeItem(key)
          // eslint-disable-next-line no-console
          console.warn('[AppKit] cleared persisted testnet network to prevent social login hang')
        }
      }
    } catch {
      // localStorage may be unavailable (SSR, iframe restrictions)
    }
  }

  _modal = createAppKit({
    adapters: [wagmiAdapter],
    // Only mainnet chains — Reown's embedded wallet (social/email login) requires
    // a mainnet chain for MPC wallet creation. Testnets cause it to hang forever.
    // Base Sepolia is still available via wagmiAdapter for regular wallet connections.
    networks: [...appKitNetworks],
    defaultNetwork: base,
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
      socials: ['google', 'apple', 'github', 'x'],
      onramp: true,
    },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "hsl(142.1 76.2% 36.3%)",
      "--w3m-border-radius-master": "2px",
    },
    // Allow wallets connected on Base Sepolia (testnet) without forcing a
    // network switch prompt. Testnet users can still interact via wagmi.
    allowUnsupportedChain: true,
  })

  // ---------- Config validation ----------
  // eslint-disable-next-line no-console
  console.warn('[AppKit] initialized', {
    projectId: projectId ? `${projectId.slice(0, 6)}…` : '⚠️ MISSING',
    defaultNetwork: `${base.name} (${base.id})`,
    modalNetworks: appKitNetworks.map(n => `${n.name} (${n.id})`),
    url: process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://app.onchainworldcup.xyz',
    features: { email: true, socials: ['google', 'apple', 'github', 'x'], onramp: true },
  })

  // Subscribe to AppKit events and state for debugging email/social login issues.
  // Uses console.warn so logs survive Next.js removeConsole stripping in production.
  _modal.subscribeEvents((event) => {
    // eslint-disable-next-line no-console
    console.warn('[AppKit event]', event.data.event, event.data)
  })
  _modal.subscribeState((state) => {
    // eslint-disable-next-line no-console
    console.warn('[AppKit state]', state)
  })

  return _modal
}
