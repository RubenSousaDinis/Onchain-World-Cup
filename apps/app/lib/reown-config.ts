import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from '@reown/appkit/networks'

// Get projectId from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

// Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  ssr: true,
})

// Create AppKit modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base, baseSepolia],
  projectId,
  metadata: {
    name: 'Onchain World Cup',
    description: 'Vote on World Cup 2026 matches with ETH on Base network',
    url: process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://app.onchainworldcup.xyz',
    icons: ['https://app.onchainworldcup.xyz/logo.png'],
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(142.1 76.2% 36.3%)', // Primary green color
    '--w3m-border-radius-master': '2px', // Retro squared corners
  },
})

export const config = wagmiAdapter.wagmiConfig
