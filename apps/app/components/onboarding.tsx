"use client"

import { useEffect } from "react"
import { X, Clock, Trophy, Users } from "lucide-react"
import type { OnboardingCountry } from "@/hooks/useOnboarding"

interface OnboardingProps {
  isOpen: boolean
  onClose: () => void
  country?: OnboardingCountry
}

export function Onboarding({ isOpen, onClose, country }: OnboardingProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="cm-panel w-full max-w-md rounded-sm border-2 border-primary">
        {/* Header */}
        <div className="bg-secondary p-4 flex items-center justify-between border-b border-border">
          <div className="text-base font-bold text-foreground">
            {country ? (
              <span>Voting for {country.flag} {country.name}</span>
            ) : (
              <span>How it works</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">Community decides who qualifies</p>
              <p className="text-sm text-muted-foreground">
                Results are 100% decided by votes — not what happens on the pitch. Top 48 countries advance to the tournament.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">Vote early, pay less</p>
              <p className="text-sm text-muted-foreground">
                Each vote increases the price slightly. The earlier you vote, the cheaper it is.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">Win if your country qualifies</p>
              <p className="text-sm text-muted-foreground">
                If your country finishes in the top 48, you share the prize pool proportionally to your votes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end bg-secondary/50">
          <button
            onClick={onClose}
            className="cm-nav-tab px-5 py-2.5 rounded-sm font-bold text-sm"
          >
            {country ? `Got it — vote for ${country.flag} ${country.name}` : "Got it, let's go"}
          </button>
        </div>
      </div>
    </div>
  )
}
