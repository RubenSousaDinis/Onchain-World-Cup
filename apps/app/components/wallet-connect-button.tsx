"use client"

import { Wallet } from "lucide-react"
import { useAccount, useDisconnect } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { useNotifications } from "@/components/notifications"
import { useEffect, useState } from "react"
import { useFarcaster } from "@/lib/farcaster-provider"
import { DisconnectConfirmModal } from "@/components/disconnect-confirm-modal"

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { success, info } = useNotifications()
  const { isFrameContext } = useFarcaster()
  const [hasShownConnectedNotification, setHasShownConnectedNotification] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

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

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = () => {
    disconnect()
    info("Wallet Disconnected", "You can reconnect anytime to place votes")
    setShowDisconnectConfirm(false)
  }

  // Don't show connect button in Farcaster - wallet should be auto-connected
  if (!isConnected) {
    if (isFrameContext) {
      return null
    }

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
    <>
      <button
        onClick={() => !isFrameContext && setShowDisconnectConfirm(true)}
        disabled={isFrameContext}
        className="bg-accent text-accent-foreground px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2 disabled:opacity-70"
      >
        <Wallet className="w-4 h-4" />
        <div className="flex flex-col items-start">
          <div className="text-xs">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="text-xs opacity-70">{chain?.name || "Connected"}</div>
        </div>
      </button>
      <DisconnectConfirmModal
        isOpen={showDisconnectConfirm}
        onConfirm={handleDisconnect}
        onCancel={() => setShowDisconnectConfirm(false)}
      />
    </>
  )
}
