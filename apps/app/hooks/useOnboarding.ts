"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"

const ONBOARDING_KEY = "onboardingCompleted"

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

  // Fetch onboarding status from database
  const fetchOnboardingStatus = async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/users/${walletAddress}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      const { data } = await response.json()
      // If timestamp exists (not null), onboarding is completed
      return data?.onboarding_completed_at != null
    } catch (error) {
      console.error("Error fetching onboarding status:", error)
      // Fall back to localStorage on error
      return localStorage.getItem(ONBOARDING_KEY) === "true"
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
        const completed = await fetchOnboardingStatus(address)
        setHasCompletedOnboarding(completed)

        // Auto-show onboarding for first-time users
        if (!completed) {
          const timer = setTimeout(() => {
            setIsOnboardingOpen(true)
          }, 500)
          setIsLoading(false)
          return () => clearTimeout(timer)
        }
      } else {
        // User not connected - check localStorage
        if (typeof window !== "undefined") {
          const completed = localStorage.getItem(ONBOARDING_KEY) === "true"
          setHasCompletedOnboarding(completed)

          // Auto-show onboarding for first-time users
          if (!completed) {
            const timer = setTimeout(() => {
              setIsOnboardingOpen(true)
            }, 500)
            setIsLoading(false)
            return () => clearTimeout(timer)
          }
        }
      }

      setIsLoading(false)
    }

    checkOnboardingStatus()
  }, [address, isConnected])

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
