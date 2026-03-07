/**
 * Chain configuration utilities
 * Provides default chain ID and chain-related helper functions
 */

import { base, baseSepolia } from "wagmi/chains"

/**
 * Get the default chain ID from environment variable
 * Falls back to Base Sepolia (84532) if not set
 */
export function getDefaultChainId(): number {
  const envChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID
  if (envChainId) {
    const parsed = parseInt(envChainId, 10)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  // Default to Base mainnet
  return 8453
}

/**
 * Get the default chain object based on the default chain ID
 */
export function getDefaultChain() {
  const chainId = getDefaultChainId()
  return chainId === 8453 ? base : baseSepolia
}

/**
 * Check if a given chain ID is the default/preferred chain
 */
export function isDefaultChain(chainId: number | undefined): boolean {
  if (!chainId) return false
  return chainId === getDefaultChainId()
}

/**
 * Get human-readable network name
 */
export function getNetworkName(chainId: number | undefined): string {
  if (!chainId) return "Unknown"
  switch (chainId) {
    case 84532:
      return "Base Sepolia"
    case 8453:
      return "Base"
    default:
      return `Chain ${chainId}`
  }
}
