/**
 * WALLET CONFIGURATION
 *
 * Supports both Farcaster Mini App and desktop/mobile web contexts:
 * - Farcaster: Uses @farcaster/miniapp-wagmi-connector (wraps SDK's ethProvider)
 * - Desktop: Reown AppKit with MetaMask, Coinbase Wallet, WalletConnect, etc.
 */

import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { base, baseSepolia } from "@reown/appkit/networks"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"

// Environment configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""
const isProduction = process.env.NODE_ENV === "production"
const defaultChain = isProduction ? base : baseSepolia

if (!projectId) {
  console.warn("[Desktop Wallet] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set")
}

console.log("[Wallet Config] Initializing wallet configuration")

/**
 * Wagmi adapter for Reown AppKit
 * Includes Farcaster Mini App connector for in-app wallet access
 */
export const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  ssr: true,
  connectors: [farcasterMiniApp()],
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

console.log("[Wallet Config] Wallet configuration initialized")
