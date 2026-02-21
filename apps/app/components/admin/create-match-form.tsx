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

type DeployStep = "idle" | "deploying" | "authorizing" | "saving" | "done"

// Standard FIFA World Cup group-stage kickoff times (UTC)
// Two matches per day: early slot and evening slot
const KICKOFF_SLOTS_UTC = [17, 21] // 17:00 UTC and 21:00 UTC

/**
 * Returns the next N upcoming kickoff slot datetimes as datetime-local strings.
 * Each day has two slots. We start from now and skip slots that are already past.
 */
function getUpcomingSlots(count = 6): { label: string; value: string }[] {
  const slots: { label: string; value: string }[] = []
  const now = new Date()

  // Start from today and look ahead up to 14 days
  for (let dayOffset = 0; dayOffset <= 14 && slots.length < count; dayOffset++) {
    const base = new Date(now)
    base.setUTCHours(0, 0, 0, 0)
    base.setUTCDate(base.getUTCDate() + dayOffset)

    for (const hour of KICKOFF_SLOTS_UTC) {
      if (slots.length >= count) break
      const slot = new Date(base)
      slot.setUTCHours(hour, 0, 0, 0)

      // Skip slots in the past (with a 1-hour buffer)
      if (slot.getTime() <= now.getTime() + 60 * 60 * 1000) continue

      // Format as datetime-local value (YYYY-MM-DDTHH:MM) in local time
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

/** Format a datetime-local string as a readable time */
function formatLocalDt(value: string): string {
  if (!value) return ""
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Add hours to a datetime-local string */
function addHours(value: string, hours: number): string {
  if (!value) return ""
  return new Date(new Date(value).getTime() + hours * 3600_000).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  const [step, setStep] = useState<DeployStep>("idle")
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ contractAddress: string; matchId: string } | null>(null)

  const upcomingSlots = getUpcomingSlots(6)

  useEffect(() => {
    fetch("/api/tournament/groups")
      .then((r) => r.json())
      .then((res) => setGroups(res.data || []))
      .catch(() => setGroupError("Failed to load groups"))
      .finally(() => setLoadingGroups(false))

    // Pre-fill with the next upcoming standard slot
    const slots = getUpcomingSlots(1)
    if (slots.length > 0) setMatchStartTime(slots[0].value)
  }, [])

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId)
    setTeam1Code("")
    setTeam2Code("")
  }

  const isValid =
    selectedGroup &&
    team1Code &&
    team2Code &&
    team1Code !== team2Code &&
    matchStartTime

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !selectedGroup) return

    setError("")
    setResult(null)

    const team1 = selectedGroup.teams.find((t) => t.countryCode === team1Code)!
    const team2 = selectedGroup.teams.find((t) => t.countryCode === team2Code)!

    try {
      setStep("deploying")

      const res = await fetch("/api/admin/deploy-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Code: team1.countryCode,
          team2Code: team2.countryCode,
          team1Name: team1.countryName,
          team2Name: team2.countryName,
          matchStartTime: new Date(matchStartTime).toISOString(),
          groupId: selectedGroup.id,
        }),
      })

      setStep("authorizing")
      await new Promise((r) => setTimeout(r, 500))
      setStep("saving")

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Deployment failed")
      }

      setStep("done")
      setResult({
        contractAddress: data.contractAddress,
        matchId: data.data?.id,
      })

      setSelectedGroupId("")
      setTeam1Code("")
      setTeam2Code("")
      const nextSlots = getUpcomingSlots(1)
      setMatchStartTime(nextSlots[0]?.value || "")

      onCreated()
    } catch (err) {
      setStep("idle")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const stepLabel: Record<DeployStep, string> = {
    idle: "Deploy & Create Match",
    deploying: "Deploying contract...",
    authorizing: "Authorizing in EventHub...",
    saving: "Saving to database...",
    done: "Done!",
  }

  const isDeploying = step !== "idle" && step !== "done"

  return (
    <div className="cm-panel p-4">
      <h3 className="cm-section-header px-3 py-2 mb-4">Create Match from Group</h3>

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
              onChange={(e) => handleGroupChange(e.target.value)}
              required
              className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
            >
              <option value="">Select a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.displayName}
                </option>
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

          {/* Quick-select slots */}
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
          <div className="cm-panel bg-muted/20 px-3 py-3 text-xs space-y-2">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
              Voting Timeline
            </p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">▶</span>
                <div>
                  <span className="font-medium">Voting opens</span>
                  <span className="text-muted-foreground ml-1">— {formatLocalDt(matchStartTime)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">⚡</span>
                <div>
                  <span className="font-medium">Phase 1 ends</span>
                  <span className="text-muted-foreground ml-1">
                    — {addHours(matchStartTime, 2)}
                    <span className="ml-1 opacity-60">(early-bird pricing closes)</span>
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">■</span>
                <div>
                  <span className="font-medium">Voting closes</span>
                  <span className="text-muted-foreground ml-1">
                    — {addHours(matchStartTime, 24)}
                    <span className="ml-1 opacity-60">(24h window)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deployment preview */}
        {isValid && selectedGroup && (
          <div className="cm-panel bg-muted/20 px-3 py-2 text-xs space-y-1">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
              Deployment Preview
            </p>
            <p>
              <span className="text-muted-foreground">Match:</span>{" "}
              {selectedGroup.teams.find((t) => t.countryCode === team1Code)?.flagEmoji}{" "}
              {selectedGroup.teams.find((t) => t.countryCode === team1Code)?.countryName}
              {" vs "}
              {selectedGroup.teams.find((t) => t.countryCode === team2Code)?.flagEmoji}{" "}
              {selectedGroup.teams.find((t) => t.countryCode === team2Code)?.countryName}
            </p>
            <p>
              <span className="text-muted-foreground">Group:</span> {selectedGroup.displayName}
            </p>
            <p className="text-muted-foreground/70 mt-1">
              A new WorldCupMatch contract will be deployed and authorized in the EventHub.
            </p>
          </div>
        )}

        {/* Deploy progress */}
        {isDeploying && (
          <div className="space-y-1 text-sm">
            {(["deploying", "authorizing", "saving"] as DeployStep[]).map((s) => {
              const done =
                (s === "deploying" && (step === "authorizing" || step === "saving")) ||
                (s === "authorizing" && step === "saving")
              const active = step === s
              return (
                <div
                  key={s}
                  className={`flex items-center gap-2 ${
                    done ? "text-green-400" : active ? "text-yellow-400" : "text-muted-foreground/40"
                  }`}
                >
                  <span>{done ? "✓" : active ? "⟳" : "○"}</span>
                  <span>
                    {s === "deploying" && "Deploying WorldCupMatch contract"}
                    {s === "authorizing" && "Authorizing in EventHub"}
                    {s === "saving" && "Creating database record"}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-950/20 border border-red-800/30 rounded px-3 py-2">
            {error}
          </div>
        )}

        {step === "done" && result && (
          <div className="text-green-400 text-sm bg-green-950/20 border border-green-800/30 rounded px-3 py-2 space-y-1">
            <p className="font-semibold">Match deployed successfully!</p>
            <p className="font-mono text-xs break-all">{result.contractAddress}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || isDeploying}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-6 py-2 font-semibold text-sm disabled:opacity-50"
        >
          {stepLabel[step]}
        </button>
      </form>
    </div>
  )
}
