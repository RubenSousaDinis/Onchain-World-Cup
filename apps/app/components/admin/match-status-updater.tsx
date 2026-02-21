"use client"

import { useEffect, useState } from "react"

interface MatchRow {
  id: string
  team1: { name: string; flag_emoji: string } | null
  team2: { name: string; flag_emoji: string } | null
  status: string
  winning_team: number | null
  contract_address: string | null
  match_start_time: string
}

type DeployStep = "idle" | "deploying" | "authorizing" | "saving" | "done" | "error"

function ContractCell({ match, onDeployed }: { match: MatchRow; onDeployed: () => void }) {
  const [step, setStep] = useState<DeployStep>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  if (match.contract_address) {
    return (
      <span className="font-mono text-xs text-green-400" title={match.contract_address}>
        {match.contract_address.slice(0, 6)}…{match.contract_address.slice(-4)}
      </span>
    )
  }

  const deploy = async () => {
    setStep("deploying")
    setErrorMsg("")
    try {
      const res = await fetch("/api/admin/deploy-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id }),
      })

      setStep("authorizing")
      await new Promise((r) => setTimeout(r, 400))
      setStep("saving")

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Deploy failed")

      setStep("done")
      onDeployed()
    } catch (err) {
      setStep("error")
      setErrorMsg(err instanceof Error ? err.message : "Unknown error")
    }
  }

  if (step === "deploying" || step === "authorizing" || step === "saving") {
    const labels: Record<string, string> = {
      deploying: "Deploying…",
      authorizing: "Authorizing…",
      saving: "Saving…",
    }
    return <span className="text-yellow-400 text-xs">{labels[step]}</span>
  }

  if (step === "error") {
    return (
      <span className="text-red-400 text-xs" title={errorMsg}>
        Failed —{" "}
        <button onClick={() => setStep("idle")} className="underline">retry</button>
      </span>
    )
  }

  return (
    <button
      onClick={deploy}
      className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-2 py-1 text-xs font-semibold"
    >
      Deploy
    </button>
  )
}

function MatchTableRow({ match, onUpdated }: { match: MatchRow; onUpdated: () => void }) {
  const [status, setStatus] = useState(match.status)
  const [winningTeam, setWinningTeam] = useState<string>(
    match.winning_team != null ? String(match.winning_team) : ""
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const body: Record<string, unknown> = { status }
      if (winningTeam !== "") body.winning_team = Number(winningTeam)

      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update")
      }

      onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="border-b border-border/20">
      <td className="px-3 py-2 text-sm">
        {match.team1?.flag_emoji} {match.team1?.name} vs {match.team2?.flag_emoji} {match.team2?.name}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {new Date(match.match_start_time).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
      </td>
      <td className="px-3 py-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-background border border-border/50 rounded px-2 py-1 text-sm"
        >
          <option value="upcoming">Upcoming</option>
          <option value="voting">Voting</option>
          <option value="completed">Completed</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={winningTeam}
          onChange={(e) => setWinningTeam(e.target.value)}
          className="bg-background border border-border/50 rounded px-2 py-1 text-sm"
        >
          <option value="">None</option>
          <option value="0">{match.team1?.name || "Team 1"}</option>
          <option value="1">{match.team2?.name || "Team 2"}</option>
          <option value="255">Tie</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <ContractCell match={match} onDeployed={onUpdated} />
      </td>
      <td className="px-3 py-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-3 py-1 text-xs font-semibold disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        {error && <span className="text-red-400 text-xs ml-2">{error}</span>}
      </td>
    </tr>
  )
}

export function MatchStatusUpdater() {
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadMatches = () => {
    setLoading(true)
    fetch("/api/matches?limit=100")
      .then((r) => r.json())
      .then((res) => setMatches(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadMatches() }, [])

  const undeployed = matches.filter((m) => !m.contract_address)

  return (
    <div className="cm-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="cm-section-header px-3 py-2">Manage Matches</h3>
        {undeployed.length > 0 && (
          <span className="text-xs text-yellow-400 px-3">
            {undeployed.length} match{undeployed.length !== 1 ? "es" : ""} without a contract
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm p-4">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-muted-foreground text-sm p-4">No matches found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                <th className="px-3 py-2">Match</th>
                <th className="px-3 py-2">Kickoff</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Winner</th>
                <th className="px-3 py-2">Contract</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <MatchTableRow key={m.id} match={m} onUpdated={loadMatches} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
