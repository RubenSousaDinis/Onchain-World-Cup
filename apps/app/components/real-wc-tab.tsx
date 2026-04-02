"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, MapPin, Clock, Trophy } from "lucide-react"
import { CountdownTimerLarge } from "@/components/countdown-timer-large"
import { InlineLoader } from "@/components/states"

type WCMatch = {
  round: string
  date: string
  time: string
  team1: string
  team2: string
  group?: string
  ground: string
}

type WCScheduleData = {
  name: string
  matches: WCMatch[]
}

type OnchainMatch = {
  id: string
  team1: { id: string; name: string; code: string; flag_emoji: string }
  team2: { id: string; name: string; code: string; flag_emoji: string }
  match_start_time: string
  status: string
}

type OnchainMatchesResponse = {
  data: OnchainMatch[]
  count: number
}

// Mexico vs South Africa — June 11, 2026 at 13:00 UTC-6 = 19:00 UTC
const FIRST_MATCH_DATE = new Date("2026-06-11T19:00:00Z")

function normalize(name: string): string {
  return name.toLowerCase().trim()
}

function buildMatchLookup(matches: OnchainMatch[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const match of matches) {
    const key1 = `${normalize(match.team1.name)}|${normalize(match.team2.name)}`
    const key2 = `${normalize(match.team2.name)}|${normalize(match.team1.name)}`
    map.set(key1, match.id)
    map.set(key2, match.id)
  }
  return map
}

function deriveGroups(matches: WCMatch[]): [string, string[]][] {
  const groups = new Map<string, Set<string>>()
  for (const match of matches) {
    if (!match.group) continue
    const teams = groups.get(match.group) ?? new Set<string>()
    teams.add(match.team1)
    teams.add(match.team2)
    groups.set(match.group, teams)
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, teams]) => [group, Array.from(teams)])
}

function parseMatchTime(date: string, time: string): Date {
  // time format: "13:00 UTC-6" or "20:00 UTC+3"
  // Build ISO 8601 with offset so JS handles midnight crossings correctly
  const m = time.match(/(\d+):(\d+)\s+UTC([+-]\d+)/)
  if (!m) return new Date(`${date}T00:00:00Z`)
  const offsetHours = parseInt(m[3])
  const sign = offsetHours >= 0 ? "+" : "-"
  const absHours = String(Math.abs(offsetHours)).padStart(2, "0")
  return new Date(`${date}T${m[1]}:${m[2]}:00${sign}${absHours}:00`)
}

function groupMatchesByDate(matches: WCMatch[]): [string, WCMatch[]][] {
  const map = new Map<string, WCMatch[]>()
  for (const match of matches) {
    const existing = map.get(match.date) ?? []
    map.set(match.date, [...existing, match])
  }
  return Array.from(map.entries())
}

export function RealWorldCupTab() {
  const [matches, setMatches] = useState<WCMatch[]>([])
  const [matchLookup, setMatchLookup] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/data/worldcup-2026.json").then((r) => {
        if (!r.ok) throw new Error("schedule fetch failed")
        return r.json() as Promise<WCScheduleData>
      }),
      fetch("/api/matches?limit=200").then((r) => {
        if (!r.ok) return { data: [], count: 0 } as OnchainMatchesResponse
        return r.json() as Promise<OnchainMatchesResponse>
      }),
    ])
      .then(([schedule, onchain]) => {
        setMatches(schedule.matches)
        setMatchLookup(buildMatchLookup(onchain.data ?? []))
        setIsLoading(false)
      })
      .catch(() => {
        setError(true)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="cm-panel rounded-sm border border-border overflow-hidden p-12 text-center">
        <InlineLoader text="Loading World Cup schedule..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="cm-panel rounded-sm border border-border overflow-hidden p-12 text-center">
        <p className="text-muted-foreground font-bold">Failed to load schedule. Please try again.</p>
      </div>
    )
  }

  const groups = deriveGroups(matches)
  const groupedByDate = groupMatchesByDate(matches)
  const showCountdown = Date.now() < FIRST_MATCH_DATE.getTime()

  return (
    <div className="space-y-6">
      {showCountdown && (
        <CountdownTimerLarge
          targetDate={FIRST_MATCH_DATE}
          title="First Match Kicks Off In"
        />
      )}

      {/* Group Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {groups.map(([groupName, teams]) => (
          <div
            key={groupName}
            className="cm-panel rounded-sm border-2 border-accent/30 overflow-hidden"
          >
            <div className="bg-accent/20 border-b-2 border-accent/30 p-3 lg:p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <h3 className="text-xl lg:text-2xl font-bold cm-highlight">{groupName}</h3>
              </div>
            </div>
            <div className="p-3 lg:p-4 space-y-2">
              {teams.map((team) => (
                <div
                  key={team}
                  className="flex items-center p-2 lg:p-3 rounded-sm bg-secondary/40"
                >
                  <span className="font-bold text-sm lg:text-base">{team}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule */}
      {groupedByDate.map(([date, dayMatches]) => (
        <div key={date}>
          <div className="cm-panel rounded-sm overflow-hidden mb-3">
            <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-accent" />
              <h2 className="text-lg font-bold cm-highlight">
                {new Date(date + "T12:00:00Z").toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <span className="text-sm text-muted-foreground ml-auto">
                {dayMatches.length} {dayMatches.length === 1 ? "Match" : "Matches"}
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {dayMatches.map((match, i) => {
              const matchDate = parseMatchTime(match.date, match.time)
              const localTime = matchDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })
              const lookupKey = `${normalize(match.team1)}|${normalize(match.team2)}`
              const matchId = matchLookup.get(lookupKey)

              const inner = (
                <>
                  <div className="bg-secondary/30 px-3 lg:px-4 py-2 border-b border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Clock className="w-3.5 h-3.5 cm-highlight" />
                      <span className="text-sm font-mono cm-highlight font-bold">{localTime}</span>
                      {match.group && (
                        <span className="bg-card px-2 py-0.5 rounded-sm text-xs font-bold cm-highlight border border-accent/30">
                          {match.group}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/70">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="font-mono truncate max-w-[140px] lg:max-w-none">{match.ground}</span>
                    </div>
                  </div>
                  <div className="p-3 lg:p-4 bg-secondary/10">
                    <div className="flex items-center gap-3">
                      <span className="text-sm lg:text-base font-bold flex-1">{match.team1}</span>
                      <div className="bg-secondary px-3 lg:px-4 py-1 rounded-sm flex-shrink-0">
                        <span className="text-xs lg:text-sm font-bold cm-highlight">VS</span>
                      </div>
                      <span className="text-sm lg:text-base font-bold flex-1 text-right">{match.team2}</span>
                    </div>
                  </div>
                </>
              )

              if (matchId) {
                return (
                  <Link
                    key={i}
                    href={`/matches/${matchId}`}
                    className="cm-panel rounded-sm overflow-hidden hover:border-accent/60 border-2 border-transparent transition-colors block"
                  >
                    {inner}
                  </Link>
                )
              }

              return (
                <div key={i} className="cm-panel rounded-sm overflow-hidden">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
