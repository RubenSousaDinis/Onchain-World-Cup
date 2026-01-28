"use client"

import { useState, useEffect, Fragment } from "react"
import Link from "next/link"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { TrendingUp, TrendingDown, Minus, Clock, Trophy } from "lucide-react"
import { QualificationVoteModal } from "@/components/qualification-vote-modal"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"
import { countries as countriesData } from "@/lib/countries"
import { InlineLoader, NoSearchResults } from "@/components/states"
import { useAccount } from "wagmi"
import { getDefaultChainId } from "@/lib/chain-config"

type CountryStats = {
  country_code: string
  total_votes: number
  total_eth: string
  qualified: boolean
}

type Country = {
  rank: number
  name: string
  flag: string
  code: string
  votes: number
  momentum: string
  change: number
}

export default function QualificationPage() {
  const [displayedCountries, setDisplayedCountries] = useState(20)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [totalPrizePool, setTotalPrizePool] = useState(0)
  const [countryStats, setCountryStats] = useState<CountryStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [qualificationEndTime, setQualificationEndTime] = useState<number | null>(null)

  const { chain } = useAccount()
  const chainId = chain?.id || getDefaultChainId() // Use configured default chain

  // Get contract address based on chain
  const contractAddress = (chainId === 84532
    ? process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA
    : process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET) as `0x${string}` | undefined

  const { sentinelRef, shouldLoadMore } = useInfiniteScroll({
    hasMore: displayedCountries < countriesData.length,
    isLoading: isLoadingMore,
  })

  // Fetch qualification summary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch summary data (includes total ETH, voters, etc.)
        const summaryRes = await fetch("/api/qualification/summary")
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json()
          setTotalPrizePool(parseFloat(summaryData.totalEth || "0"))

          // If qualification end time is available from contract
          if (summaryData.qualificationEndTime) {
            setQualificationEndTime(summaryData.qualificationEndTime)
          }
        }

        // Fetch country statistics
        const countriesRes = await fetch("/api/qualification/countries?limit=200")
        if (countriesRes.ok) {
          const countriesData = await countriesRes.json()
          setCountryStats(countriesData.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch qualification data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate countdown timer
  useEffect(() => {
    if (!qualificationEndTime) {
      // Default to 30 days from now if not set
      const defaultEndTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      setQualificationEndTime(defaultEndTime)
    }

    const timer = setInterval(() => {
      if (qualificationEndTime) {
        const now = Math.floor(Date.now() / 1000)
        const diff = qualificationEndTime - now

        if (diff > 0) {
          const days = Math.floor(diff / (24 * 60 * 60))
          const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
          const minutes = Math.floor((diff % (60 * 60)) / 60)
          const seconds = diff % 60

          setTimeRemaining({ days, hours, minutes, seconds })
        } else {
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [qualificationEndTime])

  useEffect(() => {
    if (shouldLoadMore) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedCountries((prev) => Math.min(prev + 20, countriesData.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadMore])

  const handleVote = (country: Country) => {
    setSelectedCountry(country)
    setVoteModalOpen(true)
  }

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "critical-up":
        return <TrendingUp className="w-4 h-4 text-green-500 animate-pulse" />
      case "critical-down":
        return <TrendingDown className="w-4 h-4 text-red-500 animate-pulse" />
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  // Merge country data with stats from API
  const allCountries = countriesData.map((country) => {
    const stats = countryStats.find((s) => s.country_code === country.code)
    const votes = stats?.total_votes || 0

    return {
      rank: 0, // Will be set after sorting
      name: country.name,
      flag: country.flagEmoji,
      code: country.code,
      votes,
      momentum: votes > 1000 ? "up" : votes > 500 ? "stable" : "down",
      change: 0, // TODO: Calculate change from historical data
    }
  })
    .sort((a, b) => b.votes - a.votes) // Sort by votes desc
    .map((country, index) => ({
      ...country,
      rank: index + 1,
    }))

  const filteredCountries = allCountries.filter(
    (country) => country.name.toLowerCase().includes(searchQuery.toLowerCase()) || country.flag.includes(searchQuery),
  )

  useEffect(() => {
    setDisplayedCountries(20)
  }, [searchQuery])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <RetroSidebar />
        <MobileNav />

        <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">Onchain World Cup</span>
            </h1>
            <h2 className="text-xl lg:text-2xl font-bold mb-3 text-accent">Qualification Phase</h2>
            <p className="text-sm lg:text-base text-foreground/80 mb-2">
              Onchain users decide who qualifies - No matches yet, pure community voting
            </p>
            <p className="text-sm lg:text-base text-foreground/70">
              Top 48 countries qualify for the tournament. Vote now to support your nation!
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent/30">
          <div className="bg-secondary/40 p-4 lg:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <h3 className="text-sm lg:text-base font-bold cm-highlight">Qualification Ends In</h3>
                  <p className="text-sm lg:text-base text-muted-foreground">Vote early for better prices</p>
                </div>
              </div>
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
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm lg:text-base">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-foreground/70">
                Current Prize Pool: <span className="cm-highlight font-bold text-base lg:text-lg">{totalPrizePool.toFixed(4)} ETH</span> from
                community votes
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 lg:mb-6">
          <div className="cm-panel rounded-sm p-3 lg:p-4 flex items-center gap-3 max-w-md">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
            <div className="text-sm lg:text-base font-bold text-green-500 mb-1">✓ QUALIFIED</div>
            <div className="text-sm lg:text-base text-muted-foreground">Ranks 1-48 advance to tournament</div>
          </div>
          <div className="cm-panel rounded-sm p-3 bg-yellow-500/5 border border-yellow-500/20">
            <div className="text-sm lg:text-base font-bold text-yellow-500 mb-1">⚠ AT RISK</div>
            <div className="text-sm lg:text-base text-muted-foreground">Ranks 46-50 need support</div>
          </div>
          <div className="cm-panel rounded-sm p-3 bg-red-500/5 border border-red-500/20">
            <div className="text-sm lg:text-base font-bold text-red-500 mb-1">✗ ELIMINATED</div>
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
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">Change</th>
                    <th className="text-right p-2 lg:p-3 font-bold cm-highlight">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCountries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div className="py-12">
                          <NoSearchResults query={searchQuery} />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCountries.slice(0, displayedCountries).map((country) => {
                      const isCutoff = country.rank === 48
                      const isAtRisk = country.rank >= 46 && country.rank <= 50
                      const isQualified = country.rank <= 48

                      return (
                        <Fragment key={country.rank}>
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
                          <tr
                            className={`border-b border-border hover:bg-accent/5 transition-colors ${
                              isAtRisk ? "bg-yellow-500/10" : ""
                            } ${isQualified && !isAtRisk ? "bg-green-500/5" : ""} ${
                              !isQualified && !isAtRisk ? "bg-red-500/5" : ""
                            }`}
                            onClick={() => handleVote(country)}
                            style={{ cursor: "pointer" }}
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
                            <td className="text-center p-2 lg:p-3">
                              <span
                                className={`font-bold ${
                                  country.change > 0 ? "text-green-500" : country.change < 0 ? "text-red-500" : ""
                                }`}
                              >
                                {country.change > 0 ? "+" : ""}
                                {country.change}
                              </span>
                            </td>
                            <td className="text-right p-2 lg:p-3">
                              <div className="flex items-center justify-end gap-1 lg:gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleVote(country)
                                  }}
                                  className="cm-nav-tab px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base font-bold"
                                >
                                  VOTE
                                </button>
                              </div>
                            </td>
                          </tr>
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
      </div>
    </div>
  )
}
