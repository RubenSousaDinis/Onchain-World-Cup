"use client"

import { useQuery } from "@tanstack/react-query"

interface WalletNameProps {
  address: string
  farcasterName?: string | null
  className?: string
}

async function fetchEnsName(address: string): Promise<string | null> {
  const res = await fetch(`/api/ens/${address}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.name ?? null
}

/**
 * Displays the best available name for a wallet address.
 * Priority: Farcaster name → ENS (Base L2 primary) → ENS (L1 primary) → truncated address
 *
 * ENS resolution is done server-side to avoid browser rate-limiting.
 * Results are cached for 1 hour.
 */
export function WalletName({ address, farcasterName, className }: WalletNameProps) {
  const { data: ensName } = useQuery({
    queryKey: ["ens", address],
    queryFn: () => fetchEnsName(address),
    enabled: !!address && !farcasterName,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  const name = farcasterName || ensName || `${address.slice(0, 6)}...${address.slice(-4)}`

  return <span className={className}>{name}</span>
}

/**
 * Returns the resolved display name and whether it differs from the raw address.
 * ENS resolution is done server-side to avoid browser rate-limiting.
 */
export function useWalletDisplayName(address: string | undefined, farcasterName?: string | null) {
  const { data: ensName } = useQuery({
    queryKey: ["ens", address],
    queryFn: () => fetchEnsName(address!),
    enabled: !!address && !farcasterName,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""
  const resolvedName = farcasterName || ensName || null

  return { resolvedName, shortAddress, hasName: !!resolvedName }
}
