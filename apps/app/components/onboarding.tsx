"use client"

import { useState, useEffect } from "react"
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
      description: "A global football competition decided by you",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            This isn't your regular World Cup - it's a community-driven football competition where YOU decide the
            winners!
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Support your favorite countries with real money</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>The community votes determine ALL match outcomes</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Win big if your team comes out on top</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Early supporters get better rewards</span>
            </li>
          </ul>

          <div className="bg-accent/20 rounded-sm p-3 border border-accent/30">
            <p className="text-xs text-foreground/80">
              <strong className="text-accent">Not based on real football:</strong> Results are 100% decided by the
              community, not what happens on the pitch!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "The Competition Journey",
      description: "From qualification to champion",
      icon: Flag,
      content: (
        <div className="space-y-4">
          <div className="bg-accent/20 rounded-sm p-3 border border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold text-accent">CURRENT PHASE: QUALIFICATION</span>
            </div>
            <p className="text-xs text-foreground/80">
              192 countries competing for 48 tournament spots. Your votes decide who advances!
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Three Amazing Tournaments:</p>
            <div className="space-y-2">
              <div className="flex gap-2 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-green-400">Qualification (Now!)</div>
                  <div className="text-xs text-foreground/70">192 countries compete → Top 48 advance</div>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Onchain World Cup</div>
                  <div className="text-xs text-foreground/70">
                    The 48 qualified countries compete in our own tournament!
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Real World Cup Format</div>
                  <div className="text-xs text-foreground/70">
                    Follows actual 2026 World Cup groups - but YOU vote on every match!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-sm p-3 border border-border">
            <p className="text-xs text-foreground/80">
              <strong className="text-primary">⚽ Two parallel tournaments:</strong> After qualification, vote in BOTH
              the Onchain World Cup AND a tournament that mirrors the real 2026 World Cup format!
            </p>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-3">
            <p className="text-xs text-green-300">
              <strong>🎯 Get started now</strong> in the qualification phase and follow your countries all the way to
              the final!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Vote Early, Pay Less",
      description: "Prices increase as more people vote",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            Like early bird tickets to a match - the earlier you vote, the cheaper it is!
          </p>

          <div className="bg-secondary/50 rounded-sm p-4 border border-border">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-400">$1-5</div>
              <div className="text-xs text-foreground/70">First few votes (Best value!)</div>
              <div className="my-2">
                <TrendingUp className="w-6 h-6 mx-auto text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-orange-400">$50+</div>
              <div className="text-xs text-foreground/70">After many people vote</div>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
              <span>
                <strong className="text-foreground">First 2 hours:</strong> Prices rise slowly and steadily
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
              <span>
                <strong className="text-foreground">After 2 hours:</strong> Prices jump up quickly
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>
                <strong className="text-foreground">Why?</strong> Early supporters get more votes for their money
              </span>
            </li>
          </ul>

          <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-3">
            <p className="text-xs text-green-300">
              <strong>⏰ Smart tip:</strong> Vote in the first 2 hours to get the best value. Every vote after makes
              it more expensive!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "How to Vote",
      description: "Support your team in 3 easy steps",
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">Getting started is simple:</p>

          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <div className="font-semibold mb-1">Set Up Payment</div>
                <div className="text-xs text-foreground/70">
                  Connect your crypto wallet (like Coinbase or MetaMask). New to crypto? We'll guide you!
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <div className="font-semibold mb-1">Pick Your Country</div>
                <div className="text-xs text-foreground/70">
                  Browse countries and see current support levels. Choose who you want to back!
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <div className="font-semibold mb-1">Buy Votes & Watch</div>
                <div className="text-xs text-foreground/70">
                  Decide how much to spend, confirm your purchase, and watch the competition unfold!
                </div>
              </div>
            </li>
          </ol>

          <div className="bg-secondary/50 rounded-sm p-3 border border-border">
            <p className="text-xs text-foreground/80">
              <strong className="text-primary">💡 First time?</strong> You can browse everything without payment to
              see how it works!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Winning & Prizes",
      description: "How payouts work if your team wins",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">If your country wins, you get a share of the prize pool!</p>

          <div className="bg-secondary/50 rounded-sm p-4 border border-border">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-foreground/70 mb-2">How the money is split:</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-10 bg-green-500 rounded-sm flex items-center justify-center text-sm font-bold text-white">
                    90% to Winners
                  </div>
                  <div className="w-20 h-10 bg-muted rounded-sm flex items-center justify-center text-sm font-bold text-foreground/70">
                    10% Fee
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Your share depends on:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>
                  <strong>How many votes you bought</strong> - More votes = bigger share
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Total votes on winning team</strong> - Your % of total winning votes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Size of prize pool</strong> - All money bet on the match
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-3">
            <p className="text-xs text-green-300">
              <strong>💰 Example:</strong> If you have 10% of the winning votes, you get 10% of the winners' pot. Simple as that!
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
              <div className="text-xs text-muted-foreground">{currentStepData.description}</div>
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
          <div className="text-xs text-muted-foreground mt-2 text-center">
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
