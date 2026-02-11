"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight, TrendingUp, Clock, Trophy, Zap, DollarSign, Flag, Target } from "lucide-react"
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
      title: "Welcome to Onchain World Cup!",
      description: "Community-driven football decided by your votes",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <div className="bg-accent/20 rounded-sm p-3 border border-accent/30">
            <p className="text-sm text-foreground/80">
              <strong className="text-accent">Not based on real football!</strong> Results are 100% decided by community votes, not what happens on the pitch.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">How it works in 3 steps:</p>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <strong>Connect wallet</strong> - Use Coinbase, MetaMask, or any crypto wallet
                </div>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <strong>Buy votes</strong> - Support your favorite countries with ETH
                </div>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <strong>Win prizes</strong> - Share the prize pool if your countries qualify
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-green-400">CURRENT: QUALIFICATION</span>
            </div>
            <p className="text-sm text-green-300">
              192 countries compete for 48 tournament spots. Vote for your favorites - top 48 by vote count qualify!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Vote Early, Pay Less",
      description: "Earlier voters get more votes for less ETH",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-sm p-4 border border-border">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-400">0.001 ETH</div>
              <div className="text-sm text-foreground/70">First vote</div>
              <div className="my-2">
                <TrendingUp className="w-6 h-6 mx-auto text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-orange-400">+0.0005 ETH</div>
              <div className="text-sm text-foreground/70">Per additional vote</div>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Each country has its own vote count and pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>More popular countries = higher prices</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Early voters get more votes for their money</span>
            </li>
          </ul>

          <div className="bg-accent/20 rounded-sm p-3 border border-accent/30">
            <p className="text-sm text-foreground/80">
              <strong className="text-accent">After qualification:</strong> Two parallel tournaments - Onchain World Cup with 48 qualified countries, plus a tournament mirroring the real 2026 World Cup format!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Winning & Prizes",
      description: "Share the prize pool when your countries qualify",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-sm p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-10 bg-green-500 rounded-sm flex items-center justify-center text-sm font-bold text-white">
                90% Prize Pool
              </div>
              <div className="w-20 h-10 bg-muted rounded-sm flex items-center justify-center text-sm font-bold text-foreground/70">
                10% Fee
              </div>
            </div>
            <p className="text-sm text-foreground/70 mt-2">
              All 48 qualified countries share one unified prize pool
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Your payout depends on:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Your total votes for any of the top 48 countries</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Total votes across all qualified countries</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-3">
            <p className="text-sm text-green-300">
              <strong>Formula:</strong> Your payout = (Your qualified votes / Total qualified votes) × Prize pool
            </p>
          </div>

          <div className="bg-accent/20 rounded-sm p-3 border border-accent/30">
            <p className="text-sm text-foreground/80">
              <strong className="text-accent">Tip:</strong> Vote for multiple countries to increase your chances!
            </p>
          </div>
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
        <div className="border-t border-border p-4 flex items-center justify-between bg-secondary/50 sticky bottom-0">
          <div>
            {currentStep === 0 && (
              <button
                onClick={handleClose}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button onClick={handlePrevious} variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext} size="sm">
              {isLastStep ? (
                "Get Started"
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
