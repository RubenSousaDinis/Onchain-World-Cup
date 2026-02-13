"use client"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft, Trophy, TrendingUp, DollarSign, Share2, Wallet } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ShareModal } from "@/components/share-modal"
import { getCountryName, getCountryFlag } from "@/lib/countries"
import { InlineLoader } from "@/components/states"
import { useClaimable, isQualificationContractAvailable } from "@/lib/contracts/qualification"
import { useChainId } from "wagmi"
import { formatEther } from "viem"
import { useProjectedEarnings } from "@/hooks/use-projected-earnings"
import { useAchievements } from "@/hooks/use-achievements"
import { LevelBadge } from "@/components/level-badge"

type UserVote = {
  id: string
  country_code: string
  voter_address: string
  vote_count: number
  total_cost_eth: string
  tx_hash: string
  created_at: string
}

type UserData = {
  wallet_address: string
  qualification_votes: number
  qualification_spent_eth: string
  qualification_won_eth: string
  countries_voted_for: number
  rank: number | null
  votes: UserVote[]
  user?: {
    farcaster_username?: string
    farcaster_pfp_url?: string
  }
}

type FavoriteCountry = {
  countryCode: string
  countryName: string
  flagEmoji: string
  totalVotes: number
  totalEth: number
}

export function UserProfilePageClient({ address }: { address: string }) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  // Get current chain and fetch claimable earnings
  const chainId = useChainId()
  const isContractAvailable = isQualificationContractAvailable(chainId)
  const { data: claimableWei, isLoading: isLoadingClaimable } = useClaimable(
    chainId,
    address as `0x${string}`
  )

  // Calculate projected earnings based on current top 48
  const {
    projectedEarnings,
    isLoading: isLoadingProjected,
  } = useProjectedEarnings(address)

  // Compute achievements and level for this user
  const { level, totalPoints } = useAchievements(address)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/users/${address}`)
        if (!res.ok) {
          throw new Error("User not found")
        }
        const response = await res.json()
        setUserData(response.data)
      } catch (err) {
        console.error("Failed to fetch user data:", err)
        setError(err instanceof Error ? err.message : "Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    if (address) {
      fetchUserData()
    }
  }, [address])

  // Calculate favorite countries from votes
  const calculateFavoriteCountries = (votes: UserVote[]): FavoriteCountry[] => {
    const countryMap = new Map<string, { voteCount: number; ethSpent: number }>()

    votes.forEach((vote) => {
      const existing = countryMap.get(vote.country_code) || { voteCount: 0, ethSpent: 0 }
      countryMap.set(vote.country_code, {
        voteCount: existing.voteCount + vote.vote_count,
        ethSpent: existing.ethSpent + parseFloat(vote.total_cost_eth),
      })
    })

    return Array.from(countryMap.entries())
      .map(([code, data]) => ({
        countryCode: code,
        countryName: getCountryName(code) || code,
        flagEmoji: getCountryFlag(code) || "🏳️",
        totalVotes: data.voteCount,
        totalEth: data.ethSpent,
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 3)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <RetroSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-24 p-8 pb-20 lg:pb-8">
          <div className="cm-panel rounded-sm p-12 text-center">
            <InlineLoader text="Loading user profile..." />
          </div>
        </main>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex">
        <RetroSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-24 p-8 pb-20 lg:pb-8">
          <div className="cm-panel p-8 rounded-sm text-center">
            <p className="text-muted-foreground mb-4">{error || "User not found"}</p>
            <Link href="/leaderboard" className="cm-nav-tab inline-block px-6 py-2">
              Back to Leaderboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const favoriteCountries = calculateFavoriteCountries(userData.votes || [])
  const totalVotes = userData.qualification_votes || 0
  const totalSpent = parseFloat(userData.qualification_spent_eth || "0")
  const totalWon = parseFloat(userData.qualification_won_eth || "0")
  const rank = userData.rank || null
  const hasFarcaster = !!userData.user?.farcaster_username
  const farcasterUsername = userData.user?.farcaster_username
  const farcasterPfp = userData.user?.farcaster_pfp_url

  // Calculate current earnings from contract (or use projected if not finalized)
  const actualEarnings = claimableWei ? parseFloat(formatEther(claimableWei)) : 0
  const currentEarnings = actualEarnings > 0 ? actualEarnings : projectedEarnings
  const isProjected = actualEarnings === 0 && projectedEarnings > 0

  // For share modal
  const favoriteTeam = favoriteCountries[0] || {
    countryName: "N/A",
    flagEmoji: "🏳️",
  }

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Back Button */}
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-sm lg:text-base text-accent hover:text-accent/80 mb-4 lg:mb-6"
        >
          <ArrowLeft className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          Back to Leaderboard
        </Link>

        {/* User Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
              {hasFarcaster && farcasterPfp ? (
                <img
                  src={farcasterPfp}
                  alt={farcasterUsername}
                  className="w-16 lg:w-24 h-16 lg:h-24 rounded-full border-4 border-primary"
                />
              ) : (
                <div className="w-16 lg:w-24 h-16 lg:h-24 rounded-full bg-primary flex items-center justify-center">
                  <Trophy className="w-8 lg:w-12 h-8 lg:h-12 text-primary-foreground" />
                </div>
              )}
              <div className="text-center lg:text-left flex-1 min-w-0">
                {hasFarcaster ? (
                  <>
                    <div className="text-xs lg:text-sm text-muted-foreground mb-1">Farcaster User</div>
                    <h1 className="text-lg lg:text-2xl font-bold cm-highlight mb-2">
                      @{farcasterUsername}
                    </h1>
                    <div className="text-xs lg:text-sm text-muted-foreground font-mono break-all">
                      {address}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs lg:text-sm text-muted-foreground mb-1">Wallet Address</div>
                    <h1 className="text-base lg:text-xl font-bold cm-highlight font-mono mb-2 break-all">
                      {address}
                    </h1>
                  </>
                )}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm mt-2">
                  {rank && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Rank:</span>
                      <span className="cm-highlight font-bold">#{rank}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Countries:</span>
                    <span className="text-accent font-bold">{userData.countries_voted_for}</span>
                  </div>
                  <LevelBadge level={level} points={totalPoints} showPoints />
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="cm-nav-tab flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-sm hover:scale-105 transition-transform flex-shrink-0"
                aria-label="Share stats"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">ETH Spent</div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold cm-highlight font-mono">
              {totalSpent.toFixed(4)} ETH
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              During qualification phase
            </div>
          </div>

          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">Total Votes</div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-foreground font-mono">
              {totalVotes.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Across {userData.countries_voted_for} countries
            </div>
          </div>

          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">
                {isProjected ? "Projected Earnings" : "Current Earnings"}
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-green-400 font-mono">
              {isLoadingClaimable || isLoadingProjected ? (
                <span className="text-base">Loading...</span>
              ) : currentEarnings > 0 ? (
                <>{currentEarnings.toFixed(4)} ETH</>
              ) : !isContractAvailable ? (
                <span className="text-base text-muted-foreground">N/A</span>
              ) : (
                <span className="text-base text-muted-foreground">0.0000 ETH</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isLoadingClaimable || isLoadingProjected
                ? "Calculating..."
                : currentEarnings > 0
                ? isProjected
                  ? "Based on current top 48"
                  : "Claimable winnings"
                : !isContractAvailable
                ? "Switch to Base Sepolia"
                : "No earnings yet"}
            </div>
          </div>

          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">Avg. Cost</div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-accent font-mono">
              {totalVotes > 0 ? (totalSpent / totalVotes).toFixed(6) : "0.000000"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">ETH per vote</div>
          </div>
        </div>

        {/* Favorite Teams */}
        {favoriteCountries.length > 0 && (
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">FAVORITE COUNTRIES</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {favoriteCountries.map((country) => (
                  <Link
                    key={country.countryCode}
                    href={`/qualification/${country.countryCode.toLowerCase()}`}
                    className="cm-hover-row p-4 rounded-sm flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-3xl flex-shrink-0">{country.flagEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{country.countryName}</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {country.totalVotes} votes
                      </div>
                      <div className="text-xs lg:text-sm text-accent font-mono mt-1">
                        {country.totalEth.toFixed(4)} ETH
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vote History */}
        <div className="cm-panel rounded-sm overflow-hidden">
          <div className="cm-section-header px-4 py-2">
            <h3 className="text-sm font-bold">RECENT VOTES</h3>
          </div>
          <div className="p-4">
            {!userData.votes || userData.votes.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">No votes yet</p>
                <Link
                  href="/qualification"
                  className="inline-block cm-nav-tab px-6 py-3 rounded-sm font-bold uppercase text-sm"
                >
                  Start Voting
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userData.votes.map((vote) => {
                  const countryName = getCountryName(vote.country_code)
                  const countryFlag = getCountryFlag(vote.country_code)
                  const date = new Date(vote.created_at)

                  return (
                    <Link
                      key={vote.id}
                      href={`/qualification/${vote.country_code.toLowerCase()}`}
                      className="cm-hover-row p-4 rounded-sm block"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">{countryFlag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold truncate">{countryName}</div>
                            <div className="text-xs lg:text-sm text-muted-foreground">
                              {date.toLocaleDateString()} at {date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold cm-highlight font-mono">
                            {vote.vote_count} votes
                          </div>
                          <div className="text-xs lg:text-sm text-accent font-mono">
                            {parseFloat(vote.total_cost_eth).toFixed(4)} ETH
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="user-stats"
        data={{
          userStats: {
            ethSpent: totalSpent.toFixed(3),
            currentEarnings: currentEarnings.toFixed(4),
            favoriteCountry: favoriteTeam.countryName,
            favoriteCountryFlag: favoriteTeam.flagEmoji,
            totalVotes: totalVotes,
            rank: rank ?? undefined,
            levelNum: level.level,
            levelName: level.name,
            achievementPoints: totalPoints,
          },
        }}
      />
    </div>
  )
}
