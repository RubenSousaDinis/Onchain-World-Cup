"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useUserStats } from "@/hooks/use-leaderboard"

const ONBOARDING_KEY = "onboardingCompleted"

export interface OnboardingCountry {
  name: string
  flag: string
}

/**
 * Hook to manage onboarding state.
 * Does NOT auto-trigger — callers invoke showOnboarding() explicitly
 * (e.g. on a user's first vote attempt).
 */
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true) // Default true to avoid flash
  const [onboardingCountry, setOnboardingCountry] = useState<OnboardingCountry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address, isConnected } = useAccount()

  const { data: userData, isLoading: isUserLoading } = useUserStats(isConnected && address ? address : "")

  const updateOnboardingStatus = async (walletAddress: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/users/${walletAddress}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_completed: completed }),
      })
      return response.ok
    } catch (error) {
      console.error("Error updating onboarding status:", error)
      return false
    }
  }

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setIsLoading(true)

      if (isConnected && address) {
        if (isUserLoading) return

        const dbCompleted = userData?.data
          ? (userData.data as any).onboarding_completed_at != null
          : false

        // Migration: sync localStorage → database
        if (!dbCompleted && typeof window !== "undefined") {
          const localCompleted = localStorage.getItem(ONBOARDING_KEY) === "true"
          if (localCompleted) {
            await updateOnboardingStatus(address, true)
            localStorage.removeItem(ONBOARDING_KEY)
            setHasCompletedOnboarding(true)
            setIsLoading(false)
            return
          }
        }

        setHasCompletedOnboarding(dbCompleted)
      } else {
        if (typeof window !== "undefined") {
          const completed = localStorage.getItem(ONBOARDING_KEY) === "true"
          setHasCompletedOnboarding(completed)
        }
      }

      setIsLoading(false)
    }

    checkOnboardingStatus()
  }, [address, isConnected, isUserLoading, userData])

  const showOnboarding = (country?: OnboardingCountry) => {
    setOnboardingCountry(country || null)
    setIsOnboardingOpen(true)
  }

  const hideOnboarding = async () => {
    setIsOnboardingOpen(false)
    setHasCompletedOnboarding(true)

    if (isConnected && address) {
      await updateOnboardingStatus(address, true)
    } else if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true")
    }
  }

  const resetOnboarding = async () => {
    setHasCompletedOnboarding(false)
    setIsOnboardingOpen(true)

    if (isConnected && address) {
      await updateOnboardingStatus(address, false)
    } else if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_KEY)
    }
  }

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    onboardingCountry,
    isLoading,
    showOnboarding,
    hideOnboarding,
    resetOnboarding,
  }
}
