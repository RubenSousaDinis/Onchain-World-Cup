"use client"

import { useEffect, useState } from "react"
import { Wallet, Bell } from "lucide-react"
import { useFarcaster } from "@/lib/farcaster-provider"
import { SupporterBadge } from "./supporter-badge"
import { ShareButton } from "./share-button"

export function AddAppCTA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isFrameContext, sdkReady } = useFarcaster()

  useEffect(() => {
    // Check installation status from localStorage
    const installed = localStorage.getItem('miniapp-installed')
    const notifs = localStorage.getItem('notifications-enabled')

    setIsInstalled(!!installed)
    setNotificationsEnabled(!!notifs)
  }, [])

  const handleAddApp = async () => {
    if (!sdkReady) return

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
    if (!sdkReady) return

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

  // Not in Farcaster context - prompt to open in Warpcast
  if (!isFrameContext) {
    return (
      <div className="cm-panel p-6 text-center">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-accent" />
        <h3 className="text-xl font-bold mb-2">Open in Farcaster</h3>
        <p className="text-muted-foreground mb-4">
          Get notified when qualification opens
        </p>
        <a
          href="https://warpcast.com/~/add-cast-action?url=https://app.onchainworldcup.xyz"
          className="cm-nav-tab inline-block px-6 py-3"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Warpcast
        </a>
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
          disabled={isLoading || !sdkReady}
          className="cm-nav-tab px-6 py-3 w-full md:w-auto disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Add to Farcaster"}
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
