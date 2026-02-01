"use client"

import { useState, useEffect } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { FarcasterUserInfo } from "@/components/farcaster-user-info"
import { Trophy, Users, TrendingUp, Clock, Zap, ChevronRight, Award, BarChart3 } from "lucide-react"
import Link from "next/link"
import { countries as countriesDataStatic } from "@/lib/countries"
import {
  StatCard,
  SectionCard,
  CountdownTimer,
  InfoBanner,
  QuickActionCard,
  TopListItem,
  EmptyState,
} from "@/components/dashboard"

type CountryStats = {
  country_code: string
  total_votes: number
  total_eth: string
}

type SummaryData = {
  totalVotes: number
  totalEth: string
  totalVoters: number
  topCountries: CountryStats[]
}

export default function HomePage() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/qualification/summary")
        if (res.ok) {
          const data = await res.json()
          setSummaryData(data)
        }
      } catch (error) {
        console.error("Failed to fetch summary data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Listen for vote-recorded events to refresh immediately
    const handleVoteRecorded = () => {
      console.log("[HomePage] Vote recorded - refreshing data")
      fetchData()
    }
    window.addEventListener("vote-recorded", handleVoteRecorded)

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)

    return () => {
      clearInterval(interval)
      window.removeEventListener("vote-recorded", handleVoteRecorded)
    }
  }, [])

  // Map country codes to full country data
  const topCountries = (summaryData?.topCountries || []).map((stats, index) => {
    const countryData = countriesDataStatic.find((c) => c.code === stats.country_code)
    return {
      rank: index + 1,
      name: countryData?.name || stats.country_code,
      flag: countryData?.flagEmoji || "🏳️",
      votes: stats.total_votes,
    }
  }).slice(0, 5)

  const stats = {
    totalVotes: summaryData?.totalVotes || 0,
    totalPrizePool: parseFloat(summaryData?.totalEth || "0"),
    activePlayers: summaryData?.totalVoters || 0,
  }

  return (
    <div className="min-h-screen flex flex-col">
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
                <p className="text-sm lg:text-base text-foreground/70">
                  Vote with ETH on Base network • Community determines qualification • Winners share prize pool
                </p>
              </div>
            </div>
          </div>

          {/* Farcaster User Info */}
          <FarcasterUserInfo variant="compact" className="mb-4 lg:mb-6" />

          {/* Current Phase Banner */}
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent/30">
            <div className="bg-secondary/40 p-4 lg:p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-accent" aria-hidden="true" />
                  <div>
                    <div className="text-xs lg:text-sm text-accent font-bold uppercase mb-1">Current Phase</div>
                    <h2 className="text-xl lg:text-2xl font-bold cm-highlight">Qualification Active</h2>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                      Vote for countries to qualify for the tournament
                    </p>
                  </div>
                </div>
                <CountdownTimer />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <StatCard
              icon={Users}
              label="Active Voters"
              value={isLoading ? "..." : stats.activePlayers}
              formatValue
            />
            <StatCard
              icon={TrendingUp}
              label="Total Votes"
              value={isLoading ? "..." : stats.totalVotes}
              formatValue
              valueColor="green"
            />
            <StatCard
              icon={Trophy}
              label="Prize Pool"
              value={isLoading ? "..." : `${stats.totalPrizePool.toFixed(4)} ETH`}
              valueColor="accent"
              className="col-span-2 lg:col-span-1"
            />
            <StatCard icon={Clock} label="Time Left" value="30d" className="col-span-2 lg:col-span-1" />
          </div>

          {/* View Full Statistics Button */}
          <div className="mb-6 lg:mb-8">
            <Link
              href="/stats"
              className="cm-nav-tab inline-flex items-center gap-2 px-4 py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform"
            >
              <BarChart3 className="w-5 h-5" aria-hidden="true" />
              View Full Statistics
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Top Countries */}
            <SectionCard
              title="Top 5 Countries"
              headerAction={{ label: "View All", href: "/qualification" }}
              footer={
                <Link
                  href="/qualification"
                  className="w-full cm-nav-tab py-3 rounded-sm font-bold uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <Trophy className="w-4 h-4" aria-hidden="true" />
                  Vote for Your Country
                </Link>
              }
            >
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : topCountries.length > 0 ? (
                  topCountries.map((country) => (
                    <TopListItem
                      key={country.rank}
                      rank={country.rank}
                      icon={country.flag}
                      title={country.name}
                      value={country.votes}
                      valueLabel="votes"
                      href="/qualification"
                      highlighted
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No votes yet. Be the first to vote!
                  </div>
                )}
              </div>
            </SectionCard>

            {/* How It Works */}
            <SectionCard
              title="How It Works"
              footer={
                <Link
                  href="/how-it-works"
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-sm font-bold uppercase text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Learn More
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              }
            >
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-accent/20 border border-accent flex items-center justify-center">
                    <span className="text-sm font-bold cm-highlight">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Vote with ETH</h4>
                    <p className="text-xs lg:text-sm text-muted-foreground">
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
                    <p className="text-xs lg:text-sm text-muted-foreground">
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
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Winners share 90% of prize pool proportionally based on votes
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Leaderboard Preview */}
            <SectionCard
              title="Top Voters"
              headerAction={{ label: "View All", href: "/leaderboard" }}
              footer={
                <Link
                  href="/leaderboard"
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-sm font-bold uppercase text-sm transition-colors flex items-center justify-center gap-2"
                >
                  View Leaderboard
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              }
            >
              <EmptyState
                icon={Award}
                title="Compete for the top spot"
                description="Start voting to appear on the leaderboard"
              />
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard title="Quick Actions">
              <div className="space-y-3">
                <QuickActionCard
                  icon={Trophy}
                  title="Vote for Qualification"
                  description="Support your country to qualify for the tournament"
                  href="/qualification"
                  variant="primary"
                />
                <QuickActionCard
                  icon={Zap}
                  title="My Votes"
                  description="View your voting history and active positions"
                  href="/my-bets"
                />
                <QuickActionCard
                  icon={Clock}
                  title="Match Schedule"
                  description="Available after qualification phase"
                  href="/schedule"
                  variant="disabled"
                />
              </div>
            </SectionCard>
          </div>

          {/* Important Info Banner */}
          <InfoBanner
            icon={Zap}
            title="Early Voting Advantage"
            description="Vote prices increase as more people vote. Early voters get the best prices and have a better chance of winning if their team succeeds. Don't wait - vote now!"
            action={
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1 text-xs lg:text-sm text-accent hover:text-accent/80 transition-colors font-bold"
              >
                Learn about pricing
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            }
            className="mt-6 lg:mt-8"
          />
        </main>
      </div>
    </div>
  )
}
