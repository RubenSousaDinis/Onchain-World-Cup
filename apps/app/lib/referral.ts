const REFERRAL_KEY = "owc_referrer"

function isValidAddress(addr: string): addr is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

export function saveReferrer(address: string): void {
  if (typeof window === "undefined") return
  if (!isValidAddress(address)) return
  try {
    localStorage.setItem(REFERRAL_KEY, address.toLowerCase())
  } catch {
    // localStorage may be unavailable
  }
}

export function getReferrer(): `0x${string}` | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const stored = localStorage.getItem(REFERRAL_KEY)
    if (stored && isValidAddress(stored)) {
      return stored as `0x${string}`
    }
  } catch {
    // localStorage may be unavailable
  }
  return undefined
}

export function clearReferrer(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(REFERRAL_KEY)
  } catch {
    // localStorage may be unavailable
  }
}
