"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { usePathname } from "next/navigation"
import { useUserStats } from "@/hooks/use-leaderboard"

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

  // Share the TanStack Query cache with useAchievements and the profile page.
  // All three use the same ['user-stats', address] key, so only one HTTP request
  // is made on mount regardless of how many components call this data.
  const { data: userData, isLoading: isUserLoading } = useUserStats(isConnected && address ? address : "")

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
        // Wait for the shared TanStack Query to resolve before reading the status
        if (isUserLoading) return

        // User is connected - read onboarding status from shared query cache
        const dbCompleted = userData?.data
          ? (userData.data as any).onboarding_completed_at != null
          : false

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
  }, [address, isConnected, pathname, isUserLoading, userData])

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
