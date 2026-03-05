"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight, Trophy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingStep {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

interface OnboardingProps {
  isOpen: boolean
  onClose: () => void
}

export function Onboarding({ isOpen, onClose }: OnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleEscape as any)
    return () => window.removeEventListener("keydown", handleEscape as any)
  }, [isOpen])

  const handleClose = () => {
    // Mark onboarding as completed in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingCompleted", "true")
    }
    onClose()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/qualification")
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Onchain World Cup",
      description: "Community-driven football decided by your votes",
      icon: Trophy,
      content: (
        <div className="space-y-5">
          <p className="text-base text-foreground/80">
            Results are 100% decided by community votes — not what happens on the pitch.
          </p>

          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span className="text-base pt-0.5"><strong>Connect your wallet</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span className="text-base pt-0.5"><strong>Pick a country</strong> to support</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span className="text-base pt-0.5"><strong>Buy votes</strong> — top 48 countries qualify for the tournament</span>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "Vote early, pay less",
      description: "The earlier you vote, the cheaper it is",
      icon: Clock,
      content: (
        <div className="space-y-5">
          <ul className="space-y-3 text-base">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>The earlier you vote, the cheaper each vote costs</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>If your country finishes in the top 48, you share the prize pool</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>That&apos;s it — pick your country and go</span>
            </li>
          </ul>
        </div>
      ),
    },
  ]

  if (!isOpen) return null

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="cm-panel w-full max-w-2xl rounded-sm border-2 border-primary max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-secondary p-4 flex items-center justify-between border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{currentStepData.title}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">{currentStepData.description}</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-foreground hover:text-accent transition-colors"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="text-xs lg:text-sm text-muted-foreground mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">{currentStepData.content}</div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-end bg-secondary/50 sticky bottom-0">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button onClick={handlePrevious} variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext} size="sm">
              {isLastStep ? (
                "Let's go"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
