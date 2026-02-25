"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { isAdminAddress } from "@/lib/admin"
import { modal } from "@/lib/reown-config"
import { useSIWEAuth } from "@/lib/hooks/use-siwe-auth"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { isAuthenticated, isLoading, login } = useSIWEAuth()
  const [isSigning, setIsSigning] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  if (!isConnected || !address) {
    return (
      <div className="cm-panel max-w-md mx-auto mt-20 text-center">
        <h2 className="cm-section-header mb-4">Admin Access</h2>
        <p className="text-muted-foreground mb-6">Connect your admin wallet to continue.</p>
        <button
          onClick={() => modal.open()}
          className="cm-highlight px-6 py-2 font-semibold"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  if (!isAdminAddress(address)) {
    return (
      <div className="cm-panel max-w-md mx-auto mt-20 text-center">
        <h2 className="cm-section-header mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-2">
          Wallet <code className="text-xs break-all">{address}</code> is not authorized.
        </p>
        <p className="text-muted-foreground text-sm">
          Connect with an admin wallet to access the dashboard.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="cm-panel max-w-md mx-auto mt-20 text-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    const handleSign = async () => {
      setIsSigning(true)
      setSignError(null)
      try {
        await login()
      } catch (err) {
        const msg = err instanceof Error ? err.message : JSON.stringify(err)
        if (!msg.includes("rejected") && !msg.includes("denied")) {
          setSignError(msg)
        }
      } finally {
        setIsSigning(false)
      }
    }

    return (
      <div className="cm-panel max-w-md mx-auto mt-20 text-center">
        <h2 className="cm-section-header mb-4">Admin Access</h2>
        <p className="text-muted-foreground mb-6">
          Sign in with your wallet to access the admin dashboard.
        </p>
        <button
          onClick={handleSign}
          disabled={isSigning}
          className="cm-highlight px-6 py-2 font-semibold disabled:opacity-50"
        >
          {isSigning ? "Waiting for signature..." : "Sign In with Wallet"}
        </button>
        {signError && (
          <p className="text-red-500 text-sm mt-4">{signError}</p>
        )}
      </div>
    )
  }

  return <>{children}</>
}
