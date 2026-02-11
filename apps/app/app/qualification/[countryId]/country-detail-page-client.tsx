"use client"

import { useState, useEffect } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft, Minus, Clock, Users, Share2, Info, Trophy } from "lucide-react"
import Link from "next/link"
import { VoteModal } from "@/components/vote-modal"
import { ShareModal } from "@/components/share-modal"
import countriesData from "@/data/countries.json"

interface CountryData {
  code: string
  name: string
  flagEmoji: string
}

export function CountryDetailPageClient({ countryId }: { countryId: string }) {
  const countryIdUpper = countryId.toUpperCase()

  const countryMatch = countriesData.find(
    (c: CountryData) => c.code.toUpperCase() === countryIdUpper || c.name.toUpperCase() === countryIdUpper
  )

  const country = countryMatch ? {
    id: countryMatch.code.toLowerCase(),
    name: countryMatch.name,
    flag: countryMatch.flagEmoji,
    code: countryMatch.code,
    rank: 0,
    totalVotes: 0,
    change: 0,
    momentum: "stable" as const,
    contractAddress: process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA as `0x${string}` || "0x0000000000000000000000000000000000000000" as `0x${string}`,
  } : null

  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [countryStats, setCountryStats] = useState<{
    totalVotes: number
    totalEth: string
    rank: number
    topVoters: Array<{
      voter_address: string
      total_votes: number
      total_eth: string
      farcaster_fid?: number
      farcaster_username?: string
      farcaster_pfp_url?: string
    }>
  } | null>(null)
  const [groupAssignment, setGroupAssignment] = useState<string | null>(null)
  const [groupTeams, setGroupTeams] = useState<Array<{
    countryCode: string
    countryName: string
    flagEmoji: string
    qualRank: number
    position: number
    points: number
  }>>([])

  const [timeRemaining, setTimeRemaining] = useState({
    days: 14,
    hours: 7,
    minutes: 32,
    seconds: 45,
  })

  useEffect(() => {
    if (!country) return

    const fetchCountryData = async () => {
      try {
        const statsResponse = await fetch(`/api/qualification/countries/${country.code.toLowerCase()}`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setCountryStats({
            totalVotes: statsData.data.total_votes || 0,
            totalEth: statsData.data.total_eth || '0',
            rank: statsData.data.rank || 0,
            topVoters: statsData.data.top_voters || [],
          })
        }

        const groupsResponse = await fetch("/api/tournament/groups")
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          const groups = groupsData.data

          for (const group of groups) {
            const teamInGroup = group.teams.find(
              (team: { countryCode: string }) => team.countryCode.toLowerCase() === country.code.toLowerCase()
            )
            if (teamInGroup) {
              setGroupAssignment(group.displayName)
              setGroupTeams(group.teams.filter((t: { countryCode: string }) => !t.countryCode.startsWith('TBD')))
              break
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch country data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCountryData()
  }, [countryId, country?.code])

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

  const displayRank = countryStats?.rank || 0
  const displayVotes = countryStats?.totalVotes || 0

  const getQualificationStatus = () => {
    if (displayRank === 0) {
      return { label: "LOADING", color: "gray", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/30" }
    }
    if (displayRank <= 48) {
      return { label: "QUALIFIED", color: "green", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" }
    }
    return { label: "NOT QUALIFIED", color: "red", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" }
  }

  const getMomentumIcon = () => {
    return <Minus className="w-5 h-5 text-muted-foreground" />
  }

  const status = getQualificationStatus()

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <Link
          href="/qualification"
          className="inline-flex items-center gap-2 text-sm lg:text-base text-accent hover:text-accent/80 mb-4 lg:mb-6"
        >
          <ArrowLeft className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          Back to Qualification
        </Link>

        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            <div className="text-6xl lg:text-9xl">{country.flag}</div>
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-4xl lg:text-6xl font-bold cm-highlight mb-3">{country.name}</h1>
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4 mb-3">
                {groupAssignment && (
                  <span className="text-base lg:text-lg text-muted-foreground font-bold">
                    {groupAssignment}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-lg lg:text-xl text-muted-foreground">
                    Rank <span className="cm-highlight font-bold text-2xl lg:text-3xl">#{displayRank > 0 ? displayRank : '—'}</span>
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground text-lg lg:text-xl">64 countries</span>
                </div>
              </div>
              <div className={`inline-block px-4 py-2 rounded-sm ${status.bgColor} border ${status.borderColor}`}>
                <span className={`text-sm lg:text-base font-bold text-${status.color}-400 uppercase tracking-wider`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-accent/30">
          <div className="bg-secondary/40 p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/90">
              <strong className="cm-highlight">The qualification phase has no matches.</strong> Countries qualify based
              on community support. Top 48 countries by vote weight will advance to the tournament phase.
            </div>
          </div>
        </div>

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
                  <div className="text-xs text-muted-foreground">DAYS</div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.hours}</div>
                  <div className="text-xs text-muted-foreground">HRS</div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.minutes}</div>
                  <div className="text-xs text-muted-foreground">MIN</div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold cm-highlight">{timeRemaining.seconds}</div>
                  <div className="text-xs text-muted-foreground">SEC</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">TOTAL VOTE WEIGHT</h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl lg:text-6xl font-bold cm-highlight font-mono mb-2">
                  {loading ? '...' : displayVotes.toLocaleString("en-US")}
                </div>
                <div className="text-sm text-muted-foreground">Total Votes</div>
              </div>
              {countryStats && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent font-mono">
                    {parseFloat(countryStats.totalEth).toFixed(4)} ETH</div>
                  <div className="text-xs text-muted-foreground">Total Staked</div>
                </div>
              )}
            </div>
          </div>

          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">STATUS & MOMENTUM</h3>
            </div>
            <div className="p-6">
              <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-sm p-4 mb-4 text-center`}>
                <div className={`text-sm text-${status.color}-400 mb-2 uppercase tracking-wider`}>
                  Qualification Status
                </div>
                <div className={`text-3xl font-bold text-${status.color}-400 uppercase tracking-wider`}>
                  {status.label}
                </div>
                {status.label === "NOT QUALIFIED" && (
                  <div className="text-xs lg:text-sm text-muted-foreground mt-2">
                    Below rank 48 - needs more support to qualify
                  </div>
                )}
                {status.label === "LOADING" && (
                  <div className="text-xs lg:text-sm text-muted-foreground mt-2">
                    Fetching qualification data...
                  </div>
                )}
              </div>

              <div className="cm-panel p-4 rounded-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">Recent Momentum</span>
                  {getMomentumIcon()}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-muted-foreground">—</span>
                  <span className="text-sm text-muted-foreground">votes in last 24h</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Momentum data coming soon</div>
              </div>

              <div className="mt-4 cm-panel p-4 rounded-sm">
                <div className="text-sm font-bold text-foreground mb-2">Qualification Status</div>
                {displayRank === 0 ? (
                  <div className="text-sm text-muted-foreground">Loading qualification data...</div>
                ) : displayRank <= 48 ? (
                  <div className="text-sm text-green-400">✓ Currently qualified (Rank #{displayRank}/48)</div>
                ) : (
                  <div className="text-sm text-red-400">✗ Currently not qualified (Rank #{displayRank})</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {groupAssignment && groupTeams.length > 0 && (
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
            <div className="cm-section-header px-4 py-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <h3 className="text-sm font-bold">{groupAssignment.toUpperCase()} TEAMS</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupTeams.map((team) => (
                  <Link
                    key={team.countryCode}
                    href={`/qualification/${team.countryCode.toLowerCase()}`}
                    className={`cm-hover-row p-3 rounded-sm flex items-center justify-between gap-2 ${
                      team.countryCode.toLowerCase() === country.code.toLowerCase()
                        ? 'border-2 border-accent bg-accent/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{team.flagEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm lg:text-base truncate">{team.countryName}</div>
                        <div className="text-xs text-muted-foreground">Rank #{team.qualRank}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-mono font-bold cm-highlight">{team.points} pts</div>
                      <div className="text-xs text-muted-foreground">Pos #{team.position}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {countryStats && countryStats.topVoters && countryStats.topVoters.length > 0 && (
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
            <div className="cm-section-header px-4 py-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <h3 className="text-sm font-bold">TOP SUPPORTERS</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {countryStats.topVoters.map((voter, idx) => (
                  <Link
                    key={voter.voter_address}
                    href={`/users/${voter.voter_address}`}
                    className="cm-hover-row p-3 rounded-sm flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm flex-shrink-0">
                        #{idx + 1}
                      </div>
                      {voter.farcaster_username ? (
                        <>
                          {voter.farcaster_pfp_url && (
                            <img
                              src={voter.farcaster_pfp_url}
                              alt={voter.farcaster_username}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          )}
                          <span className="text-sm font-bold text-foreground truncate">@{voter.farcaster_username}</span>
                        </>
                      ) : (
                        <span className="text-sm font-mono text-foreground truncate">
                          {voter.voter_address.slice(0, 8)}...{voter.voter_address.slice(-6)}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-mono font-bold cm-highlight">{voter.total_votes.toLocaleString()} votes</div>
                      <div className="text-xs font-mono text-accent">{parseFloat(voter.total_eth).toFixed(4)} ETH</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <button
            onClick={() => setVoteModalOpen(true)}
            className="cm-nav-tab p-4 rounded-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
          >
            <Users className="w-5 h-5" />
            <div className="text-left">
              <div className="text-sm font-bold uppercase">Vote</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Support this country</div>
            </div>
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
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
        type="country"
        data={{
          country: country.name,
          countryCode: country.code.toLowerCase(),
          countryFlag: country.flag,
          votes: displayVotes,
          amount: countryStats?.totalEth || '0',
        }}
      />
    </div>
  )
}
