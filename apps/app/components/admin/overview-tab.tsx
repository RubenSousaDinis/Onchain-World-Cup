"use client"

import { useEffect, useState } from "react"
import { useAccount, useChainId } from "wagmi"
import { formatEther, Address } from "viem"
import {
  useQualificationFinalized,
  useQualificationEndTime,
  useTotalPrizePool,
  usePaused as useQualificationPaused,
} from "@/lib/contracts/qualification"
import { useMatchDetails } from "@/lib/contracts/match-admin"

interface MatchRow {
  id: string
  team1: { name: string; flag_emoji: string } | null
  team2: { name: string; flag_emoji: string } | null
  contract_address: string | null
  status: string
  match_start_time: string
}

function MatchOnchainRow({ match }: { match: MatchRow }) {
  const address = match.contract_address as Address | undefined
  const { data, isLoading } = useMatchDetails(address || undefined)

  const phase = data ? Number(data[8]) : null
  const isFinalized = data ? data[9] : null
  const prizePool = data ? data[6] : null

  return (
    <tr className="cm-hover-row border-b border-border/20">
      <td className="px-3 py-2 text-sm">
        {match.team1?.flag_emoji} {match.team1?.name} vs {match.team2?.flag_emoji} {match.team2?.name}
      </td>
      <td className="px-3 py-2 text-sm">{match.status}</td>
      <td className="px-3 py-2 text-sm">
        {isLoading ? "..." : prizePool != null ? `${Number(formatEther(prizePool)).toFixed(4)} ETH` : "N/A"}
      </td>
      <td className="px-3 py-2 text-sm">
        {isLoading ? "..." : phase != null ? (phase === 0 ? "Closed" : `Phase ${phase}`) : "N/A"}
      </td>
      <td className="px-3 py-2 text-sm">
        {isLoading ? "..." : isFinalized != null ? (isFinalized ? "Yes" : "No") : "N/A"}
      </td>
    </tr>
  )
}

export function OverviewTab() {
  const chainId = useChainId()
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)

  const { data: finalized } = useQualificationFinalized(chainId)
  const { data: endTime } = useQualificationEndTime(chainId)
  const { data: prizePool } = useTotalPrizePool(chainId)
  const { data: qPaused } = useQualificationPaused(chainId)

  useEffect(() => {
    fetch("/api/matches?limit=50")
      .then((r) => r.json())
      .then((res) => setMatches(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Qualification summary */}
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Qualification Contract</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Prize Pool</span>
            <span className="cm-highlight text-lg">
              {prizePool != null ? `${Number(formatEther(prizePool)).toFixed(4)} ETH` : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Finalized</span>
            <span className={finalized ? "text-green-400" : "text-yellow-400"}>
              {finalized != null ? (finalized ? "Yes" : "No") : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">End Time</span>
            <span>
              {endTime ? new Date(Number(endTime) * 1000).toLocaleString() : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Paused</span>
            <span className={qPaused ? "text-red-400" : "text-green-400"}>
              {qPaused != null ? (qPaused ? "Yes" : "No") : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Matches table */}
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Matches</h3>
        {loading ? (
          <p className="text-muted-foreground text-sm p-4">Loading matches...</p>
        ) : matches.length === 0 ? (
          <p className="text-muted-foreground text-sm p-4">No matches found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                  <th className="px-3 py-2">Match</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Prize Pool</th>
                  <th className="px-3 py-2">Phase</th>
                  <th className="px-3 py-2">Finalized</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <MatchOnchainRow key={m.id} match={m} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
