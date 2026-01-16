"use client"

import { Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useNotifications } from "@/components/notifications"
import { useEffect } from "react"

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { success, error, info } = useNotifications()

  // Show notification when wallet connects successfully
  useEffect(() => {
    if (isConnected && address) {
      success("Wallet Connected", `Connected to ${chain?.name || "network"}`)
    }
  }, [isConnected, address, chain, success])

  // Show notification when connection fails
  useEffect(() => {
    if (connectError) {
      error("Connection Failed", connectError.message || "Unable to connect wallet")
    }
  }, [connectError, error])

  const handleConnect = () => {
    info("Connecting Wallet", "Please approve the connection request...")
    connect({ connector: connectors[0] })
  }

  const handleDisconnect = () => {
    disconnect()
    info("Wallet Disconnected", "You can reconnect anytime to place votes")
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="cm-nav-tab px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        <span>CONNECT WALLET</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleDisconnect}
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
