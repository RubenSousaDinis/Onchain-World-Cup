"use client"

import { useEffect, useState } from "react"
import { Wallet, Bell } from "lucide-react"
import { SupporterBadge } from "./supporter-badge"
import { ShareButton } from "./share-button"

export function AddAppCTA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inFarcaster, setInFarcaster] = useState<boolean | null>(null)

  useEffect(() => {
    // Check installation status from localStorage
    const installed = localStorage.getItem('miniapp-installed')
    const notifs = localStorage.getItem('notifications-enabled')

    setIsInstalled(!!installed)
    setNotificationsEnabled(!!notifs)

    // Detect Farcaster context using SDK
    const detectFarcasterContext = async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk")

        // Try to get context - if this succeeds, we're in Farcaster
        const context = await sdk.context
        const isInFrame = !!context

        console.log("[AddAppCTA] Farcaster context detected:", isInFrame, context)
        setInFarcaster(isInFrame)
      } catch (error) {
        // Not in Farcaster context
        console.log("[AddAppCTA] Not in Farcaster context:", error)
        setInFarcaster(false)
      }
    }

    detectFarcasterContext()
  }, [])

  const handleAddApp = async () => {
    setIsLoading(true)
    try {
      const { sdk } = await import("@farcaster/miniapp-sdk")

      // Add the mini app to Farcaster
      await sdk.actions.addMiniApp()

      localStorage.setItem('miniapp-installed', 'true')
      setIsInstalled(true)

      // After installation, request notifications
      setTimeout(() => {
        handleEnableNotifications()
      }, 500)
    } catch (error) {
      console.error('Failed to add app:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      // For now, just mark as enabled in localStorage
      // Real notification implementation requires backend setup
      localStorage.setItem('notifications-enabled', 'true')
      setNotificationsEnabled(true)
    } catch (error) {
      console.error('Failed to enable notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while detecting Farcaster context
  if (inFarcaster === null) {
    return (
      <div className="cm-panel p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 animate-pulse bg-primary/20 rounded-full" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Not in Farcaster context - show alternative message
  if (!inFarcaster) {
    return (
      <div className="cm-panel p-6 text-center">
        <Bell className="w-12 h-12 mx-auto mb-4 text-accent" />
        <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
        <p className="text-muted-foreground mb-4">
          Login to get started with voting when qualification opens
        </p>
      </div>
    )
  }

  // App installed and notifications enabled - show success state
  if (isInstalled && notificationsEnabled) {
    return (
      <div className="cm-panel p-6 text-center border-2 border-accent">
        <SupporterBadge type="founding" />
        <p className="text-sm text-muted-foreground mt-4 mb-4">
          You'll be notified when qualification opens
        </p>
        <ShareButton messageKey="appAdded" />
      </div>
    )
  }

  // App not installed or notifications not enabled
  return (
    <div className="cm-panel p-6 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">
          {!isInstalled ? "Add App & Get Notified" : "Enable Notifications"}
        </h3>
        <p className="text-muted-foreground mb-4">
          Be first to know when qualification opens
        </p>
      </div>

      {!isInstalled ? (
        <button
          onClick={handleAddApp}
          disabled={isLoading}
          className="cm-nav-tab px-6 py-3 w-full md:w-auto disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Save App"}
        </button>
      ) : (
        <button
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="cm-nav-tab px-6 py-3 w-full md:w-auto disabled:opacity-50"
        >
          {isLoading ? "Enabling..." : "Enable Notifications"}
        </button>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Early supporters get founding badges
      </p>
    </div>
  )
}
