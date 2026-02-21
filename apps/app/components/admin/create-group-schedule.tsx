"use client"

import { useEffect, useState } from "react"

interface GroupTeam {
  countryCode: string
  countryName: string
  flagEmoji: string
  qualRank: number
  position: number
}

interface Group {
  id: string
  name: string
  displayName: string
  teams: GroupTeam[]
}

interface ScheduledMatch {
  team1: GroupTeam
  team2: GroupTeam
  matchday: number
  startTime: Date // UTC
}

// Round-robin pairings for 4 teams using standard WC matchday order:
// MD1: 1v2, 3v4 | MD2: 1v3, 2v4 | MD3: 1v4, 2v3
const PAIRINGS: [number, number][][] = [
  [[0, 1], [2, 3]], // Matchday 1
  [[0, 2], [1, 3]], // Matchday 2
  [[0, 3], [1, 2]], // Matchday 3
]

// Days between matchdays (standard WC group stage spacing)
const MATCHDAY_SPACING_DAYS = 4

// Two kickoff slots per matchday (UTC hours)
const SLOTS_UTC = [17, 21]

function buildSchedule(teams: GroupTeam[], firstMatchdayDate: Date): ScheduledMatch[] {
  const matches: ScheduledMatch[] = []
  PAIRINGS.forEach((dayPairs, mdIndex) => {
    dayPairs.forEach(([i1, i2], slotIndex) => {
      const kickoff = new Date(firstMatchdayDate)
      kickoff.setUTCDate(kickoff.getUTCDate() + mdIndex * MATCHDAY_SPACING_DAYS)
      kickoff.setUTCHours(SLOTS_UTC[slotIndex], 0, 0, 0)
      matches.push({
        team1: teams[i1],
        team2: teams[i2],
        matchday: mdIndex + 1,
        startTime: kickoff,
      })
    })
  })
  return matches
}

function toDateInputValue(utcDate: Date): string {
  // Returns YYYY-MM-DD in UTC for the date input
  return utcDate.toISOString().slice(0, 10)
}

function nextStandardDate(): string {
  const now = new Date()
  // Find next day that has a future 17:00 UTC slot
  for (let d = 0; d <= 14; d++) {
    const candidate = new Date(now)
    candidate.setUTCDate(candidate.getUTCDate() + d)
    candidate.setUTCHours(17, 0, 0, 0)
    if (candidate.getTime() > now.getTime() + 3600_000) {
      return toDateInputValue(candidate)
    }
  }
  return toDateInputValue(now)
}

export function CreateGroupSchedule({ onCreated }: { onCreated: () => void }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [groupError, setGroupError] = useState("")

  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [firstMatchday, setFirstMatchday] = useState(nextStandardDate)

  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetch("/api/tournament/groups")
      .then((r) => r.json())
      .then((res) => setGroups(res.data || []))
      .catch(() => setGroupError("Failed to load groups"))
      .finally(() => setLoadingGroups(false))
  }, [])

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null

  const schedule: ScheduledMatch[] = selectedGroup
    ? buildSchedule(selectedGroup.teams, new Date(firstMatchday + "T00:00:00Z"))
    : []

  const handleCreate = async () => {
    if (!selectedGroup || schedule.length === 0) return
    setError("")
    setSuccess("")
    setSubmitting(true)
    setProgress({ done: 0, total: schedule.length })

    let created = 0
    const errors: string[] = []

    for (const match of schedule) {
      try {
        const res = await fetch("/api/admin/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team1Code: match.team1.countryCode,
            team2Code: match.team2.countryCode,
            match_start_time: match.startTime.toISOString(),
            group_id: selectedGroup.id,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          errors.push(`${match.team1.countryName} vs ${match.team2.countryName}: ${data.error}`)
        } else {
          created++
        }
      } catch {
        errors.push(`${match.team1.countryName} vs ${match.team2.countryName}: network error`)
      }
      setProgress({ done: created + errors.length, total: schedule.length })
    }

    setSubmitting(false)
    setProgress(null)

    if (errors.length === 0) {
      setSuccess(`All ${created} matches created for ${selectedGroup.displayName}.`)
      setSelectedGroupId("")
      setFirstMatchday(nextStandardDate())
      onCreated()
    } else {
      setError(
        `${created} created, ${errors.length} failed:\n${errors.join("\n")}`
      )
      if (created > 0) onCreated()
    }
  }

  return (
    <div className="cm-panel p-4">
      <h3 className="cm-section-header px-3 py-2 mb-1">Create Group Schedule</h3>
      <p className="text-xs text-muted-foreground px-1 mb-4">
        Generates all 6 round-robin matches for a group across 3 matchdays (MD1, MD1+4d, MD1+8d).
        Deploy contracts separately after creation.
      </p>

      <div className="space-y-4 max-w-lg">
        {/* Group */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Group</label>
          {loadingGroups ? (
            <p className="text-sm text-muted-foreground">Loading groups...</p>
          ) : groupError ? (
            <p className="text-red-400 text-sm">{groupError}</p>
          ) : (
            <select
              value={selectedGroupId}
              onChange={(e) => { setSelectedGroupId(e.target.value); setError(""); setSuccess("") }}
              className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
            >
              <option value="">Select a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.displayName}</option>
              ))}
            </select>
          )}
        </div>

        {/* First matchday date */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">First Matchday (UTC date)</label>
          <input
            type="date"
            value={firstMatchday}
            onChange={(e) => setFirstMatchday(e.target.value)}
            className="bg-background border border-border/50 rounded px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Matchday 2 will be +4 days, Matchday 3 will be +8 days.
            Kickoffs at 17:00 and 21:00 UTC.
          </p>
        </div>

        {/* Schedule preview */}
        {selectedGroup && schedule.length > 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((md) => (
              <div key={md}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Matchday {md}
                </p>
                <div className="space-y-1">
                  {schedule
                    .filter((m) => m.matchday === md)
                    .map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between cm-panel bg-muted/10 px-3 py-1.5 text-sm"
                      >
                        <span>
                          {m.team1.flagEmoji} {m.team1.countryName}
                          <span className="text-muted-foreground mx-2">vs</span>
                          {m.team2.flagEmoji} {m.team2.countryName}
                        </span>
                        <span className="text-xs text-muted-foreground ml-4 shrink-0">
                          {m.startTime.toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
                          {m.startTime.getUTCHours().toString().padStart(2, "0")}:00 UTC
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {progress && (
          <p className="text-sm text-yellow-400">
            Creating… {progress.done} / {progress.total}
          </p>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-950/20 border border-red-800/30 rounded px-3 py-2 whitespace-pre-wrap">
            {error}
          </div>
        )}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button
          onClick={handleCreate}
          disabled={!selectedGroup || !firstMatchday || submitting}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-6 py-2 font-semibold text-sm disabled:opacity-50"
        >
          {submitting ? `Creating ${progress?.done ?? 0}/${schedule.length}…` : `Create All ${schedule.length} Matches`}
        </button>
      </div>
    </div>
  )
}
