"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { DemoBanner } from "@/components/demo-banner"
import { Trophy, Users, TrendingUp, Clock, Zap, ChevronRight, Award } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { countries as countriesData } from "@/lib/countries"

export default function HomePage() {
  const [timeRemaining, setTimeRemaining] = useState({ days: 30, hours: 14, minutes: 23, seconds: 45 })

  // Mock data - will be replaced with real data from API/blockchain
  const topCountries = countriesData.slice(0, 5).map((country, index) => ({
    rank: index + 1,
    name: country.name,
    flag: country.flagEmoji,
    votes: Math.max(100, 2500 - index * 35),
  }))

  const stats = {
    totalVotes: 48750,
    totalPrizePool: 125.8, // ETH
    activePlayers: 1247,
    timeLeft: "30 days",
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        let { days, hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          days--
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <div className="flex flex-1">
        <RetroSidebar />
        <MobileNav />

        <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
          {/* Hero Section */}
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
            <div className="soccer-field-bg p-6 lg:p-8">
              <div className="max-w-3xl">
                <h1 className="text-3xl lg:text-5xl font-bold mb-3">
                  <span className="cm-highlight">Onchain World Cup</span>
                </h1>
                <p className="text-base lg:text-xl text-foreground/90 mb-2">
                  The World Cup, decided onchain.
                </p>
                <p className="text-xs lg:text-sm text-foreground/70">
                  Vote with ETH on Base network • Community determines qualification • Winners share prize pool
                </p>
              </div>
            </div>
          </div>

          {/* Current Phase Banner */}
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent/30">
            <div className="bg-secondary/40 p-4 lg:p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-accent" />
                  <div>
                    <div className="text-xs text-accent font-bold uppercase mb-1">Current Phase</div>
                    <h2 className="text-xl lg:text-2xl font-bold cm-highlight">Qualification Voting</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vote for countries • Top 48 qualify for tournament
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 lg:gap-4">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.days}</div>
                    <div className="text-[10px] lg:text-xs text-muted-foreground">DAYS</div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.hours}</div>
                    <div className="text-[10px] lg:text-xs text-muted-foreground">HRS</div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.minutes}</div>
                    <div className="text-[10px] lg:text-xs text-muted-foreground">MIN</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="cm-panel rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-accent" />
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Active Voters</div>
              </div>
              <div className="text-xl lg:text-2xl font-bold cm-highlight font-mono">
                {stats.activePlayers.toLocaleString()}
              </div>
            </div>

            <div className="cm-panel rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Votes</div>
              </div>
              <div className="text-xl lg:text-2xl font-bold cm-highlight font-mono">
                {stats.totalVotes.toLocaleString()}
              </div>
            </div>

            <div className="cm-panel rounded-sm p-4 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-accent" />
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Prize Pool</div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-accent font-mono">
                {stats.totalPrizePool} ETH
              </div>
            </div>

            <div className="cm-panel rounded-sm p-4 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Time Left</div>
              </div>
              <div className="text-xl lg:text-2xl font-bold cm-highlight font-mono">{timeRemaining.days}d</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Top Countries */}
            <div className="cm-panel rounded-sm overflow-hidden">
              <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center justify-between">
                <h3 className="text-sm font-bold cm-highlight uppercase">Top 5 Countries</h3>
                <Link
                  href="/qualification"
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-bold"
                >
                  View All
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {topCountries.map((country) => (
                  <Link
                    key={country.rank}
                    href="/qualification"
                    className="flex items-center justify-between p-3 bg-secondary/20 rounded-sm hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold cm-highlight min-w-[24px]">#{country.rank}</span>
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-sm font-bold">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold cm-highlight">{country.votes.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">votes</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <Link
                  href="/qualification"
                  className="w-full cm-nav-tab py-3 rounded-sm font-bold uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <Trophy className="w-4 h-4" />
                  Vote for Your Country
                </Link>
              </div>
            </div>

            {/* How It Works */}
            <div className="cm-panel rounded-sm overflow-hidden">
              <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30">
                <h3 className="text-sm font-bold cm-highlight uppercase">How It Works</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-accent/20 border border-accent flex items-center justify-center">
                    <span className="text-sm font-bold cm-highlight">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Vote with ETH</h4>
                    <p className="text-xs text-muted-foreground">
                      Buy votes for your favorite countries or teams using ETH on Base network
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-accent/20 border border-accent flex items-center justify-center">
                    <span className="text-sm font-bold cm-highlight">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Dynamic Pricing</h4>
                    <p className="text-xs text-muted-foreground">
                      Early voters get better prices - prices increase as more people vote
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-accent/20 border border-accent flex items-center justify-center">
                    <span className="text-sm font-bold cm-highlight">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Win Rewards</h4>
                    <p className="text-xs text-muted-foreground">
                      Winners share 90% of prize pool proportionally based on votes
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border">
                <Link
                  href="/how-it-works"
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-sm font-bold uppercase text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Learn More
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="cm-panel rounded-sm overflow-hidden">
              <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center justify-between">
                <h3 className="text-sm font-bold cm-highlight uppercase">Top Voters</h3>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-bold"
                >
                  View All
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-4">
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-accent/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Compete for the top spot</p>
                  <p className="text-xs text-muted-foreground">Start voting to appear on the leaderboard</p>
                </div>
              </div>
              <div className="p-4 border-t border-border">
                <Link
                  href="/leaderboard"
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-sm font-bold uppercase text-sm transition-colors flex items-center justify-center gap-2"
                >
                  View Leaderboard
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="cm-panel rounded-sm overflow-hidden">
              <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30">
                <h3 className="text-sm font-bold cm-highlight uppercase">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  href="/qualification"
                  className="block p-4 bg-accent/10 border border-accent/30 rounded-sm hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <h4 className="text-sm font-bold cm-highlight">Vote for Qualification</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Support your country to qualify for the tournament</p>
                </Link>

                <Link
                  href="/my-bets"
                  className="block p-4 bg-secondary/20 rounded-sm hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                    <h4 className="text-sm font-bold text-foreground">My Votes</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">View your voting history and active positions</p>
                </Link>

                <Link
                  href="/schedule"
                  className="block p-4 bg-secondary/20 rounded-sm hover:bg-secondary/40 transition-colors opacity-50 cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <h4 className="text-sm font-bold text-foreground">Match Schedule</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Available after qualification phase</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Important Info Banner */}
          <div className="mt-6 lg:mt-8 cm-panel rounded-sm border-2 border-accent/30 overflow-hidden">
            <div className="bg-accent/10 p-4 lg:p-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold cm-highlight mb-2">Early Voting Advantage</h3>
                  <p className="text-xs text-foreground/80 mb-3">
                    Vote prices increase as more people vote. Early voters get the best prices and have a better chance
                    of winning if their team succeeds. Don't wait - vote now!
                  </p>
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-bold"
                  >
                    Learn about pricing
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
