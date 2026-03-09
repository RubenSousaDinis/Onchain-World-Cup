"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useOnboardingContext } from "@/providers/onboarding-provider"

export function TourGuideButton() {
  const { showOnboarding } = useOnboardingContext()
  return (
    <Button onClick={() => showOnboarding()} variant="outline" size="sm" className="flex-shrink-0">
      <HelpCircle className="w-4 h-4 mr-2" />
      Tour Guide
    </Button>
  )
}
