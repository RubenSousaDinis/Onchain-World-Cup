import { createConfig, http, fallback } from "wagmi"
import { base, baseSepolia, mainnet } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

import { coinbaseWallet } from "wagmi/connectors"

// RPC configuration with retry logic to prevent excessive failed requests
const httpConfig = {
  // Reduce retries to prevent thousands of failed requests on rate limits
  retryCount: 1,
  // Exponential backoff: 1s, 2s, 4s...
  retryDelay: ({ count, error }: { count: number; error: any }) => {
    // If we get a 429 rate limit error, wait longer before retrying
    if (error && 'status' in error && error.status === 429) {
      return 5000 // Wait 5 seconds on rate limit
    }
    return ~~(1 << count) * 1000 // Exponential backoff: 2^count seconds
  },
  // Timeout after 10 seconds
  timeout: 10_000,
}

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "Crypto World Cup 2026",
      preference: "smartWalletOnly",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    // Use fallback transports with multiple RPC endpoints for resilience
    [base.id]: fallback([
      http(process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org', httpConfig),
      http('https://base.llamarpc.com', httpConfig),
      http('https://base.publicnode.com', httpConfig),
    ]),
    [baseSepolia.id]: fallback([
      http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org', httpConfig),
      http('https://base-sepolia.publicnode.com', httpConfig),
      http('https://base-sepolia.blockpi.network/v1/rpc/public', httpConfig),
    ]),
    // Mainnet is included only for ENS name resolution — not used for voting
    [mainnet.id]: fallback([
      http(process.env.NEXT_PUBLIC_ETH_MAINNET_RPC_URL || 'https://ethereum.publicnode.com', httpConfig),
      http('https://eth.llamarpc.com', httpConfig),
    ]),
  },
  ssr: true,
})
