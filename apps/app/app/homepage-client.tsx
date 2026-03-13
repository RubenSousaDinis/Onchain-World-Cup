"use client"

import { useState, useEffect, useRef } from "react"
import { formatEth } from "@/lib/utils"
import { Trophy, Users, TrendingUp, Clock, Zap, ChevronRight, Award, BarChart3, Loader2, Wallet, Rocket, Share2 } from "lucide-react"
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
import { getDefaultChainId } from "@/lib/chain-config"
import { useAccount } from "wagmi"
import { formatEther } from "viem"
import { useProjectedEarnings } from "@/hooks/use-projected-earnings"

const LAUNCH_DATE = new Date("2026-03-27T13:00:00Z")

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

  const { address: userAddress, chain } = useAccount()
  const chainId = chain?.id || getDefaultChainId()
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

  const isPreLaunch = Date.now() < LAUNCH_DATE.getTime()

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

      {/* Launch Countdown Banner */}
      <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent/40 bg-accent/5">
        <div className="p-4 lg:p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs lg:text-sm font-bold text-accent uppercase tracking-wide">
                Mainnet Launching March 27, 2026
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Voting goes live on Base. Get ready.
              </p>
            </div>
          </div>
          <CountdownTimer endDate={LAUNCH_DATE} />
        </div>
      </div>

      {/* Pre-launch Actions */}
      {isPreLaunch && (
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-primary/30">
          <div className="bg-secondary/30 p-4 lg:p-5 border-b border-border/30">
            <h2 className="text-sm lg:text-base font-bold uppercase tracking-wide cm-highlight">
              Get Ready — Actions Before Launch
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Complete these actions now to be first when voting goes live
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 lg:p-5">
            {/* Follow on X */}
            <a
              href="https://x.com/OnchainC29697"
              target="_blank"
              rel="noopener noreferrer"
              className="cm-panel rounded-sm border border-border/50 hover:border-accent/50 p-4 flex items-center gap-3 transition-colors duration-200 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-foreground/5 border border-border/50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-foreground" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-0.5">X / Twitter</div>
                <div className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">Follow us on X</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" aria-hidden="true" />
            </a>

            {/* Share the launch tweet */}
            <a
              href="https://x.com/OnchainC29697"
              target="_blank"
              rel="noopener noreferrer"
              className="cm-panel rounded-sm border border-border/50 hover:border-accent/50 p-4 flex items-center gap-3 transition-colors duration-200 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-foreground/5 border border-border/50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-foreground" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-0.5">X / Twitter</div>
                <div className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">Share our launch tweet</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" aria-hidden="true" />
            </a>

            {/* Follow on Farcaster */}
            <a
              href="https://farcaster.xyz/onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="cm-panel rounded-sm border border-border/50 hover:border-accent/50 p-4 flex items-center gap-3 transition-colors duration-200 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-[#8A63D2]/10 border border-[#8A63D2]/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 1000 1000" fill="currentColor" className="text-[#8A63D2]" aria-hidden="true">
                  <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/>
                  <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
                  <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-0.5">Farcaster</div>
                <div className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">Follow us on Farcaster</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" aria-hidden="true" />
            </a>

            {/* Share the launch cast */}
            <a
              href="https://farcaster.xyz/onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="cm-panel rounded-sm border border-border/50 hover:border-accent/50 p-4 flex items-center gap-3 transition-colors duration-200 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-0.5">Farcaster</div>
                <div className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">Share the launch cast</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" aria-hidden="true" />
            </a>

          </div>
        </div>
      )}

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
                    {formatEth(currentEarnings)} ETH
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
                className="cm-nav-tab inline-flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-sm hover:brightness-110 transition-colors duration-200"
              >
                View Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

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
        {!isLoading && stats.totalPrizePool > 0 && (
          <StatCard
            icon={Trophy}
            label="Prize Pool"
            value={`${formatEth(stats.totalPrizePool)} ETH`}
            valueColor="accent"
            className="col-span-2 lg:col-span-1"
          />
        )}
        {isPreLaunch ? (
          <div className={`cm-panel rounded-sm p-4 col-span-2 ${!isLoading && stats.totalPrizePool > 0 ? "lg:col-span-1" : "lg:col-span-2"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-accent" aria-hidden="true" />
              <div className="text-sm lg:text-base text-muted-foreground uppercase font-bold">Voting Starts</div>
            </div>
            <CountdownTimer endDate={LAUNCH_DATE} showSeconds={false} />
          </div>
        ) : (
          <StatCard
            icon={Clock}
            label="Time Left"
            value={qualEndDate ? formatTimeLeft(qualEndDate) : "..."}
            className={`col-span-2 ${!isLoading && stats.totalPrizePool > 0 ? "lg:col-span-1" : "lg:col-span-2"}`}
          />
        )}
      </div>

      {/* View Full Statistics Button */}
      <div className="mb-6 lg:mb-8">
        <Link
          href="/stats"
          className="cm-nav-tab inline-flex items-center gap-2 px-4 py-3 rounded-sm font-bold uppercase text-sm hover:brightness-110 transition-colors duration-200"
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
              className="w-full cm-nav-tab py-3 rounded-sm font-bold uppercase text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-colors duration-200"
            >
              <Trophy className="w-4 h-4" aria-hidden="true" />
              Vote for Your Country
            </Link>
          }
        >
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground" role="status" aria-live="polite">Loading...</div>
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
              <div className="text-center py-8 text-muted-foreground" role="status" aria-live="polite">Loading...</div>
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
            {isPreLaunch ? (
              <>
                <QuickActionCard
                  icon={Trophy}
                  title="Vote for Qualification"
                  description="Opens March 27 — mainnet launch"
                  href="/qualification"
                  variant="disabled"
                />
                <QuickActionCard
                  icon={Zap}
                  title="How It Works"
                  description="Learn about voting, pricing, and rewards"
                  href="/how-it-works"
                />
                <QuickActionCard
                  icon={Clock}
                  title="Match Schedule"
                  description="Available after qualification phase"
                  href="/schedule"
                  variant="disabled"
                />
              </>
            ) : (
              <>
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
                  href="/profile"
                />
                <QuickActionCard
                  icon={Clock}
                  title="Match Schedule"
                  description="Available after qualification phase"
                  href="/schedule"
                  variant="disabled"
                />
              </>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Important Info Banner */}
      <InfoBanner
        icon={Zap}
        title={isPreLaunch ? "Early Voting Advantage" : "Early Voting Advantage"}
        description={
          isPreLaunch
            ? "Voting opens March 27 on Base mainnet. Early voters get the best prices — prices increase as more people vote. Follow us to be notified the moment voting goes live."
            : "Vote prices increase as more people vote. Early voters get the best prices and have a better chance of winning if their team succeeds. Don't wait - vote now!"
        }
        action={
          isPreLaunch ? (
            <a
              href="https://farcaster.xyz/onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs lg:text-sm text-accent hover:text-accent/80 transition-colors font-bold"
            >
              Follow on Farcaster
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </a>
          ) : (
            <Link
              href="/qualification"
              className="inline-flex items-center gap-1 text-xs lg:text-sm text-accent hover:text-accent/80 transition-colors font-bold"
            >
              Vote for your country
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          )
        }
        className="mt-6 lg:mt-8"
      />
    </>
  )
}
