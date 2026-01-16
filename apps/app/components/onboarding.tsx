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
      title: "Welcome to World Cup Voting!",
      description: "Vote on match outcomes using ETH on Base network",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            Welcome to the ultimate World Cup voting experience! Here's how it works:
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Vote on upcoming matches by purchasing votes with ETH</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>All votes are recorded on-chain on the Base network</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Winners share the prize pool proportionally to their vote count</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>The earlier you vote, the cheaper the votes!</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Qualification Phase",
      description: "Countries compete for 48 tournament spots",
      icon: Flag,
      content: (
        <div className="space-y-4">
          <div className="bg-accent/20 rounded-sm p-3 border border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold text-accent">CURRENT PHASE: QUALIFICATION</span>
            </div>
            <p className="text-xs text-foreground/80">
              This is where it all begins! Countries are competing for their spot in the main tournament.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Flag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">192 Countries Competing</div>
                <div className="text-xs text-foreground/70">
                  Countries from around the world are competing to prove they deserve a spot in the tournament.
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Only 48 Qualify</div>
                <div className="text-xs text-foreground/70">
                  The top countries with the most community support will advance. Your votes determine who makes it!
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Community Decides</div>
                <div className="text-xs text-foreground/70">
                  This is NOT based on real-world results. The community votes decide EVERYTHING on-chain.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-sm p-3 border border-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-foreground">192</div>
                <div className="text-xs text-muted-foreground">Countries</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">→</div>
                <div className="text-xs text-muted-foreground">Compete</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">48</div>
                <div className="text-xs text-muted-foreground">Qualify</div>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-3">
            <p className="text-xs text-green-300">
              <strong>🎯 Your Impact:</strong> Vote for your favorite countries to help them qualify for the main
              tournament. The more votes a country gets, the better their chances!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "2-Phase Pricing System",
      description: "Vote prices increase over time",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            Vote prices follow a unique 2-phase pricing model that rewards early voters:
          </p>

          <div className="space-y-3">
            {/* Phase 1 */}
            <div className="cm-panel bg-green-900/20 border-green-500/30 rounded-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">Phase 1: Linear (First 2 Hours)</span>
              </div>
              <p className="text-xs text-foreground/70">
                Prices increase slowly and predictably. Best time to vote! Each vote adds a small fixed amount to
                the price.
              </p>
              <div className="mt-2 text-xs font-mono text-green-300">
                price = 0.001 + (votes × 0.0001) ETH
              </div>
            </div>

            {/* Phase 2 */}
            <div className="cm-panel bg-orange-900/20 border-orange-500/30 rounded-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">Phase 2: Exponential (Hours 2-24)</span>
              </div>
              <p className="text-xs text-foreground/70">
                Prices rise exponentially! Each new vote makes the next one significantly more expensive.
              </p>
              <div className="mt-2 text-xs font-mono text-orange-300">
                price = phase1EndPrice × (1.1 ^ phase2Votes)
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-sm p-3 border border-border">
            <p className="text-xs text-foreground/80">
              <strong className="text-primary">💡 Pro Tip:</strong> Vote during Phase 1 to get the best prices and
              maximize your vote count!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "How to Vote",
      description: "Casting your vote is simple",
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">Follow these steps to place your vote:</p>

          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <div className="font-semibold mb-1">Connect Your Wallet</div>
                <div className="text-xs text-foreground/70">
                  Click "Connect Wallet" and choose your preferred wallet (MetaMask, Coinbase, etc.)
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <div className="font-semibold mb-1">Browse Matches</div>
                <div className="text-xs text-foreground/70">
                  View upcoming matches on the home page. Check voting deadlines and current prices.
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <div className="font-semibold mb-1">Select Your Team</div>
                <div className="text-xs text-foreground/70">
                  Click "Vote" on your preferred team and choose how many votes to purchase.
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <div className="font-semibold mb-1">Confirm Transaction</div>
                <div className="text-xs text-foreground/70">
                  Review the cost and confirm the transaction in your wallet. Wait for on-chain confirmation.
                </div>
              </div>
            </li>
          </ol>

          <div className="bg-secondary/50 rounded-sm p-3 border border-border">
            <p className="text-xs text-foreground/80">
              <strong className="text-primary">⚡ Demo Mode:</strong> You can explore without connecting! Demo votes
              let you try the interface.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Early Voter Advantage",
      description: "More votes for less ETH",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            The early bird gets the worm - and more votes for their ETH!
          </p>

          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-sm p-4 border border-border">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-400">0.001 ETH</div>
                <div className="text-xs text-foreground/70">First vote price (Phase 1 start)</div>
                <div className="text-lg font-semibold text-foreground">vs</div>
                <div className="text-2xl font-bold text-orange-400">0.050+ ETH</div>
                <div className="text-xs text-foreground/70">Potential late vote price (Phase 2)</div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Why vote early?</p>
              <ul className="space-y-2 text-xs text-foreground/70">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">Get more votes:</strong> Same ETH buys more votes when
                    prices are low
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">Higher winnings:</strong> Payouts are proportional to vote
                    count
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">Beat the rush:</strong> Avoid exponential pricing in Phase 2
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-3">
            <p className="text-xs text-green-300">
              <strong>⏰ Remember:</strong> Phase 1 only lasts 2 hours after voting opens. Don't miss out!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Payout Mechanics",
      description: "How winners get paid",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">Here's how the prize pool is distributed:</p>

          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-sm p-4 border border-border">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-foreground/70 mb-1">Prize Pool Distribution</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-8 bg-green-500 rounded-sm flex items-center justify-center text-xs font-bold text-white">
                      90% to Winners
                    </div>
                    <div className="w-16 h-8 bg-muted rounded-sm flex items-center justify-center text-xs font-bold text-foreground/70">
                      10% Fee
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-foreground/70 mb-2">Your payout is calculated as:</p>
                  <div className="font-mono text-xs bg-primary/10 p-2 rounded-sm text-primary">
                    Your Payout = (Your Votes / Total Winning Votes) × 90% of Pool
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Example:</p>
              <ul className="space-y-2 text-xs text-foreground/70">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Total prize pool: 10 ETH</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Winners pool: 9 ETH (90%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>You have: 100 votes out of 1,000 total winning votes (10%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-green-400">Your payout: 0.9 ETH</strong> (10% of 9 ETH)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-sm p-3 border border-border">
            <p className="text-xs text-foreground/80">
              <strong className="text-primary">🎯 Key Insight:</strong> Payouts are based on{" "}
              <strong>vote count</strong>, not ETH spent. Early voters get more votes per ETH!
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
