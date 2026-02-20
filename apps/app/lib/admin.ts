/**
 * Admin utilities for wallet-based authorization
 */

export function getAdminAddresses(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES || ""
  return raw
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminAddress(address: string | undefined): boolean {
  if (!address) return false
  return getAdminAddresses().includes(address.toLowerCase())
}

/**
 * Get the BaseScan explorer base URL for a given chain ID
 */
export function getExplorerUrl(chainId: number): string {
  return chainId === 8453
    ? "https://basescan.org"
    : "https://sepolia.basescan.org"
}

/**
 * Get a full BaseScan link to an address
 */
export function getAddressExplorerUrl(chainId: number, address: string): string {
  return `${getExplorerUrl(chainId)}/address/${address}`
}

/**
 * Get a full BaseScan link to a transaction
 */
export function getTxExplorerUrl(chainId: number, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`
}
