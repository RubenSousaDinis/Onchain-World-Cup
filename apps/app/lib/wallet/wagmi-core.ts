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

// Only Base chains are shown in the AppKit wallet modal
export const networks = [base, baseSepolia] as const

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
  ssr: true,
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
