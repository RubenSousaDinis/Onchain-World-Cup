"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { saveReferrer, getReferrer } from "@/lib/referral"

export function useReferral() {
  const searchParams = useSearchParams()
  const [referrerAddress, setReferrerAddress] = useState<`0x${string}` | undefined>(undefined)

  useEffect(() => {
    // Capture ?ref= param from URL and persist to localStorage
    const refParam = searchParams?.get("ref")
    if (refParam && /^0x[0-9a-fA-F]{40}$/.test(refParam)) {
      saveReferrer(refParam)
    }

    // Read the persisted referrer
    const stored = getReferrer()
    setReferrerAddress(stored)
  }, [searchParams])

  return { referrerAddress }
}
