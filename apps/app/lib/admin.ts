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
