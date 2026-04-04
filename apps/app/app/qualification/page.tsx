"use client"

import { useState, useEffect, Fragment, useRef, useMemo } from "react"
import Link from "next/link"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { TrendingUp, TrendingDown, Minus, Clock, Trophy, Loader2, Share2, Search, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Rocket } from "lucide-react"
import dynamic from "next/dynamic"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"
import { countries as countriesData } from "@/lib/countries"
import { formatEth } from "@/lib/utils"
import { InlineLoader, NoSearchResults } from "@/components/states"
import { useAccount } from "wagmi"
import { getDefaultChainId } from "@/lib/chain-config"
import { useQualificationEndTime } from "@/lib/contracts/qualification"
import { useOnboardingContext } from "@/providers/onboarding-provider"
import { useEthPrice, ethToUsd } from "@/hooks/use-eth-price"

const LAUNCH_DATE = new Date("2026-04-09T15:00:00Z")

const QualificationVoteModal = dynamic(
  () => import("@/components/qualification-vote-modal").then((m) => m.QualificationVoteModal),
  { ssr: false },
)
const ShareModal = dynamic(
  () => import("@/components/share-modal").then((m) => m.ShareModal),
  { ssr: false },
)

type CountryStats = {
  country_code: string
  total_votes: number
  total_eth: string
  first_vote_block: number | null
  qualified: boolean
}

type Country = {
  rank: number
  name: string
  flag: string
  code: string
  votes: number
  eth: number
  firstVoteBlock: number | null
  momentum: string
}

function computeTimeLeft(end: Date) {
  const diffSecs = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000))
  return {
    days: Math.floor(diffSecs / 86400),
    hours: Math.floor((diffSecs % 86400) / 3600),
    minutes: Math.floor((diffSecs % 3600) / 60),
    seconds: diffSecs % 60,
  }
}

function VotingStartCountdown() {
  const [t, setT] = useState(() => computeTimeLeft(LAUNCH_DATE))
  useEffect(() => {
    const id = setInterval(() => setT(computeTimeLeft(LAUNCH_DATE)), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex gap-2 lg:gap-4">
      {[{ v: t.days, l: "DAYS" }, { v: t.hours, l: "HRS" }, { v: t.minutes, l: "MIN" }, { v: t.seconds, l: "SEC" }].map(
        ({ v, l }, i) => (
          <div key={l} className="flex items-center gap-2 lg:gap-4">
            {i > 0 && <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>}
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold cm-highlight">{v}</div>
              <div className="text-xs text-muted-foreground">{l}</div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default function QualificationPage() {
  const [displayedCountries, setDisplayedCountries] = useState(54)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [totalPrizePool, setTotalPrizePool] = useState(0)
  const [prizePoolUpdating, setPrizePoolUpdating] = useState(false)
  const [userVotes, setUserVotes] = useState(0)
  const [userSpentEth, setUserSpentEth] = useState(0)
  const [countryStats, setCountryStats] = useState<CountryStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [qualificationEndTime, setQualificationEndTime] = useState<number | null>(null)
  const isFetchingRef = useRef(false)
  const isFetchingUserStatsRef = useRef(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingVoteCountry, setPendingVoteCountry] = useState<Country | null>(null)
  const prevOnboardingOpenRef = useRef(false)

  const { chain, address } = useAccount()
  const { hasCompletedOnboarding, isOnboardingOpen, showOnboarding } = useOnboardingContext()
  const ethPrice = useEthPrice()
  const chainId = chain?.id || getDefaultChainId() // Use configured default chain
  const { data: endTimeFromContract, isLoading: isLoadingEndTime } = useQualificationEndTime(chainId)

  const handleForceRefresh = async () => {
    if (isSyncing || isRefreshing) return
    setIsSyncing(true)
    try {
      await Promise.all([
        fetch("/api/indexer/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chainId }),
        }),
        fetch("/api/qualification/revalidate", { method: "POST" }),
      ])
    } catch {
      // sync and revalidate are best-effort
    } finally {
      setIsSyncing(false)
    }
    // Reuse the existing refresh flow
    window.dispatchEvent(new CustomEvent("vote-recorded", { detail: { modalClosed: true, timestamp: Date.now() } }))
  }

  // Get contract address based on chain
  const contractAddress = process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET as `0x${string}` | undefined

  // Calculate average votes for momentum calculation
  const totalVotes = countryStats.reduce((sum, stat) => sum + (stat.total_votes || 0), 0)
  const averageVotes = countryStats.length > 0 ? totalVotes / countryStats.length : 0

  // Merge country data with stats from API (moved before hook)
  const allCountries = useMemo(() => {
    return countriesData.map((country) => {
      const stats = countryStats.find((s) => s.country_code === country.code)
      const votes = stats?.total_votes || 0
      const eth = parseFloat(stats?.total_eth || "0")
      const firstVoteBlock = stats?.first_vote_block ?? null

      // Calculate momentum based on votes relative to average
      let momentum = "stable"
      if (votes === 0) {
        momentum = "stable"
      } else if (votes > averageVotes * 2) {
        momentum = "critical-up" // More than 2x average
      } else if (votes > averageVotes * 1.2) {
        momentum = "up" // Above average
      } else if (votes < averageVotes * 0.5 && averageVotes > 0) {
        momentum = "critical-down" // Less than half average
      } else if (votes < averageVotes * 0.8 && averageVotes > 0) {
        momentum = "down" // Below average
      }

      return {
        rank: 0, // Will be set after sorting
        name: country.name,
        flag: country.flagEmoji,
        code: country.code,
        votes,
        eth,
        firstVoteBlock,
        momentum,
      }
    })
      .sort((a, b) => {
        if (b.votes !== a.votes) return b.votes - a.votes
        if (b.eth !== a.eth) return b.eth - a.eth
        // Earlier first vote wins the tie (null = never voted, goes last)
        const aBlock = a.firstVoteBlock ?? Number.MAX_SAFE_INTEGER
        const bBlock = b.firstVoteBlock ?? Number.MAX_SAFE_INTEGER
        return aBlock - bBlock
      })
      .map((country, index) => ({
        ...country,
        rank: index + 1,
      }))
  }, [countryStats, averageVotes])

  const filteredCountries = useMemo(() => {
    return allCountries.filter(
      (country) => country.name.toLowerCase().includes(searchQuery.toLowerCase()) || country.flag.includes(searchQuery),
    )
  }, [allCountries, searchQuery])

  // When onboarding closes (was open → now closed), open the pending vote modal
  useEffect(() => {
    if (prevOnboardingOpenRef.current && !isOnboardingOpen && pendingVoteCountry) {
      setSelectedCountry(pendingVoteCountry)
      setVoteModalOpen(true)
      setPendingVoteCountry(null)
    }
    prevOnboardingOpenRef.current = isOnboardingOpen
  }, [isOnboardingOpen, pendingVoteCountry])

  const { sentinelRef, shouldLoadMore } = useInfiniteScroll({
    hasMore: displayedCountries < filteredCountries.length,
    isLoading: isLoadingMore,
  })

  // Fetch qualification summary and countries (NOT dependent on address)
  useEffect(() => {
    const fetchPublicData = async (isRefresh = false, eventTimestamp?: number) => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) {
        console.log(`[QualificationPage] ⏱️ Skipping fetch - already in progress`)
        return
      }

      isFetchingRef.current = true
      const fetchStartTime = Date.now()
      if (eventTimestamp) {
        console.log(`[QualificationPage] ⏱️ Starting fetch ${fetchStartTime - eventTimestamp}ms after event dispatch`)
      }

      try {
        if (isRefresh) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        // Fetch summary data (includes total ETH, voters, etc.)
        // Add cache-busting for vote updates to ensure fresh data
        const cacheBuster = isRefresh && eventTimestamp ? `?t=${eventTimestamp}` : ''
        const summaryFetchStart = Date.now()
        const summaryRes = await fetch(`/api/qualification/summary${cacheBuster}`)
        console.log(`[QualificationPage] ⏱️ Summary API responded in ${Date.now() - summaryFetchStart}ms`)

        if (summaryRes.ok) {
          const summaryResponse = await summaryRes.json()
          const summaryData = summaryResponse.data
          const newPrizePool = parseFloat(summaryData?.total_eth || "0")

          // Trigger animation if prize pool changed
          if (newPrizePool !== totalPrizePool && totalPrizePool > 0) {
            setPrizePoolUpdating(true)
            setTimeout(() => setPrizePoolUpdating(false), 1000)
          }

          setTotalPrizePool(newPrizePool)

          // End time is sourced from contract via useQualificationEndTime
        }

        // Fetch country statistics
        const countriesFetchStart = Date.now()
        const countriesParams = new URLSearchParams({ limit: '200' })
        if (cacheBuster) {
          countriesParams.set('t', eventTimestamp!.toString())
        }
        const countriesRes = await fetch(`/api/qualification/countries?${countriesParams}`)
        console.log(`[QualificationPage] ⏱️ Countries API responded in ${Date.now() - countriesFetchStart}ms`)

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json()
          setCountryStats(countriesData.data || [])
        }

        console.log(`[QualificationPage] ⏱️ Total fetch time: ${Date.now() - fetchStartTime}ms`)

        // Keep spinner visible for at least 1 second for user feedback
        if (isRefresh) {
          const minDisplayStart = Date.now()
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log(`[QualificationPage] ⏱️ Minimum display delay: ${Date.now() - minDisplayStart}ms`)
        }
      } catch (error) {
        console.error("Failed to fetch qualification data:", error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        isFetchingRef.current = false
        if (eventTimestamp) {
          console.log(`[QualificationPage] ⏱️ TOTAL TIME: ${Date.now() - eventTimestamp}ms from modal close to UI update complete`)
        }
      }
    }

    fetchPublicData()

    // Listen for modal close after voting - refresh leaderboard
    const handleVoteRecorded = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.modalClosed) {
        const eventTimestamp = customEvent.detail?.timestamp || Date.now()
        console.log(`[QualificationPage] ⏱️ Received vote-recorded event at ${new Date().toISOString()}`)
        fetchPublicData(true, eventTimestamp)
      }
    }
    window.addEventListener("vote-recorded", handleVoteRecorded)

    // Refresh data every 60 seconds when page is focused (with cache-busting)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchPublicData(true, Date.now())
      }
    }, 60000)

    // Refresh immediately when the user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPublicData(true, Date.now())
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener("vote-recorded", handleVoteRecorded)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Only run once on mount

  // Fetch user stats separately when address becomes available
  useEffect(() => {
    const fetchUserStats = async (eventTimestamp?: number) => {
      if (!address) {
        setUserVotes(0)
        setUserSpentEth(0)
        return
      }

      // Prevent multiple simultaneous fetches
      if (isFetchingUserStatsRef.current) {
        console.log(`[QualificationPage] ⏱️ Skipping user stats fetch - already in progress`)
        return
      }

      isFetchingUserStatsRef.current = true
      const fetchStartTime = Date.now()
      if (eventTimestamp) {
        console.log(`[QualificationPage] ⏱️ Starting user stats fetch ${fetchStartTime - eventTimestamp}ms after event`)
      }

      try {
        // Add cache-busting for vote updates
        const cacheBuster = eventTimestamp ? `?t=${eventTimestamp}` : ''
        const userStatsRes = await fetch(`/api/users/${address}${cacheBuster}`)
        console.log(`[QualificationPage] ⏱️ User stats API responded in ${Date.now() - fetchStartTime}ms`)

        if (userStatsRes.ok) {
          const userStatsResponse = await userStatsRes.json()
          const userStatsData = userStatsResponse.data
          setUserVotes(userStatsData?.qualification_votes || 0)
          setUserSpentEth(parseFloat(userStatsData?.qualification_spent_eth || "0"))
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
      } finally {
        isFetchingUserStatsRef.current = false
      }
    }

    fetchUserStats()

    // Also listen for modal close after voting to update user stats
    const handleVoteRecorded = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.modalClosed) {
        const eventTimestamp = customEvent.detail?.timestamp || Date.now()
        console.log("[QualificationPage] Modal closed - refreshing user stats")
        fetchUserStats(eventTimestamp)
      }
    }
    window.addEventListener("vote-recorded", handleVoteRecorded)

    return () => {
      window.removeEventListener("vote-recorded", handleVoteRecorded)
    }
  }, [address]) // Only re-fetch user stats when address changes

  // Sync end time from contract (source of truth)
  useEffect(() => {
    if (endTimeFromContract) {
      setQualificationEndTime(Number(endTimeFromContract))
    }
  }, [endTimeFromContract])

  // Calculate countdown timer
  useEffect(() => {
    if (!qualificationEndTime) return

    const tick = () => {
      const now = Math.floor(Date.now() / 1000)
      const diff = qualificationEndTime - now
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / (24 * 60 * 60)),
          hours: Math.floor((diff % (24 * 60 * 60)) / (60 * 60)),
          minutes: Math.floor((diff % (60 * 60)) / 60),
          seconds: diff % 60,
        })
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    tick() // run immediately
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [qualificationEndTime])

  useEffect(() => {
    if (shouldLoadMore) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedCountries((prev) => Math.min(prev + 54, filteredCountries.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadMore, filteredCountries.length])

  const isPreLaunch = Date.now() < LAUNCH_DATE.getTime()

  const handleVote = (country: Country) => {
    if (isPreLaunch) return
    if (!hasCompletedOnboarding) {
      setPendingVoteCountry(country)
      showOnboarding({ name: country.name, flag: country.flag })
    } else {
      setSelectedCountry(country)
      setVoteModalOpen(true)
    }
  }

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "critical-up":
        return <TrendingUp className="w-4 h-4 text-green-500 animate-pulse [animation-iteration-count:5]" />
      case "critical-down":
        return <TrendingDown className="w-4 h-4 text-red-500 animate-pulse [animation-iteration-count:5]" />
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  useEffect(() => {
    setDisplayedCountries(54)
  }, [searchQuery])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <RetroSidebar />
        <MobileNav />

        <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full">
        {/* Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-4xl font-bold mb-2">
                  <span className="cm-highlight">World Cup 2026</span>{" "}Qualification
                </h1>
                <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2 mb-2 border border-border/50 rounded-sm px-3 py-2 bg-card/30 max-w-xl">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Voting requires ETH on Base. Transactions are irreversible. Only vote with ETH you can afford to lose.{" "}
                  <Link href="https://onchainworldcup.xyz/terms" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">Terms</Link></span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold mb-3 text-accent">Qualification Phase</h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleForceRefresh}
                  disabled={isSyncing || isRefreshing}
                  className="cm-nav-tab flex items-center gap-2 px-3 lg:px-4 py-2 rounded-sm font-bold text-sm hover:brightness-110 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Force refresh leaderboard"
                  title="Sync latest on-chain data and refresh"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Refresh"}</span>
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="cm-nav-tab flex items-center gap-2 px-3 lg:px-4 py-2 rounded-sm font-bold text-sm hover:brightness-110 transition-colors duration-200 flex-shrink-0"
                  aria-label="Share leaderboard"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
            <p className="text-sm lg:text-base text-foreground/80 mb-2">
              Onchain users decide who qualifies - No matches yet, pure community voting
            </p>
            <p className="text-sm lg:text-base text-foreground/70">
              Top 48 countries qualify for the tournament. Vote now to support your nation!
            </p>
          </div>
        </div>

        {/* Refreshing Indicator - Fixed position at top */}
        {isRefreshing && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div className="cm-panel rounded-sm overflow-hidden border-2 border-accent bg-accent/10 shadow-lg">
              <div className="px-6 py-3 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <span className="text-sm lg:text-base font-bold text-accent">Updating leaderboard...</span>
              </div>
            </div>
          </div>
        )}

        {/* Prize Pool - only show when there's actual ETH in the pool */}
        {totalPrizePool > 0 && (
          <div className={`cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent transition-[box-shadow] duration-300 ${prizePoolUpdating ? 'shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]' : ''}`}>
            <div className="bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-accent" />
                    <h3 className="text-base lg:text-xl font-bold text-accent uppercase">Total Prize Pool</h3>
                    <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-accent" />
                  </div>
                  <div className={`text-5xl lg:text-7xl font-bold cm-highlight transition-all duration-300 ${prizePoolUpdating ? 'scale-110' : ''}`}>
                    {formatEth(totalPrizePool)} ETH
                  </div>
                  {ethToUsd(totalPrizePool, ethPrice) && (
                    <div className="text-sm text-muted-foreground mt-1">{ethToUsd(totalPrizePool, ethPrice)}</div>
                  )}
                </div>

                {address && userVotes > 0 && (
                  <>
                    <div className="hidden lg:block w-px h-24 bg-accent/30" />
                    <div className="flex flex-col items-center text-center flex-1">
                      <h3 className="text-base lg:text-xl font-bold text-accent uppercase mb-2">Your Contribution</h3>
                      <div className="text-3xl lg:text-4xl font-bold cm-highlight mb-1">
                        {userVotes.toLocaleString()} Vote{userVotes !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xl lg:text-2xl font-bold text-foreground/70">
                        {formatEth(userSpentEth)} ETH
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent/30">
          <div className="bg-secondary/40 p-4 lg:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {isPreLaunch ? (
                <>
                  <div className="flex items-center gap-3">
                    <Rocket className="w-6 h-6 text-accent" />
                    <div>
                      <h3 className="text-sm lg:text-base font-bold cm-highlight">Voting Starts In</h3>
                      <p className="text-sm lg:text-base text-muted-foreground">Vote early for the best prices</p>
                    </div>
                  </div>
                  <VotingStartCountdown />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-accent" />
                    <div>
                      <h3 className="text-sm lg:text-base font-bold cm-highlight">Qualification Ends In</h3>
                      <p className="text-sm lg:text-base text-muted-foreground">Vote early for better prices</p>
                    </div>
                  </div>
                  {isLoadingEndTime || !qualificationEndTime ? (
                    <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">--:--:--:--</div>
                  ) : Math.floor(Date.now() / 1000) >= qualificationEndTime ? (
                    <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">Ended</div>
                  ) : (
                    <div className="flex gap-2 lg:gap-4">
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.days}</div>
                        <div className="text-xs lg:text-xs text-muted-foreground">DAYS</div>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.hours}</div>
                        <div className="text-xs lg:text-xs text-muted-foreground">HRS</div>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.minutes}</div>
                        <div className="text-xs lg:text-xs text-muted-foreground">MIN</div>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.seconds}</div>
                        <div className="text-xs lg:text-xs text-muted-foreground">SEC</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 lg:mb-6">
          <div className="cm-panel rounded-sm p-3 lg:p-4 flex items-center gap-3 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 lg:mb-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="cm-panel rounded-sm p-3 bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-1.5 text-sm lg:text-base font-bold text-green-500 mb-1"><CheckCircle2 className="w-4 h-4" /> QUALIFIED</div>
            <div className="text-sm lg:text-base text-muted-foreground">Ranks 1-48 advance to tournament</div>
          </div>
          <div className="cm-panel rounded-sm p-3 bg-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-center gap-1.5 text-sm lg:text-base font-bold text-yellow-500 mb-1"><AlertTriangle className="w-4 h-4" /> AT RISK</div>
            <div className="text-sm lg:text-base text-muted-foreground">Ranks 46-50 need support</div>
          </div>
          <div className="cm-panel rounded-sm p-3 bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-1.5 text-sm lg:text-base font-bold text-red-500 mb-1"><XCircle className="w-4 h-4" /> ELIMINATED</div>
            <div className="text-sm lg:text-base text-muted-foreground">Below rank 48 - not qualified</div>
          </div>
        </div>

        {/* Qualification Table */}
        <div className="cm-panel rounded-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <InlineLoader text="Loading countries..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm lg:text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b-2 border-accent/30">
                    <th className="text-left p-2 lg:p-3 font-bold cm-highlight">Rank</th>
                    <th className="text-left p-2 lg:p-3 font-bold cm-highlight">Country</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">Votes</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight hidden lg:table-cell">Momentum</th>
                    <th className="text-right p-2 lg:p-3 font-bold cm-highlight">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCountries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <div className="py-12">
                          <NoSearchResults query={searchQuery} />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCountries.slice(0, displayedCountries).map((country, idx, arr) => {
                      const isAtRisk = country.rank >= 46 && country.rank <= 50
                      const isQualified = country.rank <= 48
                      const nextCountry = arr[idx + 1]
                      const isCutoff = isQualified && (!nextCountry || nextCountry.rank > 48)

                      return (
                        <Fragment key={country.rank}>
                          <tr
                            className={`border-b border-border transition-colors ${isPreLaunch ? "" : "hover:bg-accent/5"} ${
                              isAtRisk ? "bg-yellow-500/10" : ""
                            } ${isQualified && !isAtRisk ? "bg-green-500/5" : ""} ${
                              !isQualified && !isAtRisk ? "bg-red-500/5" : ""
                            }`}
                            onClick={() => handleVote(country)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVote(country) } }}
                            tabIndex={isPreLaunch ? -1 : 0}
                            style={{ cursor: isPreLaunch ? "default" : "pointer" }}
                          >
                            <td className="p-2 lg:p-3">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isQualified ? "cm-highlight" : "text-muted-foreground"}`}>
                                  {country.rank}
                                </span>
                                {isAtRisk && <span className="text-yellow-500 text-sm font-bold">⚠</span>}
                              </div>
                            </td>
                            <td className="p-2 lg:p-3">
                              <Link
                                href={`/qualification/${country.name.toLowerCase().replace(/\s+/g, "-")}`}
                                className="flex items-center gap-2 hover:text-accent transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-xl lg:text-2xl">{country.flag}</span>
                                <span className="font-bold">{country.name}</span>
                              </Link>
                            </td>
                            <td className="text-center p-2 lg:p-3">
                              <div className="font-bold cm-highlight">{country.votes.toLocaleString("en-US")}</div>
                            </td>
                            <td className="text-center p-2 lg:p-3 hidden lg:table-cell">
                              <div className="flex items-center justify-center">{getMomentumIcon(country.momentum)}</div>
                            </td>
                            <td className="text-right p-2 lg:p-3">
                              <div className="flex items-center justify-end gap-1 lg:gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleVote(country)
                                  }}
                                  disabled={isPreLaunch}
                                  title={isPreLaunch ? "Voting opens April 14" : undefined}
                                  className="cm-nav-tab px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {isPreLaunch ? "APR 9" : "VOTE"}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isCutoff && (
                            <tr>
                              <td colSpan={6} className="p-0">
                                <div className="relative h-8 bg-accent/20 border-y-2 border-accent flex items-center justify-center">
                                  <div className="text-sm lg:text-base font-bold cm-highlight uppercase tracking-wider flex items-center gap-2">
                                    <span className="hidden lg:inline">━━━━━</span>
                                    Qualification Cutoff (Top 48)
                                    <span className="hidden lg:inline">━━━━━</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
              {displayedCountries < filteredCountries.length && (
                <div ref={sentinelRef} className="p-4 text-center">
                  <InlineLoader text="Loading more countries..." />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <QualificationVoteModal
        isOpen={voteModalOpen}
        onClose={() => setVoteModalOpen(false)}
        country={selectedCountry}
        contractAddress={contractAddress}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="leaderboard"
        data={{
          topCountries: allCountries.slice(0, 5).map((country) => ({
            rank: country.rank,
            name: country.name,
            flag: country.flag,
            votes: country.votes,
          })),
        }}
      />
      </div>
    </div>
  )
}
