"use client"

import { useAccount } from "wagmi"
import { isAdminAddress } from "@/lib/admin"
import { modal } from "@/lib/reown-config"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()

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

  return <>{children}</>
}
