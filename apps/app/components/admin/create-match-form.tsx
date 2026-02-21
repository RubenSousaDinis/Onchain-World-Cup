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

// Standard FIFA World Cup group-stage kickoff times (UTC)
const KICKOFF_SLOTS_UTC = [17, 21]

function getUpcomingSlots(count = 6): { label: string; value: string }[] {
  const slots: { label: string; value: string }[] = []
  const now = new Date()

  for (let dayOffset = 0; dayOffset <= 14 && slots.length < count; dayOffset++) {
    const base = new Date(now)
    base.setUTCHours(0, 0, 0, 0)
    base.setUTCDate(base.getUTCDate() + dayOffset)

    for (const hour of KICKOFF_SLOTS_UTC) {
      if (slots.length >= count) break
      const slot = new Date(base)
      slot.setUTCHours(hour, 0, 0, 0)

      if (slot.getTime() <= now.getTime() + 60 * 60 * 1000) continue

      const localStr = new Date(slot.getTime() - slot.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      const dayLabel =
        dayOffset === 0
          ? "Today"
          : dayOffset === 1
          ? "Tomorrow"
          : slot.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })

      slots.push({
        label: `${dayLabel} ${slot.getUTCHours().toString().padStart(2, "0")}:00 UTC`,
        value: localStr,
      })
    }
  }

  return slots
}

function addHours(value: string, hours: number): string {
  if (!value) return ""
  return new Date(new Date(value).getTime() + hours * 3600_000).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export function CreateMatchForm({ onCreated }: { onCreated: () => void }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [groupError, setGroupError] = useState("")

  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [team1Code, setTeam1Code] = useState("")
  const [team2Code, setTeam2Code] = useState("")
  const [matchStartTime, setMatchStartTime] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const upcomingSlots = getUpcomingSlots(6)

  useEffect(() => {
    fetch("/api/tournament/groups")
      .then((r) => r.json())
      .then((res) => setGroups(res.data || []))
      .catch(() => setGroupError("Failed to load groups"))
      .finally(() => setLoadingGroups(false))

    const slots = getUpcomingSlots(1)
    if (slots.length > 0) setMatchStartTime(slots[0].value)
  }, [])

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null

  const isValid = selectedGroup && team1Code && team2Code && team1Code !== team2Code && matchStartTime

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !selectedGroup) return

    setError("")
    setSuccess("")
    setSubmitting(true)

    const team1 = selectedGroup.teams.find((t) => t.countryCode === team1Code)!
    const team2 = selectedGroup.teams.find((t) => t.countryCode === team2Code)!

    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Code: team1.countryCode,
          team2Code: team2.countryCode,
          match_start_time: new Date(matchStartTime).toISOString(),
          group_id: selectedGroup.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create match")

      setSuccess(`${team1.flagEmoji} ${team1.countryName} vs ${team2.flagEmoji} ${team2.countryName} — saved. Deploy the contract when ready.`)
      setTeam1Code("")
      setTeam2Code("")
      const nextSlots = getUpcomingSlots(1)
      setMatchStartTime(nextSlots[0]?.value || "")
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cm-panel p-4">
      <h3 className="cm-section-header px-3 py-2 mb-1">Create Match</h3>
      <p className="text-xs text-muted-foreground px-1 mb-4">
        Saves the match to the database. Deploy the smart contract separately from the match list below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        {/* Group */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">1. Select Group</label>
          {loadingGroups ? (
            <p className="text-sm text-muted-foreground">Loading groups...</p>
          ) : groupError ? (
            <p className="text-red-400 text-sm">{groupError}</p>
          ) : (
            <select
              value={selectedGroupId}
              onChange={(e) => { setSelectedGroupId(e.target.value); setTeam1Code(""); setTeam2Code("") }}
              required
              className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
            >
              <option value="">Select a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.displayName}</option>
              ))}
            </select>
          )}
        </div>

        {/* Teams */}
        {selectedGroup && (
          <>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">2. Team 1</label>
              <select
                value={team1Code}
                onChange={(e) => setTeam1Code(e.target.value)}
                required
                className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
              >
                <option value="">Select team 1...</option>
                {selectedGroup.teams.map((t) => (
                  <option key={t.countryCode} value={t.countryCode} disabled={t.countryCode === team2Code}>
                    {t.flagEmoji} {t.countryName} (#{t.qualRank})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">3. Team 2</label>
              <select
                value={team2Code}
                onChange={(e) => setTeam2Code(e.target.value)}
                required
                className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
              >
                <option value="">Select team 2...</option>
                {selectedGroup.teams.map((t) => (
                  <option key={t.countryCode} value={t.countryCode} disabled={t.countryCode === team1Code}>
                    {t.flagEmoji} {t.countryName} (#{t.qualRank})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Start time */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            {selectedGroup ? "4." : "2."} Match Start Time
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {upcomingSlots.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => setMatchStartTime(slot.value)}
                className={`px-2 py-1 text-xs border rounded transition-colors ${
                  matchStartTime === slot.value
                    ? "bg-[var(--nav-purple)] border-[var(--highlight-yellow)] text-white"
                    : "bg-background border-border/40 text-muted-foreground hover:border-border"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
          <input
            type="datetime-local"
            value={matchStartTime}
            onChange={(e) => setMatchStartTime(e.target.value)}
            required
            className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Voting timeline */}
        {matchStartTime && (
          <div className="cm-panel bg-muted/20 px-3 py-3 text-xs space-y-1.5">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Voting Timeline</p>
            <div className="flex items-start gap-2">
              <span className="text-green-400">▶</span>
              <span><span className="font-medium">Voting opens</span> <span className="text-muted-foreground">— {new Date(matchStartTime).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">⚡</span>
              <span><span className="font-medium">Phase 1 ends</span> <span className="text-muted-foreground">— {addHours(matchStartTime, 2)} <span className="opacity-60">(early-bird pricing closes)</span></span></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">■</span>
              <span><span className="font-medium">Voting closes</span> <span className="text-muted-foreground">— {addHours(matchStartTime, 24)} <span className="opacity-60">(24h window)</span></span></span>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-6 py-2 font-semibold text-sm disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Match"}
        </button>
      </form>
    </div>
  )
}
