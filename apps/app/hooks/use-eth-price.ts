"use client"

import { useState, useEffect } from "react"

let cachedPrice: number | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number | null>(cachedPrice)

  useEffect(() => {
    const now = Date.now()
    if (cachedPrice && now - cacheTimestamp < CACHE_TTL_MS) {
      setEthPrice(cachedPrice)
      return
    }

    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then((r) => r.json())
      .then((data) => {
        const price = data?.ethereum?.usd
        if (price) {
          cachedPrice = price
          cacheTimestamp = Date.now()
          setEthPrice(price)
        }
      })
      .catch(() => {
        // silently fail — USD display is best-effort
      })
  }, [])

  return ethPrice
}

/**
 * Format ETH amount with USD equivalent in parentheses.
 * Returns null if ethPrice is not yet available.
 * Example: ethToUsd(0.001, 2400) → "~$2.40"
 */
export function ethToUsd(eth: number, ethPrice: number | null): string | null {
  if (!ethPrice || !eth) return null
  const usd = eth * ethPrice
  if (usd < 0.01) return "<$0.01"
  return `~$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
