"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { RetroNavTabs } from "@/components/retro-nav-tabs"
import { Trophy, Medal, TrendingUp, Zap, Target, Clock, Share2, Award } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"
import { InlineLoader, NoLeaderboardData, NoSearchResults } from "@/components/states"
import { type LeaderboardEntry } from "@/lib/mock-data/leaderboard-data"
import { getCountryName, getCountryFlag } from "@/lib/countries"
import { ShareModal } from "@/components/share-modal"
import { LevelBadge } from "@/components/level-badge"
import { computeLevel } from "@/lib/achievements"
import { WalletName, useWalletDisplayName } from "@/components/wallet-name"

type LeaderboardCategory = "successful" | "largest" | "active" | "early" | "achievements"

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>("successful")
  const [displayedCount, setDisplayedCount] = useState(10)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const isFetchingRef = useRef(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (isFetchingRef.current) return

      isFetchingRef.current = true
      setIsLoading(true)

      try {
        const res = await fetch(`/api/leaderboard?category=${activeCategory}&limit=100&offset=0`)
        if (res.ok) {
          const response = await res.json()
          const data = response.data || []

          // Format "largest" category data to include country names and flags
          if (activeCategory === 'largest') {
            const formattedData = data.map((entry: LeaderboardEntry) => {
              if (entry.team) {
                const countryName = getCountryName(entry.team)
                const countryFlag = getCountryFlag(entry.team)
                return {
                  ...entry,
                  matchName: `${countryFlag} ${countryName}`,
                  team: countryName,
                }
              }
              return entry
            })
            setLeaderboardData(formattedData)
          } else {
            setLeaderboardData(data)
          }

          setTotalCount(response.count || 0)
        } else {
          console.error('Failed to fetch leaderboard:', res.statusText)
          setLeaderboardData([])
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setLeaderboardData([])
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
      }
    }

    fetchLeaderboard()
  }, [activeCategory])

  const filteredLeaderboard = leaderboardData.filter(
    (entry) =>
      entry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.farcasterName && entry.farcasterName.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const { sentinelRef, shouldLoadMore } = useInfiniteScroll({
    hasMore: displayedCount < filteredLeaderboard.length,
    isLoading: isLoadingMore,
  })

  useEffect(() => {
    if (shouldLoadMore) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedCount((prev) => Math.min(prev + 10, filteredLeaderboard.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadMore, filteredLeaderboard.length])

  // Reset displayed count when search or category changes
  useEffect(() => {
    setDisplayedCount(10)
  }, [searchQuery, activeCategory])

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold mb-2">
                  <span className="cm-highlight">Leaderboards</span>
                </h1>
                <p className="text-sm lg:text-base text-foreground/80">
                  Top performers ranked across different categories • Base Network
                </p>
              </div>
              {activeCategory === "largest" && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="cm-nav-tab flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-sm hover:scale-105 transition-transform flex-shrink-0"
                  aria-label="Share leaderboard"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 lg:mb-8">
          <div className="flex gap-1 flex-wrap overflow-x-auto pb-2 scrollbar-hide max-w-full">
            <button
              onClick={() => setActiveCategory("successful")}
              className={`cm-nav-tab flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-sm text-sm lg:text-base font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
                activeCategory === "successful" ? "active" : ""
              }`}
              aria-label="View top spenders by total ETH spent in qualification"
            >
              <Trophy className="w-4 h-4" />
              Top Spenders
            </button>
            <button
              onClick={() => setActiveCategory("largest")}
              className={`cm-nav-tab flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-sm text-sm lg:text-base font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
                activeCategory === "largest" ? "active" : ""
              }`}
            >
              <Target className="w-4 h-4" />
              Biggest Vote
            </button>
            <button
              onClick={() => setActiveCategory("active")}
              className={`cm-nav-tab flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-sm text-sm lg:text-base font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
                activeCategory === "active" ? "active" : ""
              }`}
            >
              <Zap className="w-4 h-4" />
              Most Votes
            </button>
            <button
              onClick={() => setActiveCategory("early")}
              className={`cm-nav-tab flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-sm text-sm lg:text-base font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
                activeCategory === "early" ? "active" : ""
              }`}
            >
              <Clock className="w-4 h-4" />
              Early Birds
            </button>
            <button
              onClick={() => setActiveCategory("achievements")}
              className={`cm-nav-tab flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-sm text-sm lg:text-base font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
                activeCategory === "achievements" ? "active" : ""
              }`}
            >
              <Award className="w-4 h-4" />
              Achievements
            </button>
          </div>
        </div>

        {/* Category Description */}
        <div className="mb-4">
          <p className="text-sm lg:text-base text-muted-foreground">
            {getCategoryDescription(activeCategory)}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 lg:mb-8">
          <div className="cm-panel rounded-sm p-3 lg:p-4 flex items-center gap-3 max-w-md">
            <svg
              className="w-4 h-4 text-muted-foreground flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by address or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="cm-panel rounded-sm p-8 text-center">
            <InlineLoader text="Loading leaderboard..." />
          </div>
        )}

        {/* Top 3 Podium */}
        {!isLoading && filteredLeaderboard.length >= 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {/* 1st Place */}
            <div className="cm-panel rounded-sm p-4 lg:p-6 flex flex-col items-center border-2 border-primary/50 lg:order-2 bg-secondary/20">
              {filteredLeaderboard[0].farcasterAvatar ? (
                <img
                  src={filteredLeaderboard[0].farcasterAvatar || "/placeholder.svg"}
                  alt={filteredLeaderboard[0].farcasterName ? `Profile photo of ${filteredLeaderboard[0].farcasterName}` : ""}
                  className="w-16 lg:w-20 h-16 lg:h-20 rounded-full mb-3 border-4 border-primary shadow-lg object-cover"
                />
              ) : (
                <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full bg-primary flex items-center justify-center mb-3 shadow-lg">
                  <Trophy className="w-8 lg:w-10 h-8 lg:h-10 text-primary-foreground" />
                </div>
              )}
              <div className="text-sm lg:text-base cm-highlight mb-1 font-bold uppercase">1st Place</div>
              <div className="text-sm lg:text-base font-bold text-foreground mb-2">
                <WalletName address={filteredLeaderboard[0].address} farcasterName={filteredLeaderboard[0].farcasterName} ensName={filteredLeaderboard[0].ensName} />
              </div>
              {renderCategorySpecificStat(filteredLeaderboard[0], activeCategory, "large")}
            </div>

            {/* 2nd Place */}
            <div className="cm-panel rounded-sm p-4 lg:p-6 flex flex-col items-center lg:justify-end lg:order-1 bg-secondary/10">
              {filteredLeaderboard[1].farcasterAvatar ? (
                <img
                  src={filteredLeaderboard[1].farcasterAvatar || "/placeholder.svg"}
                  alt={filteredLeaderboard[1].farcasterName ? `Profile photo of ${filteredLeaderboard[1].farcasterName}` : ""}
                  className="w-14 lg:w-16 h-14 lg:h-16 rounded-full mb-3 border-2 border-muted shadow-lg object-cover"
                />
              ) : (
                <div className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Medal className="w-7 lg:w-8 h-7 lg:h-8 text-muted-foreground" />
                </div>
              )}
              <div className="text-sm lg:text-base text-foreground/70 mb-1 uppercase font-bold">2nd Place</div>
              <div className="text-sm lg:text-base font-bold text-foreground mb-2">
                <WalletName address={filteredLeaderboard[1].address} farcasterName={filteredLeaderboard[1].farcasterName} ensName={filteredLeaderboard[1].ensName} />
              </div>
              {renderCategorySpecificStat(filteredLeaderboard[1], activeCategory, "medium")}
            </div>

            {/* 3rd Place */}
            <div className="cm-panel rounded-sm p-4 lg:p-6 flex flex-col items-center lg:justify-end lg:order-3 bg-secondary/10">
              {filteredLeaderboard[2].farcasterAvatar ? (
                <img
                  src={filteredLeaderboard[2].farcasterAvatar || "/placeholder.svg"}
                  alt={filteredLeaderboard[2].farcasterName ? `Profile photo of ${filteredLeaderboard[2].farcasterName}` : ""}
                  className="w-14 lg:w-16 h-14 lg:h-16 rounded-full mb-3 border-2 border-muted shadow-lg object-cover"
                />
              ) : (
                <div className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <TrendingUp className="w-7 lg:w-8 h-7 lg:h-8 text-muted-foreground" />
                </div>
              )}
              <div className="text-sm lg:text-base text-foreground/70 mb-1 uppercase font-bold">3rd Place</div>
              <div className="text-sm lg:text-base font-bold text-foreground mb-2">
                <WalletName address={filteredLeaderboard[2].address} farcasterName={filteredLeaderboard[2].farcasterName} ensName={filteredLeaderboard[2].ensName} />
              </div>
              {renderCategorySpecificStat(filteredLeaderboard[2], activeCategory, "medium")}
            </div>
          </div>
        )}

        {/* Complete Rankings Table */}
        {!isLoading && (
          <div className="cm-panel rounded-sm overflow-hidden max-w-full">
          <div className="bg-secondary/40 px-3 lg:px-4 py-3 border-b-2 border-border">
            <h3 className="text-sm lg:text-base font-bold cm-highlight uppercase">Complete Rankings</h3>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[600px]">
              <thead className="bg-secondary/30 border-b-2 border-border">
                <tr>
                  {renderTableHeaders(activeCategory)}
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <div className="py-8">
                        {searchQuery ? <NoSearchResults query={searchQuery} /> : <NoLeaderboardData />}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.slice(0, displayedCount).map((entry, index) => (
                    <tr
                      key={entry.address}
                      className={`border-b border-border hover:bg-secondary/20 transition-colors ${index % 2 === 0 ? "bg-card/30" : "bg-card/10"}`}
                    >
                      {renderTableRow(entry, activeCategory)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {displayedCount < filteredLeaderboard.length && (
              <div ref={sentinelRef} className="p-4 text-center border-t border-border">
                <InlineLoader text="Loading more users..." />
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="leaderboard"
        data={{
          topCountries: leaderboardData.slice(0, 5).map((entry, index) => ({
            rank: index + 1,
            name: entry.team || entry.matchName || "Unknown",
            flag: entry.team ? getCountryFlag(entry.address.slice(0, 2).toUpperCase()) : "🏳️",
            votes: entry.value || 0,
          })),
        }}
      />
    </div>
  )
}

// Format ETH values without trailing zeros (e.g. 0.0055 not 0.005500)
const formatEth = (val: string | number | null | undefined): string =>
  parseFloat(parseFloat(String(val || '0')).toFixed(6)).toString()

// Helper function to get category description
function getCategoryDescription(category: LeaderboardCategory): string {
  switch (category) {
    case "successful":
      return "Ranked by total ETH spent on qualification votes. More ETH = more votes = better positions."
    case "largest":
      return "Users who placed the single biggest vote transaction, ranked by that one vote's ETH value."
    case "active":
      return "Ranked by total votes cast across all countries. Pure participation — every vote counts."
    case "early":
      return "Ranked by when they first voted. Early voters pay less per vote, so their average cost is lower."
    case "achievements":
      return "Users ranked by total achievement points. Earn points by hitting milestones — votes, countries, ETH spent, and more."
    default:
      return ""
  }
}

// Helper function to render category-specific stats for podium
function renderCategorySpecificStat(entry: LeaderboardEntry, category: LeaderboardCategory, size: "large" | "medium") {
  const largeText = "text-2xl lg:text-3xl"
  const mediumText = "text-xl lg:text-2xl"
  const textSize = size === "large" ? largeText : mediumText

  switch (category) {
    case "successful":
      return (
        <>
          <div className={`${textSize} font-bold cm-highlight font-mono mb-1`}>{formatEth(entry.totalWinnings)} ETH</div>
          <div className="text-sm lg:text-base text-accent font-bold mb-1">{entry.totalVotes} Total Votes</div>
          <div className="text-sm lg:text-base text-muted-foreground">{entry.totalBets || 0} Countries</div>
        </>
      )
    case "largest":
      return (
        <>
          <div className={`${textSize} font-bold cm-highlight font-mono mb-1`}>{formatEth(entry.largestVote)} ETH</div>
          <div className="text-sm lg:text-base text-accent font-bold mb-1 text-center">{entry.matchName}</div>
          <div className="text-sm lg:text-base text-muted-foreground">Voted: {entry.team}</div>
        </>
      )
    case "active":
      return (
        <>
          <div className={`${textSize} font-bold cm-highlight font-mono mb-1`}>{entry.totalVotes}</div>
          <div className="text-sm lg:text-base text-accent font-bold mb-1">{entry.totalBets || 0} Countries</div>
          <div className="text-sm lg:text-base text-muted-foreground">{formatEth(entry.totalWinnings)} ETH</div>
        </>
      )
    case "early":
      return (
        <>
          <div className={`${textSize} font-bold cm-highlight font-mono mb-1`}>{entry.totalVotes}</div>
          <div className="text-sm lg:text-base text-accent font-bold mb-1">{formatEth(entry.totalWinnings)} ETH</div>
          <div className="text-sm lg:text-base text-muted-foreground">
            {entry.totalVotes > 0
              ? `${formatEth(parseFloat(entry.totalWinnings || '0') / entry.totalVotes)} ETH/vote`
              : 'No votes yet'}
          </div>
        </>
      )
    case "achievements": {
      const pts = entry.achievementPoints ?? 0
      const lvl = computeLevel(pts)
      return (
        <>
          <div className={`${textSize} font-bold cm-highlight font-mono mb-1`}>{pts} pts</div>
          <div className="mb-1"><LevelBadge level={lvl} points={pts} size="md" /></div>
          <div className="text-sm lg:text-base text-muted-foreground">{entry.totalVotes} votes</div>
        </>
      )
    }
  }
}

// Helper function to render table headers based on category
function renderTableHeaders(category: LeaderboardCategory) {
  const baseHeaders = (
    <>
      <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-bold cm-highlight uppercase">Rank</th>
      <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-bold cm-highlight uppercase">User</th>
    </>
  )

  switch (category) {
    case "successful":
      return (
        <>
          {baseHeaders}
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Total Votes
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            ETH Spent
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Countries
          </th>
        </>
      )
    case "largest":
      return (
        <>
          {baseHeaders}
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Largest Vote
          </th>
          <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Match
          </th>
          <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Team
          </th>
        </>
      )
    case "active":
      return (
        <>
          {baseHeaders}
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Total Votes
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Countries
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            ETH Spent
          </th>
        </>
      )
    case "early":
      return (
        <>
          {baseHeaders}
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Total Votes
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            ETH Spent
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Avg. Cost
          </th>
        </>
      )
    case "achievements":
      return (
        <>
          {baseHeaders}
          <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Level
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Points
          </th>
          <th className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase whitespace-nowrap">
            Votes
          </th>
        </>
      )
  }
}

// Renders name + optional address sub-line with ENS fallback
function LeaderboardUserName({ address, farcasterName, ensName, achievementPoints }: {
  address: string
  farcasterName: string | null
  ensName?: string | null
  achievementPoints?: number
}) {
  const { resolvedName, shortAddress, hasName } = useWalletDisplayName(address, farcasterName, ensName)

  return (
    <div className="flex flex-col min-w-0">
      <span className="flex items-center gap-1.5 min-w-0">
        <span className={`text-sm lg:text-base font-bold truncate ${!hasName ? 'font-mono' : ''}`}>
          {resolvedName ?? shortAddress}
        </span>
        {achievementPoints !== undefined && (
          <LevelBadge level={computeLevel(achievementPoints)} points={achievementPoints} size="sm" />
        )}
      </span>
      {hasName && (
        <span className="text-sm lg:text-base text-muted-foreground font-mono">{shortAddress}</span>
      )}
    </div>
  )
}

// Helper function to render table rows based on category
function renderTableRow(entry: LeaderboardEntry, category: LeaderboardCategory) {
  const userCell = (
    <>
      <td className="px-3 lg:px-4 py-3">
        <div className="flex items-center gap-2">
          {entry.rank === 1 && <Trophy className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-primary" />}
          {entry.rank === 2 && <Medal className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-muted-foreground" />}
          {entry.rank === 3 && <TrendingUp className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-accent" />}
          <span className="text-sm lg:text-base font-mono font-bold cm-highlight">#{entry.rank}</span>
        </div>
      </td>
      <td className="px-3 lg:px-4 py-3">
        <Link href={`/users/${entry.address}`} className="flex items-center gap-2 hover:text-primary transition-colors">
          {entry.farcasterAvatar ? (
            <img
              src={entry.farcasterAvatar || "/placeholder.svg"}
              alt={entry.farcasterName ? `Profile photo of ${entry.farcasterName}` : ""}
              className="w-6 lg:w-8 h-6 lg:h-8 rounded-full border border-border object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-6 lg:w-8 h-6 lg:h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-sm lg:text-base font-bold">?</span>
            </div>
          )}
          <LeaderboardUserName
            address={entry.address}
            farcasterName={entry.farcasterName}
            ensName={entry.ensName}
            achievementPoints={entry.achievementPoints}
          />
        </Link>
      </td>
    </>
  )

  switch (category) {
    case "successful":
      return (
        <>
          {userCell}
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono font-bold cm-highlight whitespace-nowrap">
              {entry.totalVotes}
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-accent font-bold whitespace-nowrap">
              {formatEth(entry.totalWinnings)} ETH
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-muted-foreground font-bold whitespace-nowrap">
              {entry.totalBets || 0}
            </span>
          </td>
        </>
      )
    case "largest":
      return (
        <>
          {userCell}
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-accent font-bold whitespace-nowrap">
              {formatEth(entry.largestVote)} ETH
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3">
            <span className="text-sm lg:text-base font-bold">{entry.matchName}</span>
          </td>
          <td className="px-3 lg:px-4 py-3">
            <span className="text-sm lg:text-base font-bold cm-highlight">{entry.team}</span>
          </td>
        </>
      )
    case "active":
      return (
        <>
          {userCell}
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono font-bold cm-highlight whitespace-nowrap">
              {entry.totalVotes}
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-muted-foreground font-bold whitespace-nowrap">
              {entry.totalBets || 0}
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-accent font-bold whitespace-nowrap">
              {formatEth(entry.totalWinnings)} ETH
            </span>
          </td>
        </>
      )
    case "early":
      return (
        <>
          {userCell}
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono font-bold cm-highlight whitespace-nowrap">
              {entry.totalVotes}
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-accent font-bold whitespace-nowrap">
              {formatEth(entry.totalWinnings)} ETH
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-muted-foreground font-bold whitespace-nowrap">
              {entry.totalVotes > 0
                ? formatEth(parseFloat(entry.totalWinnings || '0') / entry.totalVotes)
                : '0.000000'} ETH
            </span>
          </td>
        </>
      )
    case "achievements": {
      const pts = entry.achievementPoints ?? 0
      const lvl = computeLevel(pts)
      return (
        <>
          {userCell}
          <td className="px-3 lg:px-4 py-3">
            <LevelBadge level={lvl} points={pts} />
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono font-bold cm-highlight whitespace-nowrap">
              {pts}
            </span>
          </td>
          <td className="px-3 lg:px-4 py-3 text-right">
            <span className="text-sm lg:text-base font-mono text-muted-foreground font-bold whitespace-nowrap">
              {entry.totalVotes}
            </span>
          </td>
        </>
      )
    }
  }
}
