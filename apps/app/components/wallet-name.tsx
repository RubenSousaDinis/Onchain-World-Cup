"use client"

interface WalletNameProps {
  address: string
  farcasterName?: string | null
  ensName?: string | null
  className?: string
}

/**
 * Displays the best available name for a wallet address.
 * Priority: Farcaster name → ENS name (from DB) → truncated address
 *
 * ENS names are resolved server-side when a user first votes and stored in the DB.
 */
export function WalletName({ address, farcasterName, ensName, className }: WalletNameProps) {
  const name = farcasterName || ensName || `${address.slice(0, 6)}...${address.slice(-4)}`
  return <span className={className}>{name}</span>
}

/**
 * Returns the resolved display name and whether it differs from the raw address.
 */
export function useWalletDisplayName(
  address: string | undefined,
  farcasterName?: string | null,
  ensName?: string | null,
) {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""
  const resolvedName = farcasterName || ensName || null
  return { resolvedName, shortAddress, hasName: !!resolvedName }
}
