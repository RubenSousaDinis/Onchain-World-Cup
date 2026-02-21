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

  useEffect(() => {
    fetch("/api/tournament/groups")
      .then((r) => r.json())
      .then((res) => setGroups(res.data || []))
      .catch(() => setGroupError("Failed to load groups"))
      .finally(() => setLoadingGroups(false))
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

      // Simulate step progression (the server handles all steps atomically,
      // but we show progress to the user for UX)
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

      // Reset form
      setSelectedGroupId("")
      setTeam1Code("")
      setTeam2Code("")
      setMatchStartTime("")

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
        {/* Step 1: Select Group */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            1. Select Group
          </label>
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

        {/* Step 2: Select Teams */}
        {selectedGroup && (
          <>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                2. Team 1
              </label>
              <select
                value={team1Code}
                onChange={(e) => setTeam1Code(e.target.value)}
                required
                className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
              >
                <option value="">Select team 1...</option>
                {selectedGroup.teams.map((t) => (
                  <option
                    key={t.countryCode}
                    value={t.countryCode}
                    disabled={t.countryCode === team2Code}
                  >
                    {t.flagEmoji} {t.countryName} (#{t.qualRank})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                3. Team 2
              </label>
              <select
                value={team2Code}
                onChange={(e) => setTeam2Code(e.target.value)}
                required
                className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
              >
                <option value="">Select team 2...</option>
                {selectedGroup.teams.map((t) => (
                  <option
                    key={t.countryCode}
                    value={t.countryCode}
                    disabled={t.countryCode === team1Code}
                  >
                    {t.flagEmoji} {t.countryName} (#{t.qualRank})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Step 3: Match time */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            {selectedGroup ? "4." : "2."} Match Start Time
          </label>
          <input
            type="datetime-local"
            value={matchStartTime}
            onChange={(e) => setMatchStartTime(e.target.value)}
            required
            className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Preview */}
        {isValid && selectedGroup && (
          <div className="cm-panel bg-muted/20 px-3 py-2 text-xs space-y-1">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Deployment Preview</p>
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
            <p>
              <span className="text-muted-foreground">Start:</span>{" "}
              {new Date(matchStartTime).toLocaleString()}
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
                <div key={s} className={`flex items-center gap-2 ${done ? "text-green-400" : active ? "text-yellow-400" : "text-muted-foreground/40"}`}>
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
