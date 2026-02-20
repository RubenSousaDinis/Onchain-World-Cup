"use client"

import { useCallback, useEffect, useState } from "react"
import { useChainId } from "wagmi"
import { formatEther, Address } from "viem"
import {
  useQualificationFinalized,
  useQualificationEndTime,
  useTotalPrizePool,
  usePaused as useQualificationPaused,
} from "@/lib/contracts/qualification"
import { useMatchDetails } from "@/lib/contracts/match-admin"
import { getCountryByCode } from "@/lib/countries"

interface MatchRow {
  id: string
  team1: { name: string; flag_emoji: string } | null
  team2: { name: string; flag_emoji: string } | null
  contract_address: string | null
  status: string
  match_start_time: string
}

interface VoteRow {
  id: string
  country_code: string
  voter_address: string
  vote_count: number
  total_cost_eth: string
  tx_hash: string
  block_number: number
  created_at: string
}

const PAGE_SIZE = 20

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

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function OverviewTab() {
  const chainId = useChainId()
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [matchesLoading, setMatchesLoading] = useState(true)

  // Votes pagination state
  const [votes, setVotes] = useState<VoteRow[]>([])
  const [votesLoading, setVotesLoading] = useState(true)
  const [votesTotal, setVotesTotal] = useState(0)
  const [votesPage, setVotesPage] = useState(0)

  const { data: finalized } = useQualificationFinalized(chainId)
  const { data: endTime } = useQualificationEndTime(chainId)
  const { data: prizePool } = useTotalPrizePool(chainId)
  const { data: qPaused } = useQualificationPaused(chainId)

  useEffect(() => {
    fetch("/api/matches?limit=50")
      .then((r) => r.json())
      .then((res) => setMatches(res.data || []))
      .catch(console.error)
      .finally(() => setMatchesLoading(false))
  }, [])

  const fetchVotes = useCallback((page: number) => {
    setVotesLoading(true)
    const offset = page * PAGE_SIZE
    fetch(`/api/qualification/votes?limit=${PAGE_SIZE}&offset=${offset}&sort=recent`)
      .then((r) => r.json())
      .then((res) => {
        setVotes(res.data || [])
        setVotesTotal(res.count || 0)
      })
      .catch(console.error)
      .finally(() => setVotesLoading(false))
  }, [])

  useEffect(() => {
    fetchVotes(votesPage)
  }, [votesPage, fetchVotes])

  const totalPages = Math.ceil(votesTotal / PAGE_SIZE)

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
        {matchesLoading ? (
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

      {/* Votes table (paginated) */}
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">
          All Votes
          {votesTotal > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({votesTotal} total)
            </span>
          )}
        </h3>

        {votesLoading && votes.length === 0 ? (
          <p className="text-muted-foreground text-sm p-4">Loading votes...</p>
        ) : votes.length === 0 ? (
          <p className="text-muted-foreground text-sm p-4">No votes found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                    <th className="px-3 py-2">Voter</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Votes</th>
                    <th className="px-3 py-2">Cost (ETH)</th>
                    <th className="px-3 py-2">Tx Hash</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((v) => (
                    <tr key={v.id} className="border-b border-border/10">
                      <td className="px-3 py-2 text-sm font-mono">
                        {truncateAddress(v.voter_address)}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {(() => {
                          const country = getCountryByCode(v.country_code)
                          return country
                            ? `${country.flagEmoji} ${country.name}`
                            : v.country_code
                        })()}
                      </td>
                      <td className="px-3 py-2 text-sm">{v.vote_count}</td>
                      <td className="px-3 py-2 text-sm">{v.total_cost_eth}</td>
                      <td className="px-3 py-2 text-sm font-mono">
                        {v.tx_hash ? (
                          <a
                            href={`https://sepolia.basescan.org/tx/${v.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--highlight-yellow)] hover:underline"
                          >
                            {truncateAddress(v.tx_hash)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {new Date(v.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/20 mt-4">
                <span className="text-xs text-muted-foreground">
                  Page {votesPage + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVotesPage((p) => Math.max(0, p - 1))}
                    disabled={votesPage === 0 || votesLoading}
                    className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-3 py-1 text-xs font-semibold disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setVotesPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={votesPage >= totalPages - 1 || votesLoading}
                    className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-3 py-1 text-xs font-semibold disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
