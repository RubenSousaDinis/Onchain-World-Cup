"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, Clock, TrendingUp, Users } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">
            <span className="cm-highlight">HOW IT WORKS</span>
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Understanding the Crypto World Cup 2026 Voting System
          </p>
        </div>

        {/* Game Rules Table */}
        <div className="cm-panel rounded-sm border border-border mb-4 overflow-hidden">
          <div className="bg-primary/20 px-4 py-3 border-b border-border flex items-center gap-2">
            <Trophy className="w-5 h-5 cm-highlight" />
            <h2 className="text-base lg:text-lg font-bold cm-highlight uppercase">Game Rules</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[120px_1fr] p-4 gap-3 lg:gap-4 hover:bg-accent/5">
              <div className="cm-highlight font-bold text-xl lg:text-3xl">90%</div>
              <div>
                <div className="font-bold text-sm mb-1 flex items-center gap-2">
                  Winners' Prize Pool
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  90% of total ETH goes to ALL voters who picked the winning team
                </div>
                <div className="bg-accent/10 rounded-sm px-3 py-2 border border-accent/30">
                  <div className="text-xs font-bold text-accent mb-1">How Your Winnings Are Calculated:</div>
                  <div className="text-xs text-foreground font-mono">
                    Your Share = (Your Votes / Total Winning Votes) × 90% of Prize Pool
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[120px_1fr] p-4 gap-3 lg:gap-4 hover:bg-accent/5">
              <div className="cm-highlight font-bold text-xl lg:text-3xl">10%</div>
              <div>
                <div className="font-bold text-sm mb-1">Platform Fee</div>
                <div className="text-xs text-muted-foreground">
                  10% platform fee covers smart contract operations and maintenance
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[120px_1fr] p-4 gap-3 lg:gap-4 hover:bg-accent/5">
              <div className="text-accent font-bold text-xl lg:text-3xl">ETH</div>
              <div>
                <div className="font-bold text-sm mb-1">Base Network</div>
                <div className="text-xs text-muted-foreground">
                  All voting happens on Base for fast, low-cost transactions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Phases Table */}
        <div className="cm-panel rounded-sm border border-border mb-4 overflow-hidden">
          <div className="bg-primary/20 px-4 py-3 border-b border-border flex items-center gap-2">
            <Clock className="w-5 h-5 cm-highlight" />
            <h2 className="text-base lg:text-lg font-bold cm-highlight uppercase">Pricing Phases</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[120px_1fr] p-4 gap-3 lg:gap-4 hover:bg-accent/5">
              <div className="text-green-500 font-bold text-base lg:text-xl">Phase 1</div>
              <div>
                <div className="font-bold text-sm mb-1">Hours 0-2: Linear Pricing</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Vote cost increases steadily during first 2 hours. Best time to vote for lower costs.
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 font-bold">Recommended voting window</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[120px_1fr] p-4 gap-3 lg:gap-4 hover:bg-accent/5">
              <div className="text-red-500 font-bold text-base lg:text-xl">Phase 2</div>
              <div>
                <div className="font-bold text-sm mb-1">Hours 2-24: Exponential Pricing</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Vote costs rise dramatically as match approaches. Late voters pay significantly more.
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-500 font-bold">High cost period</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Play Table */}
        <div className="cm-panel rounded-sm border border-border mb-20 lg:mb-4 overflow-hidden">
          <div className="bg-primary/20 px-4 py-3 border-b border-border">
            <h2 className="text-base lg:text-lg font-bold cm-highlight uppercase">How to Play</h2>
          </div>
          <div className="divide-y divide-border text-xs lg:text-sm">
            <div className="p-3 lg:p-4 flex gap-3 hover:bg-accent/5">
              <div className="cm-highlight font-bold text-base lg:text-lg w-6 lg:w-8 flex-shrink-0">1.</div>
              <div>
                <span className="font-bold">Connect wallet</span> - Use MetaMask, Coinbase Wallet, or WalletConnect on
                Base network
              </div>
            </div>
            <div className="p-3 lg:p-4 flex gap-3 hover:bg-accent/5">
              <div className="cm-highlight font-bold text-base lg:text-lg w-6 lg:w-8 flex-shrink-0">2.</div>
              <div>
                <span className="font-bold">Choose a match</span> - Browse live or upcoming World Cup matches
              </div>
            </div>
            <div className="p-3 lg:p-4 flex gap-3 hover:bg-accent/5">
              <div className="cm-highlight font-bold text-base lg:text-lg w-6 lg:w-8 flex-shrink-0">3.</div>
              <div>
                <span className="font-bold">Vote with ETH</span> - Enter amount and pick winning team. Cost varies by
                timing phase
              </div>
            </div>
            <div className="p-3 lg:p-4 flex gap-3 hover:bg-accent/5">
              <div className="cm-highlight font-bold text-base lg:text-lg w-6 lg:w-8 flex-shrink-0">4.</div>
              <div>
                <span className="font-bold">Track results</span> - Team with most ETH voted wins the match pool
              </div>
            </div>
            <div className="p-3 lg:p-4 flex gap-3 hover:bg-accent/5">
              <div className="cm-highlight font-bold text-base lg:text-lg w-6 lg:w-8 flex-shrink-0">5.</div>
              <div>
                <span className="font-bold">Claim winnings</span> - Winners share 90% of prize pool proportional to
                their vote
              </div>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="cm-panel rounded-sm border border-primary/50 mb-20 lg:mb-4 overflow-hidden">
          <div className="bg-primary/30 px-4 py-3 border-b border-border">
            <h3 className="text-sm lg:text-base font-bold cm-highlight uppercase">Example: Multiple Winners</h3>
          </div>
          <div className="p-4 space-y-3 text-xs lg:text-sm">
            <div className="bg-secondary/20 rounded-sm p-3 mb-3">
              <div className="font-bold text-sm mb-2 text-accent">Scenario: Brazil Wins</div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total prize pool:</span>
                <span className="font-bold font-mono">23.0 ETH</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total votes for Brazil (winner):</span>
                <span className="font-bold font-mono">15.0 ETH</span>
              </div>
              <div className="flex justify-between py-1 border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Winners share (90%):</span>
                <span className="font-bold font-mono cm-highlight">20.7 ETH</span>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="font-bold text-sm mb-2">Your Individual Winnings:</div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Your votes for Brazil:</span>
                <span className="font-bold font-mono">2.0 ETH</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Your share of winners pool:</span>
                <span className="font-mono text-xs">(2.0 / 15.0) × 20.7</span>
              </div>
              <div className="border-t border-border pt-3 mt-2 flex justify-between items-center">
                <span className="font-bold">You receive:</span>
                <span className="cm-highlight font-bold text-lg lg:text-2xl font-mono">2.76 ETH</span>
              </div>
              <div className="text-green-500 text-xs text-right">+38% profit (you paid 2.0 ETH)</div>
            </div>

            <div className="bg-accent/10 rounded-sm p-3 mt-3 border border-accent/30">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-xs text-foreground">
                  <strong className="text-accent">All winning voters split the 90% pool proportionally.</strong> The
                  more votes you cast for the winning team compared to other winners, the larger your share.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
