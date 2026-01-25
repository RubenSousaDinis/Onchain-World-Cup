/**
 * DESKTOP WALLET CONFIGURATION
 *
 * This configuration is used when the app runs in a standard web browser (desktop/mobile web).
 * Supports multiple wallet options through Reown AppKit:
 * - MetaMask
 * - Coinbase Wallet
 * - WalletConnect
 * - Rainbow Wallet
 * - And 300+ more wallets
 */

import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { base, baseSepolia } from "@reown/appkit/networks"

// Environment configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""
const isProduction = process.env.NODE_ENV === "production"
const defaultChain = isProduction ? base : baseSepolia

if (!projectId) {
  console.warn("[Desktop Wallet] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set")
}

console.log("[Desktop Wallet] Initializing desktop wallet configuration")

/**
 * Wagmi adapter for Reown AppKit
 * Handles wallet connection and blockchain interactions
 */
export const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  ssr: true,
})

/**
 * Reown AppKit Modal
 * Provides the wallet connection UI for desktop users
 */
export const desktopWalletModal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base, baseSepolia],
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
    email: false, // Disable email login for now
    socials: false, // Disable social logins for now
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "hsl(142.1 76.2% 36.3%)", // Primary green color
    "--w3m-border-radius-master": "2px", // Retro squared corners
  },
  allowUnsupportedChain: false,
})

/**
 * Wagmi configuration
 * Used by wagmi hooks throughout the app
 */
export const wagmiConfig = wagmiAdapter.wagmiConfig

console.log("[Desktop Wallet] Desktop wallet configuration initialized")
