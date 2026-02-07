"use client"

import { useState, useEffect } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, Clock, RefreshCw, Loader2 } from "lucide-react"
import { InlineLoader } from "@/components/states"

type Team = {
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
  teams: Team[]
}

type GroupsResponse = {
  data: Group[]
  cached: boolean
  lastCalculated: string
  nextUpdate: string
}

export default function TournamentPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastCalculated, setLastCalculated] = useState<string>("")
  const [nextUpdate, setNextUpdate] = useState<string>("")
  const [timeUntilUpdate, setTimeUntilUpdate] = useState("")

  const fetchGroups = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const res = await fetch("/api/tournament/groups")
      if (res.ok) {
        const data: GroupsResponse = await res.json()
        setGroups(data.data)
        setLastCalculated(data.lastCalculated)
        setNextUpdate(data.nextUpdate)
      }
    } catch (error) {
      console.error("Failed to fetch tournament groups:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGroups()

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchGroups(true), 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Calculate time until next update
  useEffect(() => {
    if (!nextUpdate) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const next = new Date(nextUpdate).getTime()
      const diff = next - now

      if (diff > 0) {
        const minutes = Math.floor(diff / (60 * 1000))
        const seconds = Math.floor((diff % (60 * 1000)) / 1000)
        setTimeUntilUpdate(`${minutes}m ${seconds}s`)
      } else {
        setTimeUntilUpdate("Now")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [nextUpdate])

  const getRankColor = (rank: number): string => {
    if (rank <= 12) return "text-yellow-500" // Pot 1
    if (rank <= 24) return "text-gray-400" // Pot 2
    if (rank <= 36) return "text-orange-500" // Pot 3
    return "text-red-500" // Pot 4
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <RetroSidebar />
        <MobileNav />

        <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
          {/* Header */}
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
            <div className="soccer-field-bg p-4 lg:p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-4xl font-bold mb-2">
                    <span className="cm-highlight">Tournament Groups</span>
                  </h1>
                  <h2 className="text-xl lg:text-2xl font-bold mb-3 text-accent">World Cup 2026</h2>
                </div>
                <button
                  onClick={() => fetchGroups(true)}
                  disabled={isRefreshing}
                  className="cm-nav-tab flex items-center gap-2 px-3 lg:px-4 py-2 rounded-sm font-bold text-sm hover:scale-105 transition-transform flex-shrink-0 disabled:opacity-50"
                  aria-label="Refresh groups"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
              <p className="text-sm lg:text-base text-foreground/80 mb-2">
                Groups are dynamically calculated based on current qualification standings
              </p>
              <p className="text-sm lg:text-base text-foreground/70">
                12 groups of 4 teams • Snake draft seeding • Updates hourly
              </p>
            </div>
          </div>

          {/* Refreshing Indicator */}
          {isRefreshing && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
              <div className="cm-panel rounded-sm overflow-hidden border-2 border-accent bg-accent/10 shadow-lg">
                <div className="px-6 py-3 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                  <span className="text-sm lg:text-base font-bold text-accent">Updating groups...</span>
                </div>
              </div>
            </div>
          )}

          {/* Cache Status */}
          {lastCalculated && (
            <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 border border-accent/30">
              <div className="bg-secondary/40 p-3 lg:p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-sm lg:text-base font-bold text-foreground">
                      Last Updated: {new Date(lastCalculated).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm lg:text-base text-muted-foreground">
                      Next update in: <span className="font-bold cm-highlight">{timeUntilUpdate}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seeding Legend */}
          <div className="mb-4 lg:mb-6 grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            <div className="cm-panel rounded-sm p-2 lg:p-3 bg-yellow-500/5 border border-yellow-500/20">
              <div className="text-xs lg:text-sm font-bold text-yellow-500 mb-1">POT 1</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Ranks 1-12</div>
            </div>
            <div className="cm-panel rounded-sm p-2 lg:p-3 bg-gray-400/5 border border-gray-400/20">
              <div className="text-xs lg:text-sm font-bold text-gray-400 mb-1">POT 2</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Ranks 13-24</div>
            </div>
            <div className="cm-panel rounded-sm p-2 lg:p-3 bg-orange-500/5 border border-orange-500/20">
              <div className="text-xs lg:text-sm font-bold text-orange-500 mb-1">POT 3</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Ranks 25-36</div>
            </div>
            <div className="cm-panel rounded-sm p-2 lg:p-3 bg-red-500/5 border border-red-500/20">
              <div className="text-xs lg:text-sm font-bold text-red-500 mb-1">POT 4</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Ranks 37-48</div>
            </div>
          </div>

          {/* Groups Grid */}
          {isLoading ? (
            <div className="cm-panel rounded-sm border border-border overflow-hidden p-12 text-center">
              <InlineLoader text="Loading tournament groups..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="cm-panel rounded-sm border-2 border-accent/30 overflow-hidden hover:border-accent/60 transition-colors"
                >
                  {/* Group Header */}
                  <div className="bg-accent/20 border-b-2 border-accent/30 p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-accent" />
                      <h3 className="text-xl lg:text-2xl font-bold cm-highlight">
                        {group.displayName}
                      </h3>
                    </div>
                  </div>

                  {/* Teams List */}
                  <div className="p-3 lg:p-4 space-y-2">
                    {group.teams.map((team) => {
                      const isTBD = team.countryCode.startsWith("TBD")

                      return (
                        <div
                          key={team.countryCode}
                          className={`flex items-center justify-between p-2 lg:p-3 rounded-sm ${
                            isTBD ? "bg-secondary/20 opacity-50" : "bg-secondary/40"
                          } hover:bg-accent/10 transition-colors`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xl lg:text-2xl flex-shrink-0">{team.flagEmoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm lg:text-base truncate">
                                {team.countryName}
                              </div>
                              {!isTBD && (
                                <div className={`text-xs lg:text-sm font-bold ${getRankColor(team.qualRank)}`}>
                                  Rank #{team.qualRank}
                                </div>
                              )}
                            </div>
                          </div>
                          {!isTBD && (
                            <div className="text-xs lg:text-sm font-bold text-muted-foreground flex-shrink-0 ml-2">
                              {team.points} PTS
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Footer */}
          {!isLoading && groups.length > 0 && (
            <div className="mt-6 lg:mt-8 cm-panel rounded-sm p-4 lg:p-6 bg-secondary/40 border border-accent/20">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm lg:text-base text-foreground/80 space-y-2">
                  <p>
                    <span className="font-bold cm-highlight">Snake Draft Seeding:</span> Groups are balanced using a snake draft pattern to ensure competitive fairness.
                  </p>
                  <p>
                    <span className="font-bold cm-highlight">Dynamic Updates:</span> As qualification voting continues, groups will be recalculated hourly to reflect the latest standings.
                  </p>
                  <p>
                    <span className="font-bold cm-highlight">TBD Teams:</span> Placeholder teams will be replaced as countries secure their qualification through voting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
