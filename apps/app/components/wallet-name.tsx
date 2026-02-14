"use client"

import { useEnsName } from "wagmi"
import { toCoinType } from "viem"
import { mainnet, base } from "wagmi/chains"

interface WalletNameProps {
  address: string
  farcasterName?: string | null
  className?: string
}

/**
 * Displays the best available name for a wallet address.
 * Priority: Farcaster name → ENS (Base L2 primary) → ENS (L1 primary) → truncated address
 *
 * Per ENS docs, resolution always starts from L1 but coinType specifies
 * which chain's primary name to look up. We try Base first, then L1 fallback.
 * ENS results are cached for 1 hour.
 */
export function WalletName({ address, farcasterName, className }: WalletNameProps) {
  const skip = !!farcasterName || !address

  // 1. Try Base L2 primary name
  const { data: baseEnsName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    coinType: toCoinType(base.id),
    query: {
      enabled: !skip,
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
    },
  })

  // 2. Fall back to L1 primary name if no Base name found
  const { data: l1EnsName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: !skip && !baseEnsName,
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
    },
  })

  const name = farcasterName || baseEnsName || l1EnsName || `${address.slice(0, 6)}...${address.slice(-4)}`

  return <span className={className}>{name}</span>
}

/**
 * Returns the resolved display name and whether it differs from the raw address.
 * Tries Base L2 primary name first, then L1 primary name as fallback.
 */
export function useWalletDisplayName(address: string | undefined, farcasterName?: string | null) {
  const skip = !!farcasterName || !address

  const { data: baseEnsName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    coinType: toCoinType(base.id),
    query: {
      enabled: !skip,
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
    },
  })

  const { data: l1EnsName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: !skip && !baseEnsName,
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
    },
  })

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""
  const resolvedName = farcasterName || baseEnsName || l1EnsName || null

  return { resolvedName, shortAddress, hasName: !!resolvedName }
}
