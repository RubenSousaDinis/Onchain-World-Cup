"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Clock } from "lucide-react"
import { CountdownTimerLarge } from "@/components/countdown-timer-large"
import { InlineLoader } from "@/components/states"

type Match = {
  round: string
  date: string
  time: string
  team1: string
  team2: string
  group?: string
  ground: string
}

type ScheduleData = {
  name: string
  matches: Match[]
}

// Mexico vs South Africa — June 11, 2026 at 13:00 UTC-6 = 19:00 UTC
const FIRST_MATCH_DATE = new Date("2026-06-11T19:00:00Z")

function parseMatchTime(date: string, time: string): Date {
  // time format: "13:00 UTC-6" or "20:00 UTC+3"
  const m = time.match(/(\d+):(\d+)\s+UTC([+-]\d+)/)
  if (!m) return new Date(`${date}T00:00:00Z`)
  const utcHours = parseInt(m[1]) - parseInt(m[3])
  return new Date(`${date}T${String(utcHours).padStart(2, "0")}:${m[2]}:00Z`)
}

function groupMatchesByDate(matches: Match[]): [string, Match[]][] {
  const map = new Map<string, Match[]>()
  for (const match of matches) {
    const existing = map.get(match.date) ?? []
    map.set(match.date, [...existing, match])
  }
  return Array.from(map.entries())
}

export function ScheduleTab() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/data/worldcup-2026.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load")
        return res.json() as Promise<ScheduleData>
      })
      .then((data) => {
        setMatches(data.matches)
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
        <InlineLoader text="Loading schedule..." />
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

  const grouped = groupMatchesByDate(matches)
  const showCountdown = Date.now() < FIRST_MATCH_DATE.getTime()

  return (
    <div className="space-y-6">
      {showCountdown && (
        <CountdownTimerLarge
          targetDate={FIRST_MATCH_DATE}
          title="First Match Kicks Off In"
        />
      )}

      {grouped.map(([date, dayMatches]) => (
        <div key={date}>
          {/* Date header */}
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

          {/* Match rows */}
          <div className="grid gap-3">
            {dayMatches.map((match, i) => {
              const matchDate = parseMatchTime(match.date, match.time)
              const localTime = matchDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div key={i} className="cm-panel rounded-sm overflow-hidden">
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
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
