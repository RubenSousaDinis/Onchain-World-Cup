"use client"

import { useState, useEffect, use } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Clock, Users, Share2, Info } from "lucide-react"
import Link from "next/link"
import { VoteModal } from "@/components/vote-modal"
import { ShareModal } from "@/components/share-modal"

const mockCountries = {
  brazil: {
    id: "brazil",
    name: "Brazil",
    flag: "🇧🇷",
    rank: 1,
    totalVotes: 2450,
    contractAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  },
  france: {
    id: "france",
    name: "France",
    flag: "🇫🇷",
    rank: 2,
    totalVotes: 2380,
    contractAddress: "0x2345678901234567890123456789012345678901" as `0x${string}`,
  },
  argentina: {
    id: "argentina",
    name: "Argentina",
    flag: "🇦🇷",
    rank: 3,
    totalVotes: 2310,
    contractAddress: "0x3456789012345678901234567890123456789012" as `0x${string}`,
  },
  panama: {
    id: "panama",
    name: "Panama",
    flag: "🇵🇦",
    rank: 48,
    totalVotes: 840,
    contractAddress: "0x4567890123456789012345678901234567890123" as `0x${string}`,
  },
  honduras: {
    id: "honduras",
    name: "Honduras",
    flag: "🇭🇳",
    rank: 49,
    totalVotes: 810,
    contractAddress: "0x5678901234567890123456789012345678901234" as `0x${string}`,
  },
}

export default function CountryDetailPage({ params }: { params: Promise<{ countryId: string }> }) {
  const { countryId } = use(params)
  const country = mockCountries[countryId as keyof typeof mockCountries]

  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({
    days: 14,
    hours: 7,
    minutes: 32,
    seconds: 45,
  })

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

  if (!country) {
    return (
      <div className="min-h-screen flex">
        <RetroSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-24 p-8 pb-20 lg:pb-8">
          <div className="cm-panel p-8 rounded-sm text-center">
            <p className="text-muted-foreground">Country not found</p>
            <Link href="/qualification" className="cm-nav-tab inline-block px-6 py-2 mt-4">
              Back to Qualification
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const getQualificationStatus = () => {
    if (country.rank <= 45) {
      return { label: "QUALIFIED", color: "green", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" }
    }
    if (country.rank <= 50) {
      return { label: "AT RISK", color: "yellow", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" }
    }
    return { label: "ELIMINATED", color: "red", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" }
  }

  const getMomentumIcon = () => {
    switch (country.momentum) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-500" />
      case "critical-up":
        return <TrendingUp className="w-5 h-5 text-green-500 animate-pulse" />
      case "critical-down":
        return <TrendingDown className="w-5 h-5 text-red-500 animate-pulse" />
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />
    }
  }

  const status = getQualificationStatus()

  const handleVote = () => {
    setVoteModalOpen(true)
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Back Button */}
        <Link
          href="/qualification"
          className="inline-flex items-center gap-2 text-sm lg:text-base text-accent hover:text-accent/80 mb-4 lg:mb-6"
        >
          <ArrowLeft className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          Back to Qualification
        </Link>

        {/* Country Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            <div className="text-6xl lg:text-9xl">{country.flag}</div>
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-4xl lg:text-6xl font-bold cm-highlight mb-3">{country.name}</h1>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <span className="text-lg lg:text-xl text-muted-foreground">
                  Rank <span className="cm-highlight font-bold text-2xl lg:text-3xl">#{country.rank}</span>
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground text-lg lg:text-xl">64 countries</span>
              </div>
              <div className={`inline-block px-4 py-2 rounded-sm ${status.bgColor} border ${status.borderColor}`}>
                <span className={`text-sm lg:text-base font-bold text-${status.color}-400 uppercase tracking-wider`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent/30">
          <div className="bg-secondary/40 p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/90">
              <strong className="cm-highlight">The qualification phase has no matches.</strong> Countries qualify based
              on community support. Top 48 countries by vote weight will advance to the tournament phase.
            </div>
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
                  <p className="text-xs lg:text-sm text-muted-foreground">Top 48 advance to tournament</p>
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
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Vote Weight Breakdown */}
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">TOTAL VOTE WEIGHT</h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl lg:text-6xl font-bold cm-highlight font-mono mb-2">
                  {country.totalVotes.toLocaleString("en-US")}
                </div>
                <div className="text-sm text-muted-foreground">Total Votes</div>
              </div>
            </div>
          </div>

          {/* Qualification Status & Momentum */}
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">STATUS & MOMENTUM</h3>
            </div>
            <div className="p-6">
              {/* Status Card */}
              <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-sm p-4 mb-4 text-center`}>
                <div className={`text-sm text-${status.color}-400 mb-2 uppercase tracking-wider`}>
                  Qualification Status
                </div>
                <div className={`text-3xl font-bold text-${status.color}-400 uppercase tracking-wider`}>
                  {status.label}
                </div>
                {status.label === "AT RISK" && (
                  <div className="text-xs lg:text-sm text-muted-foreground mt-2">Close to cutoff - needs more support!</div>
                )}
                {status.label === "ELIMINATED" && (
                  <div className="text-xs lg:text-sm text-muted-foreground mt-2">
                    Below rank 48 - needs significant support to qualify
                  </div>
                )}
              </div>

              {/* Momentum */}
              <div className="cm-panel p-4 rounded-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">Recent Momentum</span>
                  {getMomentumIcon()}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-bold font-mono ${
                      country.change > 0
                        ? "text-green-400"
                        : country.change < 0
                          ? "text-red-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {country.change > 0 ? "+" : ""}
                    {country.change}
                  </span>
                  <span className="text-sm text-muted-foreground">votes in last 24h</span>
                </div>
              </div>

              {/* Distance from Cutoff */}
              <div className="mt-4 cm-panel p-4 rounded-sm">
                <div className="text-sm font-bold text-foreground mb-2">Distance from Cutoff</div>
                {country.rank <= 48 ? (
                  <div className="text-sm text-green-400">
                    Safe by{" "}
                    <span className="font-bold text-lg">
                      {Math.abs(country.totalVotes - mockCountries.panama.totalVotes)}
                    </span>{" "}
                    votes
                  </div>
                ) : (
                  <div className="text-sm text-red-400">
                    Need{" "}
                    <span className="font-bold text-lg">
                      {Math.abs(country.totalVotes - mockCountries.panama.totalVotes)}
                    </span>{" "}
                    more votes to qualify
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <button
            onClick={handleVote}
            className="cm-nav-tab p-4 rounded-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
          >
            <Users className="w-5 h-5" />
            <div className="text-left">
              <div className="text-sm font-bold uppercase">Vote</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Support this country</div>
            </div>
          </button>

          <button
            onClick={handleShare}
            className="bg-primary text-primary-foreground p-4 rounded-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform font-bold"
          >
            <Share2 className="w-5 h-5" />
            <div className="text-left">
              <div className="text-sm font-bold uppercase">Share Support</div>
              <div className="text-xs lg:text-sm opacity-80">Tell your friends</div>
            </div>
          </button>
        </div>
      </main>

      <VoteModal
        isOpen={voteModalOpen}
        onClose={() => setVoteModalOpen(false)}
        team={country.name}
        teamFlag={country.flag}
        opponent="Qualification Pool"
        opponentFlag="🌍"
        currentPrice={0.001}
        pricePhase="linear"
        matchId={country.id}
        contractAddress={country.contractAddress}
        teamIndex={0}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        type="vote"
        data={{
          team: country.name,
          teamFlag: country.flag,
          opponent: "Qualification",
          opponentFlag: "🌍",
          votes: 1,
          matchId: country.id,
        }}
      />
    </div>
  )
}
