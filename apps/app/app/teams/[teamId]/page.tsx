"use client"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { getCountryName, getCountryFlag } from "@/lib/countries"
import { InlineLoader } from "@/components/states"

type TopVoter = {
  voter_address: string
  total_votes: number
  total_eth: string
  farcasterUsername?: string
  farcasterProfilePic?: string
}

type QualificationData = {
  country_code: string
  total_votes: number
  total_eth: string
  rank: number
  top_voters: TopVoter[]
}

type GroupTeam = {
  countryCode: string
  countryName: string
  flagEmoji: string
  qualRank: number
  position: number
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  points: number
}

type Group = {
  id: string
  name: string
  displayName: string
  maxTeams: number
  teams: GroupTeam[]
}

export default function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params)
  const [qualificationData, setQualificationData] = useState<QualificationData | null>(null)
  const [groupAssignment, setGroupAssignment] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Normalize the country code (handle both full names and codes)
  const countryCode = teamId.toUpperCase()
  const countryName = getCountryName(countryCode)
  const countryFlag = getCountryFlag(countryCode)

  useEffect(() => {
    const fetchTeamData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch qualification data
        const qualRes = await fetch(`/api/qualification/countries/${countryCode}`)
        if (!qualRes.ok) {
          throw new Error("Country not found")
        }
        const qualData = await qualRes.json()
        setQualificationData(qualData.data)

        // Fetch tournament groups to find group assignment
        const groupsRes = await fetch("/api/tournament/groups")
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json()
          const groups: Group[] = groupsData.data

          // Find which group this country is in
          for (const group of groups) {
            const teamInGroup = group.teams.find(
              (team) => team.countryCode.toLowerCase() === countryCode.toLowerCase()
            )
            if (teamInGroup) {
              setGroupAssignment(group.displayName)
              break
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch team data:", err)
        setError(err instanceof Error ? err.message : "Failed to load team data")
      } finally {
        setIsLoading(false)
      }
    }

    if (countryCode) {
      fetchTeamData()
    }
  }, [countryCode])

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <RetroSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-24 p-8 pb-20 lg:pb-8">
          <div className="cm-panel rounded-sm p-12 text-center">
            <InlineLoader text="Loading team data..." />
          </div>
        </main>
      </div>
    )
  }

  if (error || !qualificationData || !countryName) {
    return (
      <div className="min-h-screen flex">
        <RetroSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-24 p-8 pb-20 lg:pb-8">
          <div className="cm-panel p-8 rounded-sm text-center">
            <p className="text-muted-foreground mb-4">
              {error || "Country not found"}
            </p>
            <Link href="/tournament" className="cm-nav-tab inline-block px-6 py-2">
              Back to Tournament
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const getRankColor = (rank: number): string => {
    if (rank <= 12) return "text-yellow-500" // Pot 1
    if (rank <= 24) return "text-gray-400" // Pot 2
    if (rank <= 36) return "text-orange-500" // Pot 3
    return "text-red-500" // Pot 4
  }

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Back Button */}
        <Link
          href="/tournament"
          className="inline-flex items-center gap-2 text-sm lg:text-base text-accent hover:text-accent/80 mb-4 lg:mb-6"
        >
          <ArrowLeft className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          Back to Tournament
        </Link>

        {/* Team Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
              <div className="text-5xl lg:text-8xl">{countryFlag}</div>
              <div className="text-center lg:text-left flex-1">
                <h1 className="text-3xl lg:text-5xl font-bold cm-highlight mb-2">
                  {countryName}
                </h1>
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 items-center lg:items-start justify-center lg:justify-start">
                  {groupAssignment ? (
                    <p className="text-sm lg:text-base text-muted-foreground">
                      {groupAssignment}
                    </p>
                  ) : (
                    <p className="text-sm lg:text-base text-muted-foreground">
                      Not yet qualified
                    </p>
                  )}
                  <p className={`text-sm lg:text-base font-bold ${getRankColor(qualificationData.rank)}`}>
                    Qualification Rank #{qualificationData.rank}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary">
            <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">Total Votes</div>
            <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">
              {qualificationData.total_votes.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">votes received</div>
          </div>
          <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-accent">
            <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">Total ETH</div>
            <div className="text-lg lg:text-2xl font-bold text-accent font-mono">
              {parseFloat(qualificationData.total_eth).toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">ETH received</div>
          </div>
          <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-purple-500">
            <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">Rank</div>
            <div className={`text-lg lg:text-2xl font-bold font-mono ${getRankColor(qualificationData.rank)}`}>
              #{qualificationData.rank}
            </div>
            <div className="text-xs text-muted-foreground">
              {qualificationData.rank <= 48 ? "Qualified" : "Not qualified"}
            </div>
          </div>
          <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-green-500">
            <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">Avg. Cost</div>
            <div className="text-lg lg:text-2xl font-bold text-green-400 font-mono">
              {qualificationData.total_votes > 0
                ? (parseFloat(qualificationData.total_eth) / qualificationData.total_votes).toFixed(6)
                : "0.000000"}
            </div>
            <div className="text-xs text-muted-foreground">ETH per vote</div>
          </div>
        </div>

        {/* Qualification Status Banner */}
        {qualificationData.rank <= 48 && groupAssignment && (
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border-2 border-green-500/30 bg-green-500/5">
            <div className="p-4 lg:p-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-1">
                  🎉 Qualified for World Cup 2026!
                </h3>
                <p className="text-sm text-foreground/80">
                  {countryName} has qualified and is currently assigned to {groupAssignment}.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Top Voters */}
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <h3 className="text-sm font-bold">TOP VOTERS</h3>
            </div>
            <div className="p-4">
              {qualificationData.top_voters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No votes yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {qualificationData.top_voters.map((voter, idx) => (
                    <Link
                      key={voter.voter_address}
                      href={`/users/${voter.voter_address}`}
                      className="cm-hover-row p-3 rounded-sm flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm flex-shrink-0">
                          #{idx + 1}
                        </div>
                        {voter.farcasterUsername ? (
                          <>
                            {voter.farcasterProfilePic && (
                              <img
                                src={voter.farcasterProfilePic}
                                alt={voter.farcasterUsername}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                            )}
                            <span className="text-sm font-bold text-foreground truncate">
                              @{voter.farcasterUsername}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-mono text-foreground truncate">
                            {voter.voter_address.slice(0, 8)}...{voter.voter_address.slice(-6)}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-mono font-bold cm-highlight">
                          {voter.total_votes} votes
                        </div>
                        <div className="text-xs font-mono text-accent">
                          {parseFloat(voter.total_eth).toFixed(4)} ETH
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Qualification Info */}
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">QUALIFICATION STATUS</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Current Standing</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold font-mono ${getRankColor(qualificationData.rank)}`}>
                    #{qualificationData.rank}
                  </span>
                  <span className="text-sm text-muted-foreground">of all countries</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Qualification Pot</div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded-sm font-bold text-sm ${
                      qualificationData.rank <= 12
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                        : qualificationData.rank <= 24
                          ? "bg-gray-400/20 text-gray-400 border border-gray-400/30"
                          : qualificationData.rank <= 36
                            ? "bg-orange-500/20 text-orange-500 border border-orange-500/30"
                            : "bg-red-500/20 text-red-500 border border-red-500/30"
                    }`}
                  >
                    {qualificationData.rank <= 12
                      ? "POT 1"
                      : qualificationData.rank <= 24
                        ? "POT 2"
                        : qualificationData.rank <= 36
                          ? "POT 3"
                          : "POT 4"}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {qualificationData.rank <= 12
                      ? "Top seeds"
                      : qualificationData.rank <= 24
                        ? "Strong seeds"
                        : qualificationData.rank <= 36
                          ? "Medium seeds"
                          : "Lower seeds"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Tournament Phase</div>
                <p className="text-sm text-foreground">
                  {qualificationData.rank <= 48 ? (
                    <>
                      <span className="font-bold text-green-400">✓ Qualified</span> - Will compete in
                      the group stage
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-red-400">Not qualified</span> - Needs more
                      votes to qualify
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vote Now CTA */}
        <div className="mt-6 lg:mt-8 cm-panel rounded-sm overflow-hidden border-2 border-accent/30">
          <div className="p-6 text-center">
            <h3 className="text-xl lg:text-2xl font-bold cm-highlight mb-2">
              Support {countryName}!
            </h3>
            <p className="text-sm lg:text-base text-muted-foreground mb-4">
              Help {countryName} improve their qualification ranking by casting your votes
            </p>
            <Link
              href={`/qualification/${countryCode.toLowerCase()}`}
              className="inline-block cm-nav-tab px-6 lg:px-8 py-3 rounded-sm font-bold uppercase text-sm lg:text-base"
            >
              Vote Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
