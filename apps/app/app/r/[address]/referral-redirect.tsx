"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function ReferralRedirect({ address }: { address: string }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/?ref=${address}`)
  }, [address, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  )
}
