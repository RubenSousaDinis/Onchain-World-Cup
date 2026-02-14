"use client"

import { LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface DisconnectConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DisconnectConfirmModal({ isOpen, onConfirm, onCancel }: DisconnectConfirmModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />

      {/* Modal */}
      <div className="relative cm-panel rounded-sm p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <LogOut className="w-6 h-6 text-destructive" />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-1">Disconnect Wallet</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to disconnect your wallet?
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 cm-nav-tab px-4 py-2 rounded-sm text-sm font-bold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-sm text-sm font-bold hover:bg-destructive/90 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
