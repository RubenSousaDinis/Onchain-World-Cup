"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Users, TrendingUp, Clock, Zap, ChevronRight, Award, BarChart3, Loader2, Wallet } from "lucide-react"
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
import { useClaimable, useQualificationEndTime, isQualificationContractAvailable } from "@/lib/contracts/qualification"
import { useAccount, useChainId } from "wagmi"
import { formatEther } from "viem"
import { useProjectedEarnings } from "@/hooks/use-projected-earnings"

type CountryStats = {
  country_code: string
  total_votes: number
  total_eth: string
}

type TopVoter = {
  rank: number
  wallet_address: string
  qualification_votes: number
  qualification_spent_eth: string
  countries_voted_for: number
  farcaster_name?: string | null
  farcaster_avatar?: string | null
  ens_name?: string | null
}

type SummaryData = {
  totalVotes: number
  totalEth: string
  totalVoters: number
  topCountries: CountryStats[]
  topVoters: TopVoter[]
}

function formatTimeLeft(end: Date): string {
  const diffSecs = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000))
  if (diffSecs === 0) return "Ended"
  const days = Math.floor(diffSecs / 86400)
  const hours = Math.floor((diffSecs % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  const minutes = Math.floor((diffSecs % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function HomePageClient() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isFetchingRef = useRef(false)

  const { address: userAddress } = useAccount()
  const chainId = useChainId()
  const isContractAvailable = isQualificationContractAvailable(chainId)
  const { data: claimableWei } = useClaimable(chainId, userAddress)
  const { projectedEarnings } = useProjectedEarnings(userAddress)

  const { data: qualEndTimestamp } = useQualificationEndTime(chainId)
  const qualEndDate = qualEndTimestamp ? new Date(Number(qualEndTimestamp) * 1000) : undefined

  const actualEarnings = claimableWei ? parseFloat(formatEther(claimableWei)) : 0
  const currentEarnings = actualEarnings > 0 ? actualEarnings : projectedEarnings
  const isProjected = actualEarnings === 0 && projectedEarnings > 0

  useEffect(() => {
    const fetchData = async (isRefresh = false, eventTimestamp?: number) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      try {
        if (isRefresh) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        const cacheBuster = isRefresh && eventTimestamp ? `?t=${eventTimestamp}` : ""
        const res = await fetch(`/api/qualification/summary${cacheBuster}`)

        if (res.ok) {
          const response = await res.json()
          const apiData = response.data
          setSummaryData({
            totalVotes: apiData?.total_votes || 0,
            totalEth: apiData?.total_eth || "0",
            totalVoters: apiData?.total_voters || 0,
            topCountries: apiData?.top_countries || [],
            topVoters: apiData?.top_voters || [],
          })
        }

        if (isRefresh) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error("Failed to fetch summary data:", error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        isFetchingRef.current = false
      }
    }

    fetchData()

    const handleVoteRecorded = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.modalClosed) {
        fetchData(true, customEvent.detail?.timestamp || Date.now())
      }
    }
    window.addEventListener("vote-recorded", handleVoteRecorded)

    const interval = setInterval(() => fetchData(true), 30000)

    return () => {
      clearInterval(interval)
      window.removeEventListener("vote-recorded", handleVoteRecorded)
    }
  }, [])

  const topCountries = (summaryData?.topCountries || [])
    .map((stats, index) => {
      const countryData = countriesDataStatic.find((c) => c.code === stats.country_code)
      return {
        rank: index + 1,
        name: countryData?.name || stats.country_code,
        flag: countryData?.flagEmoji || "🏳️",
        votes: stats.total_votes,
      }
    })
    .slice(0, 5)

  const stats = {
    totalVotes: summaryData?.totalVotes || 0,
    totalPrizePool: parseFloat(summaryData?.totalEth || "0"),
    activePlayers: summaryData?.totalVoters || 0,
  }

  return (
    <>
      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="cm-panel rounded-sm overflow-hidden border-2 border-accent bg-accent/10 shadow-lg">
            <div className="px-6 py-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <span className="text-sm lg:text-base font-bold text-accent">Updating stats...</span>
            </div>
          </div>
        </div>
      )}

      {/* Mainnet Launch Banner */}
      <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-primary/40 bg-primary/5">
        <div className="p-3 lg:p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
            <p className="text-xs lg:text-sm font-bold text-primary uppercase tracking-wide">
              Testnet — Mainnet launching late March 2026
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Votes placed now on testnet will not carry over to mainnet.
          </p>
        </div>
      </div>

      {/* User Earnings Card */}
      {userAddress && isContractAvailable && currentEarnings > 0 && (
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-green-400/30">
          <div className="bg-green-400/10 p-4 lg:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 lg:w-8 lg:h-8 text-green-400" aria-hidden="true" />
                <div>
                  <div className="text-xs lg:text-sm text-green-400 font-bold uppercase mb-1">
                    {isProjected ? "Projected Earnings" : "Your Earnings"}
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-green-400 font-mono">
                    {currentEarnings.toFixed(4)} ETH
                  </h2>
                  <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                    {isProjected
                      ? "Based on current top 48 standings"
                      : "Claimable winnings from qualification phase"}
                  </p>
                </div>
              </div>
              <Link
                href={`/users/${userAddress}`}
                className="cm-nav-tab inline-flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-sm hover:scale-105 transition-transform"
              >
                View Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

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
            <CountdownTimer endDate={qualEndDate} />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
        <StatCard icon={Users} label="Active Voters" value={isLoading ? "..." : stats.activePlayers} formatValue />
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
        <StatCard
          icon={Clock}
          label="Time Left"
          value={qualEndDate ? formatTimeLeft(qualEndDate) : "..."}
          className="col-span-2 lg:col-span-1"
        />
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
              <div className="text-center py-8 text-muted-foreground">No votes yet. Be the first to vote!</div>
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
                <h3 className="text-sm font-bold text-foreground mb-1">Vote with ETH</h3>
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
                <h3 className="text-sm font-bold text-foreground mb-1">Dynamic Pricing</h3>
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
                <h3 className="text-sm font-bold text-foreground mb-1">Win Rewards</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Winners share 90% of prize pool proportionally based on votes
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Top Voters — avatars are lazy-loaded; below the fold on desktop */}
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
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (summaryData?.topVoters || []).length > 0 ? (
              (summaryData?.topVoters || []).map((voter) => {
                const displayName =
                  voter.farcaster_name ||
                  voter.ens_name ||
                  `${voter.wallet_address.slice(0, 6)}...${voter.wallet_address.slice(-4)}`
                const shortAddress = `${voter.wallet_address.slice(0, 6)}...${voter.wallet_address.slice(-4)}`
                const hasName = !!(voter.farcaster_name || voter.ens_name)
                const avatar = voter.farcaster_avatar
                return (
                  <TopListItem
                    key={voter.wallet_address}
                    rank={voter.rank}
                    icon={
                      avatar ? (
                        <img
                          src={avatar}
                          alt={displayName}
                          width={32}
                          height={32}
                          loading="lazy"
                          decoding="async"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )
                    }
                    title={displayName}
                    subtitle={hasName ? shortAddress : undefined}
                    value={voter.qualification_votes}
                    valueLabel="votes"
                    href={`/users/${voter.wallet_address}`}
                    highlighted
                  />
                )
              })
            ) : (
              <EmptyState
                icon={Award}
                title="Compete for the top spot"
                description="Start voting to appear on the leaderboard"
              />
            )}
          </div>
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
    </>
  )
}
