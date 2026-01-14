"use client"

import { Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="cm-nav-tab px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        <span>CONNECT WALLET</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => disconnect()}
      className="bg-accent text-accent-foreground px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      <div className="flex flex-col items-start">
        <div className="text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <div className="text-[10px] opacity-70">{chain?.name || "Connected"}</div>
      </div>
    </button>
  )
}
