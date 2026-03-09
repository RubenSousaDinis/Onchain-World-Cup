"use client"

import { createContext, useContext, type ReactNode } from "react"
import { Onboarding } from "@/components/onboarding"
import { useOnboarding, type OnboardingCountry } from "@/hooks/useOnboarding"

interface OnboardingContextType {
  isOnboardingOpen: boolean
  hasCompletedOnboarding: boolean
  onboardingCountry: OnboardingCountry | null
  showOnboarding: (country?: OnboardingCountry) => void
  hideOnboarding: () => void
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const onboarding = useOnboarding()

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
      <Onboarding
        isOpen={onboarding.isOnboardingOpen}
        onClose={onboarding.hideOnboarding}
        country={onboarding.onboardingCountry ?? undefined}
      />
    </OnboardingContext.Provider>
  )
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboardingContext must be used within OnboardingProvider")
  }
  return context
}
