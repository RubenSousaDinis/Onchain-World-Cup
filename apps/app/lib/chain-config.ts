/**
 * Chain configuration utilities
 * Provides default chain ID and chain-related helper functions
 */

import { base } from "wagmi/chains"

/**
 * Get the default chain ID (always Base mainnet)
 */
export function getDefaultChainId(): number {
  return 8453
}

/**
 * Get the default chain object
 */
export function getDefaultChain() {
  return base
}

/**
 * Check if a given chain ID is the default/preferred chain
 */
export function isDefaultChain(chainId: number | undefined): boolean {
  if (!chainId) return false
  return chainId === 8453
}

/**
 * Get human-readable network name
 */
export function getNetworkName(chainId: number | undefined): string {
  if (!chainId) return "Unknown"
  switch (chainId) {
    case 8453:
      return "Base"
    default:
      return `Chain ${chainId}`
  }
}
