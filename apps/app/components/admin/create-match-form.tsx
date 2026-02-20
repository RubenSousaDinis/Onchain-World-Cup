"use client"

import { useEffect, useState } from "react"

interface Country {
  id: string
  name: string
  code: string
  flag_emoji: string
}

export function CreateMatchForm({ onCreated }: { onCreated: () => void }) {
  const [countries, setCountries] = useState<Country[]>([])
  const [team1Id, setTeam1Id] = useState("")
  const [team2Id, setTeam2Id] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [matchStartTime, setMatchStartTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetch("/api/qualification/countries")
      .then((r) => r.json())
      .then((res) => setCountries(res.data || res || []))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1_id: team1Id,
          team2_id: team2Id,
          contract_address: contractAddress,
          match_start_time: new Date(matchStartTime).toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create match")
      }

      setSuccess("Match created successfully")
      setTeam1Id("")
      setTeam2Id("")
      setContractAddress("")
      setMatchStartTime("")
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cm-panel p-4">
      <h3 className="cm-section-header px-3 py-2 mb-4">Create Match</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Team 1</label>
          <select
            value={team1Id}
            onChange={(e) => setTeam1Id(e.target.value)}
            required
            className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
          >
            <option value="">Select team...</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag_emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Team 2</label>
          <select
            value={team2Id}
            onChange={(e) => setTeam2Id(e.target.value)}
            required
            className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
          >
            <option value="">Select team...</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag_emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Contract Address</label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            required
            placeholder="0x..."
            className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Match Start Time</label>
          <input
            type="datetime-local"
            value={matchStartTime}
            onChange={(e) => setMatchStartTime(e.target.value)}
            required
            className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-6 py-2 font-semibold text-sm disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Match"}
        </button>
      </form>
    </div>
  )
}
