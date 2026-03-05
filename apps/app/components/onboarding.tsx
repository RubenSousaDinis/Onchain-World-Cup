"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight, Trophy, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { countries } from "@/lib/countries"

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
  const [countrySearch, setCountrySearch] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; flagEmoji: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries
    const q = countrySearch.toLowerCase()
    return countries.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [countrySearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current && !searchRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

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
      const dest = selectedCountry
        ? `/qualification?vote=${selectedCountry.code}`
        : "/qualification"
      router.push(dest)
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
          </ul>

          {/* Country picker */}
          <div className="space-y-2 pt-1">
            <label className="text-sm font-bold cm-highlight">Pick your country to vote for</label>

            {selectedCountry ? (
              <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/40 rounded-sm">
                <span className="text-2xl">{selectedCountry.flagEmoji}</span>
                <span className="text-base font-bold flex-1">{selectedCountry.name}</span>
                <button
                  onClick={() => { setSelectedCountry(null); setCountrySearch("") }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 bg-input border border-border rounded-sm px-3 py-2">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Type to search countries..."
                    value={countrySearch}
                    onChange={(e) => { setCountrySearch(e.target.value); setDropdownOpen(true) }}
                    onFocus={() => setDropdownOpen(true)}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {dropdownOpen && filteredCountries.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-sm shadow-lg z-20 max-h-48 overflow-y-auto"
                  >
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setSelectedCountry(c); setCountrySearch(""); setDropdownOpen(false) }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/50 flex items-center gap-3 border-b border-border/50 last:border-0 transition-colors"
                      >
                        <span className="text-lg">{c.flagEmoji}</span>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto font-mono">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                selectedCountry ? `Vote for ${selectedCountry.flagEmoji} ${selectedCountry.name}` : "Let's go"
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
