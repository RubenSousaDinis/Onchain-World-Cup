"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, Clock, Flag, Target, Vote, Award, Info, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOnboardingContext } from "@/providers/onboarding-provider"

export default function HowItWorksPage() {
  const { showOnboarding } = useOnboardingContext()

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold mb-2">
                <span className="cm-highlight">PROJECT PHASES</span>
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground">
                How the Onchain World Cup evolves from qualification to champion
              </p>
            </div>
            <Button onClick={showOnboarding} variant="outline" size="sm" className="flex-shrink-0">
              <HelpCircle className="w-4 h-4 mr-2" />
              Tour Guide
            </Button>
          </div>
        </div>

        {/* Key Message Banner */}
        <div className="cm-panel rounded-sm border-2 border-accent mb-6 overflow-hidden">
          <div className="bg-accent/20 p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm lg:text-base mb-1">Community-Driven Competition</div>
                <div className="text-xs lg:text-sm text-foreground">
                  <strong>The Onchain World Cup is decided by the community, not real-world results.</strong> All
                  outcomes are determined onchain through voting, making this a truly crypto-native tournament.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Layout */}
        <div className="space-y-6">
          <div className="cm-panel rounded-sm border border-border overflow-hidden">
            <div className="soccer-field-bg px-4 py-6 border-b border-border relative">
              <div className="absolute top-2 right-4 text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-sm border border-green-500/30">
                CURRENT PHASE
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-sm bg-primary/80 flex items-center justify-center">
                  <Flag className="w-6 h-6 cm-highlight" />
                </div>
                <div>
                  <div className="text-xs text-accent font-bold uppercase">Phase 1</div>
                  <h2 className="text-xl lg:text-2xl font-bold cm-highlight">Qualification Phase</h2>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                The journey begins as nations compete for their spot in the tournament
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 items-start hover:bg-accent/5 p-2 rounded-sm">
                <Vote className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Vote for Countries</div>
                  <div className="text-xs text-muted-foreground">
                    64 countries compete for qualification. Users vote for their favorites with ETH. No matches yet -
                    just straight voting competition between nations.
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-start hover:bg-accent/5 p-2 rounded-sm">
                <Target className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Top 48 Qualify</div>
                  <div className="text-xs text-muted-foreground">
                    Countries with the most votes advance to the tournament phase. Only the top 48 make it through - the
                    rest are eliminated.
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-start hover:bg-accent/5 p-2 rounded-sm">
                <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Early Bird Advantage</div>
                  <div className="text-xs text-muted-foreground">
                    Voting costs increase weekly through boost fees. Early participation is cheaper - vote now to secure
                    the best rates before fees rise!
                  </div>
                </div>
              </div>
              <div className="bg-accent/10 rounded-sm p-3 border border-accent/30 mt-4">
                <div className="text-xs font-bold text-accent mb-1">What You Can Do Now:</div>
                <ul className="text-xs text-foreground space-y-1 ml-4 list-disc">
                  <li>Vote for countries to help them qualify</li>
                  <li>Build your position early at lower costs</li>
                  <li>Track the qualification standings</li>
                  <li>Earn milestones and achievements</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="cm-panel rounded-sm border border-border overflow-hidden opacity-70">
            <div className="soccer-field-bg px-4 py-6 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-sm bg-primary/80 flex items-center justify-center">
                  <Trophy className="w-6 h-6 cm-highlight" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-bold uppercase">Phase 2</div>
                  <h2 className="text-xl lg:text-2xl font-bold cm-highlight">Tournament Phase</h2>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Coming soon - After qualification concludes</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 items-start p-2">
                <Flag className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Qualified Countries Enter Groups</div>
                  <div className="text-xs text-muted-foreground">
                    The 48 qualified nations are organized into groups. The tournament structure mirrors traditional
                    World Cup format but decided entirely onchain.
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2">
                <Vote className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Matches Introduced</div>
                  <div className="text-xs text-muted-foreground">
                    Real head-to-head matches begin. Vote for either team (or both!) in each match. The team with more
                    votes wins and advances.
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2">
                <Award className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Prize Pools Activated</div>
                  <div className="text-xs text-muted-foreground">
                    Each match has its own prize pool. 90% goes to voters of the winning team (proportional to votes),
                    10% platform fee. Dynamic pricing with linear and exponential phases.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cm-panel rounded-sm border border-border overflow-hidden opacity-50">
            <div className="soccer-field-bg px-4 py-6 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-sm bg-primary/80 flex items-center justify-center">
                  <Award className="w-6 h-6 cm-highlight" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-bold uppercase">Phase 3</div>
                  <h2 className="text-xl lg:text-2xl font-bold cm-highlight">Finals & Champion</h2>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">The final stage - crowning the crypto champion</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 items-start p-2">
                <Trophy className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Knockout Rounds</div>
                  <div className="text-xs text-muted-foreground">
                    Teams advance through knockout stages - Round of 16, Quarter-finals, Semi-finals, and the grand
                    Final. Every round decided by community votes.
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2">
                <Award className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">One Crypto World Cup Champion</div>
                  <div className="text-xs text-muted-foreground">
                    The final match determines the ultimate winner. The community crowns the first-ever Onchain World
                    Cup champion - a title earned purely through onchain voting.
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2">
                <Flag className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold mb-1">Crypto-Native Results</div>
                  <div className="text-xs text-muted-foreground">
                    All results are independent from real-world football. This is a parallel universe where the
                    community decides every outcome through transparent, verifiable onchain voting.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats/Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 mb-20 lg:mb-0">
          <div className="cm-panel rounded-sm border border-border p-4">
            <div className="text-2xl font-bold cm-highlight mb-1">64</div>
            <div className="text-xs text-muted-foreground">Countries competing in qualification</div>
          </div>
          <div className="cm-panel rounded-sm border border-border p-4">
            <div className="text-2xl font-bold cm-highlight mb-1">48</div>
            <div className="text-xs text-muted-foreground">Spots available in the tournament</div>
          </div>
          <div className="cm-panel rounded-sm border border-border p-4">
            <div className="text-2xl font-bold cm-highlight mb-1">1</div>
            <div className="text-xs text-muted-foreground">Onchain World Cup champion</div>
          </div>
        </div>
      </main>
    </div>
  )
}
