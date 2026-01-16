"use client"

import { Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useNotifications } from "@/components/notifications"
import { useEffect, useState } from "react"

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { success, error, info } = useNotifications()
  const [hasShownConnectedNotification, setHasShownConnectedNotification] = useState(false)

  // Show notification when wallet connects successfully
  useEffect(() => {
    if (isConnected && address && !hasShownConnectedNotification) {
      success("Wallet Connected", `Connected to ${chain?.name || "network"}`)
      setHasShownConnectedNotification(true)
    }
    if (!isConnected) {
      setHasShownConnectedNotification(false)
    }
  }, [isConnected, address, chain, success, hasShownConnectedNotification])

  // Show notification when connection fails
  useEffect(() => {
    if (connectError) {
      const errorMessage = connectError.message || "Unable to connect wallet"

      // Provide more helpful error messages
      if (errorMessage.includes("Provider not found")) {
        error(
          "No Wallet Found",
          "Please install MetaMask, Coinbase Wallet, or another Web3 wallet to continue"
        )
      } else if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
        info("Connection Cancelled", "Wallet connection was cancelled")
      } else {
        error("Connection Failed", errorMessage)
      }
    }
  }, [connectError, error, info])

  const handleConnect = () => {
    if (connectors.length === 0) {
      error("No Wallet Available", "Please install a Web3 wallet like MetaMask or Coinbase Wallet")
      return
    }

    // Try to find the best connector to use
    // Priority: Coinbase Wallet > Injected (MetaMask, etc.) > WalletConnect
    const coinbaseConnector = connectors.find((c) => c.name.toLowerCase().includes("coinbase"))
    const injectedConnector = connectors.find((c) => c.type === "injected")
    const preferredConnector = coinbaseConnector || injectedConnector || connectors[0]

    info("Connecting Wallet", "Please approve the connection request...")
    connect({ connector: preferredConnector })
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
