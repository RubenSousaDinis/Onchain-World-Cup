"use client"

import { useEnsName } from "wagmi"
import { mainnet } from "wagmi/chains"

interface WalletNameProps {
  address: string
  farcasterName?: string | null
  className?: string
}

/**
 * Displays the best available name for a wallet address.
 * Priority: Farcaster name → ENS domain → truncated address
 *
 * ENS is only resolved when there is no Farcaster name, to avoid
 * unnecessary RPC calls. Results are cached for 1 hour.
 */
export function WalletName({ address, farcasterName, className }: WalletNameProps) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: !!address && !farcasterName,
      staleTime: 60 * 60 * 1000,  // 1 hour — ENS names rarely change
      gcTime: 24 * 60 * 60 * 1000, // keep in cache for 24 hours
      retry: 1,
    },
  })

  const name = farcasterName || ensName || `${address.slice(0, 6)}...${address.slice(-4)}`

  return <span className={className}>{name}</span>
}

/**
 * Returns the resolved display name and whether it differs from the raw address.
 * Useful when the parent needs to conditionally render sub-text (e.g. leaderboard rows).
 */
export function useWalletDisplayName(address: string | undefined, farcasterName?: string | null) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: !!address && !farcasterName,
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
    },
  })

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""
  const resolvedName = farcasterName || ensName || null

  return { resolvedName, shortAddress, hasName: !!resolvedName }
}
