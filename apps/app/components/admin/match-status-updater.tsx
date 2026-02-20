"use client"

import { useEffect, useState } from "react"

interface MatchRow {
  id: string
  team1: { name: string; flag_emoji: string } | null
  team2: { name: string; flag_emoji: string } | null
  status: string
  winning_team: number | null
}

function MatchRow({ match, onUpdated }: { match: MatchRow; onUpdated: () => void }) {
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
      if (winningTeam !== "") {
        body.winning_team = Number(winningTeam)
      }

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
        <button
          onClick={handleSave}
          disabled={saving}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-3 py-1 text-xs font-semibold disabled:opacity-50"
        >
          {saving ? "..." : "Save"}
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
    fetch("/api/matches?limit=50")
      .then((r) => r.json())
      .then((res) => setMatches(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMatches()
  }, [])

  return (
    <div className="cm-panel p-4">
      <h3 className="cm-section-header px-3 py-2 mb-4">Manage Matches</h3>
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
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Winner</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <MatchRow key={m.id} match={m} onUpdated={loadMatches} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
