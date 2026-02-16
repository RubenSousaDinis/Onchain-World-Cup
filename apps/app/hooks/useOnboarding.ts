"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { usePathname } from "next/navigation"

const ONBOARDING_KEY = "onboardingCompleted"
const ONBOARDING_SESSION_KEY = "onboardingShownThisSession"

/**
 * Hook to manage onboarding state
 * Checks if user has completed onboarding and provides controls to show/hide it
 * Uses database for connected wallets, localStorage for guests
 */
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true) // Default to true to avoid flash
  const [isLoading, setIsLoading] = useState(true)
  const { address, isConnected } = useAccount()
  const pathname = usePathname()

  // Fetch onboarding status from database
  const fetchOnboardingStatus = async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/users/${walletAddress}`, {
        cache: 'no-store',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.warn('[Onboarding] Failed to fetch user data:', errorData)
        // Fall back to localStorage on error
        return typeof window !== "undefined" ? localStorage.getItem(ONBOARDING_KEY) === "true" : false
      }
      const { data } = await response.json()
      // If timestamp exists (not null), onboarding is completed
      return data?.onboarding_completed_at != null
    } catch (error) {
      console.warn('[Onboarding] Network error fetching onboarding status, using localStorage fallback')
      // Fall back to localStorage on error
      return typeof window !== "undefined" ? localStorage.getItem(ONBOARDING_KEY) === "true" : false
    }
  }

  // Update onboarding status in database
  const updateOnboardingStatus = async (walletAddress: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/users/${walletAddress}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onboarding_completed: completed,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update onboarding status")
      }

      return true
    } catch (error) {
      console.error("Error updating onboarding status:", error)
      return false
    }
  }

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setIsLoading(true)

      if (isConnected && address) {
        // User is connected - check database
        const dbCompleted = await fetchOnboardingStatus(address)

        // Migration: If database says not completed, check localStorage
        if (!dbCompleted && typeof window !== "undefined") {
          const localCompleted = localStorage.getItem(ONBOARDING_KEY) === "true"

          if (localCompleted) {
            // Migrate localStorage state to database
            console.log("Migrating onboarding status from localStorage to database for", address)
            await updateOnboardingStatus(address, true)
            setHasCompletedOnboarding(true)

            // Clear localStorage after successful migration
            localStorage.removeItem(ONBOARDING_KEY)
            setIsLoading(false)
            return
          }
        }

        setHasCompletedOnboarding(dbCompleted)

        // Auto-show onboarding for first-time users (only on homepage, once per session)
        if (!dbCompleted) {
          if (pathname === "/" && !sessionStorage.getItem(ONBOARDING_SESSION_KEY)) {
            sessionStorage.setItem(ONBOARDING_SESSION_KEY, "true")
            const timer = setTimeout(() => {
              setIsOnboardingOpen(true)
            }, 500)
            setIsLoading(false)
            return () => clearTimeout(timer)
          }
          setIsLoading(false)
          return
        }
      } else {
        // User not connected - check localStorage
        if (typeof window !== "undefined") {
          const completed = localStorage.getItem(ONBOARDING_KEY) === "true"
          setHasCompletedOnboarding(completed)

          // Auto-show onboarding for first-time users (only on homepage, once per session)
          if (!completed) {
            if (pathname === "/" && !sessionStorage.getItem(ONBOARDING_SESSION_KEY)) {
              sessionStorage.setItem(ONBOARDING_SESSION_KEY, "true")
              const timer = setTimeout(() => {
                setIsOnboardingOpen(true)
              }, 500)
              setIsLoading(false)
              return () => clearTimeout(timer)
            }
            setIsLoading(false)
            return
          }
        }
      }

      setIsLoading(false)
    }

    checkOnboardingStatus()
  }, [address, isConnected, pathname])

  const showOnboarding = () => {
    setIsOnboardingOpen(true)
  }

  const hideOnboarding = async () => {
    setIsOnboardingOpen(false)
    setHasCompletedOnboarding(true)

    // Save to database if connected, otherwise localStorage
    if (isConnected && address) {
      await updateOnboardingStatus(address, true)
    } else if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true")
    }
  }

  const resetOnboarding = async () => {
    setHasCompletedOnboarding(false)
    setIsOnboardingOpen(true)

    // Clear from database if connected, otherwise localStorage
    if (isConnected && address) {
      await updateOnboardingStatus(address, false)
    } else if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_KEY)
    }
  }

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    isLoading,
    showOnboarding,
    hideOnboarding,
    resetOnboarding,
  }
}
