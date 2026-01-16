"use client"

import { useState, useEffect } from "react"

const ONBOARDING_KEY = "onboardingCompleted"

/**
 * Hook to manage onboarding state
 * Checks if user has completed onboarding and provides controls to show/hide it
 */
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true) // Default to true to avoid flash

  useEffect(() => {
    // Check if user has completed onboarding
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(ONBOARDING_KEY)
      const hasCompleted = completed === "true"
      setHasCompletedOnboarding(hasCompleted)

      // Auto-show onboarding for first-time users
      if (!hasCompleted) {
        // Small delay to ensure app is loaded
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const showOnboarding = () => {
    setIsOnboardingOpen(true)
  }

  const hideOnboarding = () => {
    setIsOnboardingOpen(false)
    // Mark as completed when closed
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true")
      setHasCompletedOnboarding(true)
    }
  }

  const resetOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_KEY)
      setHasCompletedOnboarding(false)
      setIsOnboardingOpen(true)
    }
  }

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    showOnboarding,
    hideOnboarding,
    resetOnboarding,
  }
}
