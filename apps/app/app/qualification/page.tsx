"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { TrendingUp, TrendingDown, Minus, Clock, Trophy } from "lucide-react"
import { VoteModal } from "@/components/vote-modal"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"

// Mock qualification data - 64 countries competing for 48 spots
const allCountries = [
  { rank: 1, name: "Brazil", flag: "🇧🇷", votes: 2450, momentum: "up", change: 125 },
  { rank: 2, name: "France", flag: "🇫🇷", votes: 2380, momentum: "up", change: 98 },
  { rank: 3, name: "Argentina", flag: "🇦🇷", votes: 2310, momentum: "stable", change: 12 },
  { rank: 4, name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", votes: 2240, momentum: "up", change: 87 },
  { rank: 5, name: "Spain", flag: "🇪🇸", votes: 2180, momentum: "down", change: -45 },
  { rank: 6, name: "Germany", flag: "🇩🇪", votes: 2120, momentum: "up", change: 65 },
  { rank: 7, name: "Portugal", flag: "🇵🇹", votes: 2090, momentum: "stable", change: 8 },
  { rank: 8, name: "Netherlands", flag: "🇳🇱", votes: 2050, momentum: "up", change: 92 },
  { rank: 9, name: "Belgium", flag: "🇧🇪", votes: 2010, momentum: "down", change: -28 },
  { rank: 10, name: "Italy", flag: "🇮🇹", votes: 1980, momentum: "stable", change: 15 },
  { rank: 11, name: "Uruguay", flag: "🇺🇾", votes: 1950, momentum: "up", change: 71 },
  { rank: 12, name: "Croatia", flag: "🇭🇷", votes: 1920, momentum: "stable", change: 5 },
  { rank: 13, name: "Colombia", flag: "🇨🇴", votes: 1890, momentum: "up", change: 54 },
  { rank: 14, name: "Mexico", flag: "🇲🇽", votes: 1860, momentum: "down", change: -32 },
  { rank: 15, name: "Denmark", flag: "🇩🇰", votes: 1830, momentum: "stable", change: 18 },
  { rank: 16, name: "Switzerland", flag: "🇨🇭", votes: 1800, momentum: "up", change: 43 },
  { rank: 17, name: "USA", flag: "🇺🇸", votes: 1770, momentum: "up", change: 89 },
  { rank: 18, name: "Senegal", flag: "🇸🇳", votes: 1740, momentum: "stable", change: 22 },
  { rank: 19, name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", votes: 1710, momentum: "down", change: -19 },
  { rank: 20, name: "Poland", flag: "🇵🇱", votes: 1680, momentum: "up", change: 61 },
  { rank: 21, name: "Serbia", flag: "🇷🇸", votes: 1650, momentum: "stable", change: 11 },
  { rank: 22, name: "Japan", flag: "🇯🇵", votes: 1620, momentum: "up", change: 78 },
  { rank: 23, name: "South Korea", flag: "🇰🇷", votes: 1590, momentum: "stable", change: 14 },
  { rank: 24, name: "Morocco", flag: "🇲🇦", votes: 1560, momentum: "up", change: 95 },
  { rank: 25, name: "Australia", flag: "🇦🇺", votes: 1530, momentum: "down", change: -41 },
  { rank: 26, name: "Canada", flag: "🇨🇦", votes: 1500, momentum: "up", change: 52 },
  { rank: 27, name: "Ecuador", flag: "🇪🇨", votes: 1470, momentum: "stable", change: 7 },
  { rank: 28, name: "Tunisia", flag: "🇹🇳", votes: 1440, momentum: "up", change: 68 },
  { rank: 29, name: "Costa Rica", flag: "🇨🇷", votes: 1410, momentum: "down", change: -25 },
  { rank: 30, name: "Peru", flag: "🇵🇪", votes: 1380, momentum: "stable", change: 19 },
  { rank: 31, name: "Nigeria", flag: "🇳🇬", votes: 1350, momentum: "up", change: 84 },
  { rank: 32, name: "Cameroon", flag: "🇨🇲", votes: 1320, momentum: "stable", change: 13 },
  { rank: 33, name: "Ghana", flag: "🇬🇭", votes: 1290, momentum: "up", change: 47 },
  { rank: 34, name: "Saudi Arabia", flag: "🇸🇦", votes: 1260, momentum: "down", change: -38 },
  { rank: 35, name: "Iran", flag: "🇮🇷", votes: 1230, momentum: "stable", change: 16 },
  { rank: 36, name: "Algeria", flag: "🇩🇿", votes: 1200, momentum: "up", change: 73 },
  { rank: 37, name: "Egypt", flag: "🇪🇬", votes: 1170, momentum: "stable", change: 9 },
  { rank: 38, name: "Ivory Coast", flag: "🇨🇮", votes: 1140, momentum: "up", change: 56 },
  { rank: 39, name: "Mali", flag: "🇲🇱", votes: 1110, momentum: "down", change: -29 },
  { rank: 40, name: "Burkina Faso", flag: "🇧🇫", votes: 1080, momentum: "stable", change: 21 },
  { rank: 41, name: "Chile", flag: "🇨🇱", votes: 1050, momentum: "up", change: 64 },
  { rank: 42, name: "Paraguay", flag: "🇵🇾", votes: 1020, momentum: "stable", change: 8 },
  { rank: 43, name: "Qatar", flag: "🇶🇦", votes: 990, momentum: "down", change: -44 },
  { rank: 44, name: "Iraq", flag: "🇮🇶", votes: 960, momentum: "up", change: 79 },
  { rank: 45, name: "UAE", flag: "🇦🇪", votes: 930, momentum: "stable", change: 17 },
  { rank: 46, name: "Venezuela", flag: "🇻🇪", votes: 900, momentum: "up", change: 51 },
  { rank: 47, name: "Jamaica", flag: "🇯🇲", votes: 870, momentum: "critical-up", change: 103 },
  { rank: 48, name: "Panama", flag: "🇵🇦", votes: 840, momentum: "critical-down", change: -67 },
  // Below cutoff
  { rank: 49, name: "Honduras", flag: "🇭🇳", votes: 810, momentum: "critical-up", change: 88 },
  { rank: 50, name: "Turkey", flag: "🇹🇷", votes: 780, momentum: "critical-down", change: -52 },
  { rank: 51, name: "Ukraine", flag: "🇺🇦", votes: 750, momentum: "stable", change: 12 },
  { rank: 52, name: "Norway", flag: "🇳🇴", votes: 720, momentum: "down", change: -35 },
  { rank: 53, name: "Austria", flag: "🇦🇹", votes: 690, momentum: "stable", change: 14 },
  { rank: 54, name: "Czech Republic", flag: "🇨🇿", votes: 660, momentum: "down", change: -41 },
  { rank: 55, name: "Romania", flag: "🇷🇴", votes: 630, momentum: "stable", change: 9 },
  { rank: 56, name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", votes: 600, momentum: "down", change: -28 },
  { rank: 57, name: "Sweden", flag: "🇸🇪", votes: 570, momentum: "stable", change: 7 },
  { rank: 58, name: "Hungary", flag: "🇭🇺", votes: 540, momentum: "down", change: -19 },
  { rank: 59, name: "Slovakia", flag: "🇸🇰", votes: 510, momentum: "stable", change: 11 },
  { rank: 60, name: "Finland", flag: "🇫🇮", votes: 480, momentum: "down", change: -33 },
  { rank: 61, name: "Greece", flag: "🇬🇷", votes: 450, momentum: "stable", change: 6 },
  { rank: 62, name: "Israel", flag: "🇮🇱", votes: 420, momentum: "down", change: -22 },
  { rank: 63, name: "Northern Ireland", flag: "🇬🇧", votes: 390, momentum: "stable", change: 4 },
  { rank: 64, name: "Republic of Ireland", flag: "🇮🇪", votes: 360, momentum: "down", change: -15 },
]

type Country = {
  rank: number
  name: string
  flag: string
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
  const [totalPrizePool, _setTotalPrizePool] = useState(125.8) // ETH prize pool from all votes

  const { sentinelRef, shouldLoadMore } = useInfiniteScroll({
    hasMore: displayedCountries < allCountries.length,
    isLoading: isLoadingMore,
  })

  useEffect(() => {
    if (shouldLoadMore) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedCountries((prev) => Math.min(prev + 20, allCountries.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadMore])

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

  const handleVote = (country: Country) => {
    setSelectedCountry({
      ...country,
      team: country.name,
      teamFlag: country.flag,
      opponent: "Qualification Pool",
      opponentFlag: "🌍",
      matchDate: "Qualification Phase",
      stadium: "Global Voting",
    } as unknown as Country)
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

  const filteredCountries = allCountries.filter(
    (country) => country.name.toLowerCase().includes(searchQuery.toLowerCase()) || country.flag.includes(searchQuery),
  )

  useEffect(() => {
    setDisplayedCountries(20)
  }, [searchQuery])

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">Onchain World Cup</span>
            </h1>
            <h2 className="text-xl lg:text-2xl font-bold mb-3 text-accent">Qualification Phase</h2>
            <p className="text-xs lg:text-sm text-foreground/80 mb-2">
              Onchain users decide who qualifies - No matches yet, pure community voting
            </p>
            <p className="text-xs lg:text-sm text-foreground/70">
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
                  <p className="text-xs text-muted-foreground">Vote early for better prices</p>
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
                <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.seconds}</div>
                  <div className="text-[10px] lg:text-xs text-muted-foreground">SEC</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-foreground/70">
                Current Prize Pool: <span className="cm-highlight font-bold text-base">{totalPrizePool} ETH</span> from
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

        {/* Qualification Table */}
        <div className="cm-panel rounded-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs lg:text-sm">
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
                {filteredCountries.slice(0, displayedCountries).map((country) => {
                  const isCutoff = country.rank === 48
                  const isAtRisk = country.rank >= 46 && country.rank <= 50
                  const isQualified = country.rank <= 48

                  return (
                    <>
                      {isCutoff && (
                        <tr key={`cutoff-${country.rank}`}>
                          <td colSpan={6} className="p-0">
                            <div className="relative h-8 bg-accent/20 border-y-2 border-accent flex items-center justify-center">
                              <div className="text-xs lg:text-sm font-bold cm-highlight uppercase tracking-wider flex items-center gap-2">
                                <span className="hidden lg:inline">━━━━━</span>
                                Qualification Cutoff (Top 48)
                                <span className="hidden lg:inline">━━━━━</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      <tr
                        key={country.rank}
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
                            {isAtRisk && <span className="text-yellow-500 text-[10px] font-bold">⚠</span>}
                          </div>
                        </td>
                        <td className="p-2 lg:p-3">
                          <Link
                            href={`/qualification/${country.name.toLowerCase().replace(/\s+/g, "-")}`}
                            className="flex items-center gap-2 hover:text-accent transition-colors"
                          >
                            <span className="text-xl lg:text-2xl">{country.flag}</span>
                            <span className="font-bold">{country.name}</span>
                          </Link>
                        </td>
                        <td className="text-center p-2 lg:p-3">
                          <div className="font-bold cm-highlight">{country.votes.toLocaleString()}</div>
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
                              onClick={() => handleVote(country)}
                              className="cm-nav-tab px-3 lg:px-4 py-1.5 lg:py-2 text-xs font-bold"
                            >
                              VOTE
                            </button>
                          </div>
                        </td>
                      </tr>
                    </>
                  )
                })}
              </tbody>
            </table>
            {displayedCountries < filteredCountries.length && (
              <div ref={sentinelRef} className="p-4 text-center">
                <div className="text-xs text-muted-foreground">Loading more countries...</div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 lg:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="cm-panel rounded-sm p-3 bg-green-500/5 border border-green-500/20">
            <div className="text-xs font-bold text-green-500 mb-1">✓ QUALIFIED</div>
            <div className="text-[10px] text-muted-foreground">Ranks 1-48 advance to tournament</div>
          </div>
          <div className="cm-panel rounded-sm p-3 bg-yellow-500/5 border border-yellow-500/20">
            <div className="text-xs font-bold text-yellow-500 mb-1">⚠ AT RISK</div>
            <div className="text-[10px] text-muted-foreground">Ranks 46-50 need support</div>
          </div>
          <div className="cm-panel rounded-sm p-3 bg-red-500/5 border border-red-500/20">
            <div className="text-xs font-bold text-red-500 mb-1">✗ ELIMINATED</div>
            <div className="text-[10px] text-muted-foreground">Below rank 48 - not qualified</div>
          </div>
        </div>
      </main>

      <VoteModal isOpen={voteModalOpen} onClose={() => setVoteModalOpen(false)} match={selectedCountry} teamIndex={0} />
    </div>
  )
}
