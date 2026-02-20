"use client"

import { useEffect, useState } from "react"
import { Address } from "viem"
import { MatchContractPanel } from "./match-contract-panel"
import { QualificationContractPanel } from "./qualification-contract-panel"

interface MatchOption {
  id: string
  team1: { name: string; flag_emoji: string } | null
  team2: { name: string; flag_emoji: string } | null
  contract_address: string | null
}

export function ContractsTab() {
  const [matches, setMatches] = useState<MatchOption[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchOption | null>(null)

  useEffect(() => {
    fetch("/api/matches?limit=50")
      .then((r) => r.json())
      .then((res) => setMatches((res.data || []).filter((m: MatchOption) => m.contract_address)))
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-6">
      <QualificationContractPanel />

      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Match Contracts</h3>
        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-1">Select Match</label>
          <select
            value={selectedMatch?.id || ""}
            onChange={(e) => {
              const m = matches.find((m) => m.id === e.target.value) || null
              setSelectedMatch(m)
            }}
            className="bg-background border border-border/50 rounded px-3 py-2 text-sm w-full max-w-md"
          >
            <option value="">Choose a match...</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.team1?.flag_emoji} {m.team1?.name} vs {m.team2?.flag_emoji} {m.team2?.name}
              </option>
            ))}
          </select>
        </div>

        {selectedMatch?.contract_address && (
          <MatchContractPanel contractAddress={selectedMatch.contract_address as Address} />
        )}
      </div>
    </div>
  )
}
