/**
 * WAGMI CORE CONFIG — lightweight, loaded synchronously.
 *
 * Only the WagmiAdapter and wagmiConfig live here.
 * createAppKit() (the wallet modal UI) is deferred to appkit-modal.ts
 * and initialized after first paint via Web3Provider's useEffect.
 */

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { base, baseSepolia, mainnet } from "@reown/appkit/networks"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"
import { http } from "wagmi"

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// Networks for wagmi adapter (all supported chains including testnets)
export const networks = [base, baseSepolia] as const

// Networks for AppKit modal.
// Always includes base mainnet so social login (MPC embedded wallet) can
// initialise — Reown's MPC service doesn't support testnets, so mainnet
// must be present and set as defaultNetwork in createAppKit().
// When NEXT_PUBLIC_DEFAULT_CHAIN_ID=84532 we also include baseSepolia so
// AppKit recognises wallets already on Sepolia and shows it as a selectable
// network, without breaking social login (defaultNetwork stays base mainnet).
const configuredChainId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || "8453", 10)
export const appKitNetworks = (
  configuredChainId === 84532 ? [base, baseSepolia] : [base]
) as [typeof base, typeof baseSepolia] | [typeof base]

const baseSepoliaRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"
const baseMainnetRpcUrl = process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || "https://mainnet.base.org"

// Include Ethereum mainnet in the adapter so wagmi recognises chain 1.
// Many wallets default to mainnet — without it wagmi throws "connector
// chain does not match" and blocks switchChain / signMessage entirely.
// Mainnet is NOT in the exported `networks` so it won't appear in the
// AppKit modal; users are auto-switched to Base after connecting.
export const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia, mainnet],
  projectId,
  // ssr: true is intentionally NOT set — the official Reown example does not use it,
  // and pairing it with cookieToInitialState in WagmiProvider is required when enabled.
  // Without cookieToInitialState, wagmi writes a state cookie server-side but the
  // client never reads it, causing extra reconnection cycles on every page load.
  connectors: [
    farcasterMiniApp(),
    // Coinbase Wallet is NOT added here — Reown AppKit discovers it
    // automatically via its modal. Adding it explicitly caused wagmi's
    // auto-reconnect to redirect users to keys.coinbase.com on page load,
    // even when they weren't logged in.
  ],
  transports: {
    [base.id]: http(baseMainnetRpcUrl),
    [baseSepolia.id]: http(baseSepoliaRpcUrl),
    [mainnet.id]: http(),
  },
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

// ---------- Config validation (runs once at import time) ----------
// Uses console.warn so logs survive Next.js removeConsole stripping in production.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn('[wagmi-core] config loaded', {
    projectId: projectId ? `${projectId.slice(0, 6)}…` : '⚠️ MISSING',
    networks: networks.map(n => `${n.name} (${n.id})`),
    baseMainnetRpc: baseMainnetRpcUrl,
    baseSepoliaRpc: baseSepoliaRpcUrl,
    connectors: wagmiConfig.connectors.map(c => c.name),
  })
}
