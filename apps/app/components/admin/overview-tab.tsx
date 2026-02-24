"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useChainId, useReadContract } from "wagmi"
import { formatEther, isAddress, Address } from "viem"
import {
  useQualificationFinalized,
  useQualificationEndTime,
  useTotalPrizePool,
  usePaused as useQualificationPaused,
} from "@/lib/contracts/qualification"
import { useMatchDetails } from "@/lib/contracts/match-admin"
import { getCountryByCode } from "@/lib/countries"
import { getAddressExplorerUrl, getTxExplorerUrl } from "@/lib/admin"
import { getQualificationAddress, isQualificationContractAvailable } from "@/lib/contracts/qualification"

/** Strip trailing zeros: 0.001500 → 0.0015, 1.000000 → 1 */
function trimEth(raw: string | number | bigint): string {
  const n = typeof raw === "bigint" ? Number(formatEther(raw)) : Number(raw)
  if (n === 0) return "0"
  return parseFloat(n.toFixed(8)).toString()
}

function EthAmount({ eth, price }: { eth: string | number | bigint; price: number | null }) {
  const formatted = trimEth(eth)
  const n = typeof eth === "bigint" ? Number(formatEther(eth)) : Number(eth)
  const usd = price != null ? n * price : null
  return (
    <span>
      {formatted} ETH
      {usd != null && (
        <span className="text-muted-foreground text-xs ml-1">
          (${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2)})
        </span>
      )}
    </span>
  )
}

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

function MatchOnchainRow({ match, chainId, ethPrice }: { match: MatchRow; chainId: number; ethPrice: number | null }) {
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
        {isLoading ? "..." : prizePool != null ? <EthAmount eth={prizePool} price={ethPrice} /> : "N/A"}
      </td>
      <td className="px-3 py-2 text-sm">
        {isLoading ? "..." : phase != null ? (phase === 0 ? "Closed" : `Phase ${phase}`) : "N/A"}
      </td>
      <td className="px-3 py-2 text-sm">
        {isLoading ? "..." : isFinalized != null ? (isFinalized ? "Yes" : "No") : "N/A"}
      </td>
      <td className="px-3 py-2 text-sm font-mono">
        {match.contract_address ? (
          <a
            href={getAddressExplorerUrl(chainId, match.contract_address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--highlight-yellow)] hover:underline"
          >
            {truncateAddress(match.contract_address)}
          </a>
        ) : (
          "—"
        )}
      </td>
    </tr>
  )
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const NFT_SUPPLY_ABI = [
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "MINT_PRICE", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
] as const

function MigrationPanel() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [output, setOutput] = useState<string | null>(null)
  const outputRef = useRef<HTMLPreElement>(null)

  async function runMigrations() {
    setStatus("running")
    setOutput(null)
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" })
      const json = await res.json()
      if (res.ok) {
        setStatus("success")
        setOutput(json.output || "No output.")
      } else {
        setStatus("error")
        setOutput(json.details || json.error || "Unknown error.")
      }
    } catch (err) {
      setStatus("error")
      setOutput(String(err))
    }
  }

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className="cm-panel p-4">
      <h3 className="cm-section-header px-3 py-2 mb-4">Database Migrations</h3>
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={runMigrations}
          disabled={status === "running"}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {status === "running" ? "Running..." : "Run Pending Migrations"}
        </button>
        {status === "success" && (
          <span className="text-green-400 text-sm">Migrations applied successfully.</span>
        )}
        {status === "error" && (
          <span className="text-red-400 text-sm">Migration failed. See output below.</span>
        )}
      </div>
      {output && (
        <pre
          ref={outputRef}
          className="bg-black/40 border border-border/30 p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto"
        >
          {output}
        </pre>
      )}
    </div>
  )
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

  // Daily ETH stats
  const [dailyEth, setDailyEth] = useState<{ day: string; total_eth: string; vote_count: number }[]>([])
  const [dailyEthLoading, setDailyEthLoading] = useState(true)

  // ETH/USD price
  const [ethPrice, setEthPrice] = useState<number | null>(null)

  const { data: finalized } = useQualificationFinalized(chainId)
  const { data: endTime } = useQualificationEndTime(chainId)
  const { data: prizePool } = useTotalPrizePool(chainId)
  const { data: qPaused } = useQualificationPaused(chainId)

  // NFT contract stats
  const achievementAddr = process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS as `0x${string}` | undefined
  const matchNftAddr = process.env.NEXT_PUBLIC_MATCH_NFT_ADDRESS as `0x${string}` | undefined

  const { data: achievementSupply } = useReadContract({
    address: achievementAddr && isAddress(achievementAddr) ? achievementAddr : undefined,
    abi: NFT_SUPPLY_ABI,
    functionName: "totalSupply",
    query: { enabled: !!achievementAddr && isAddress(achievementAddr ?? "") },
  })
  const { data: achievementMintPrice } = useReadContract({
    address: achievementAddr && isAddress(achievementAddr) ? achievementAddr : undefined,
    abi: NFT_SUPPLY_ABI,
    functionName: "MINT_PRICE",
    query: { enabled: !!achievementAddr && isAddress(achievementAddr ?? "") },
  })
  const { data: matchNftSupply } = useReadContract({
    address: matchNftAddr && isAddress(matchNftAddr) ? matchNftAddr : undefined,
    abi: NFT_SUPPLY_ABI,
    functionName: "totalSupply",
    query: { enabled: !!matchNftAddr && isAddress(matchNftAddr ?? "") },
  })

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then((r) => r.json())
      .then((data) => setEthPrice(data?.ethereum?.usd ?? null))
      .catch(() => null)
  }, [])

  useEffect(() => {
    fetch("/api/matches?limit=50")
      .then((r) => r.json())
      .then((res) => setMatches(res.data || []))
      .catch(console.error)
      .finally(() => setMatchesLoading(false))

    fetch("/api/admin/stats/daily-eth")
      .then((r) => r.json())
      .then((res) => setDailyEth(res.data || []))
      .catch(console.error)
      .finally(() => setDailyEthLoading(false))
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
      {/* Database migrations */}
      <MigrationPanel />

      {/* Qualification summary */}
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Qualification Contract</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Prize Pool</span>
            <span className="cm-highlight text-lg">
              {prizePool != null ? <EthAmount eth={prizePool} price={ethPrice} /> : "—"}
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
        {isQualificationContractAvailable(chainId) && (
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            <a
              href={getAddressExplorerUrl(chainId, getQualificationAddress(chainId))}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--highlight-yellow)] hover:underline"
            >
              View on BaseScan
            </a>
          </p>
        )}
      </div>

      {/* NFT contracts */}
      {(achievementAddr || matchNftAddr) && (
        <div className="cm-panel p-4">
          <h3 className="cm-section-header px-3 py-2 mb-4">NFT Contracts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {achievementAddr && isAddress(achievementAddr) && (
              <>
                <div>
                  <span className="text-muted-foreground block">Achievement NFTs minted</span>
                  <span className="cm-highlight text-lg">
                    {achievementSupply != null ? Number(achievementSupply).toLocaleString() : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Achievement mint price</span>
                  <span>
                    {achievementMintPrice != null
                      ? <EthAmount eth={achievementMintPrice} price={ethPrice} />
                      : "—"}
                  </span>
                </div>
              </>
            )}
            {matchNftAddr && isAddress(matchNftAddr) && (
              <div>
                <span className="text-muted-foreground block">Match NFTs minted</span>
                <span className="cm-highlight text-lg">
                  {matchNftSupply != null ? Number(matchNftSupply).toLocaleString() : "—"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily ETH */}
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Daily ETH Spent</h3>
        {dailyEthLoading ? (
          <p className="text-muted-foreground text-sm p-4">Loading...</p>
        ) : dailyEth.length === 0 ? (
          <p className="text-muted-foreground text-sm p-4">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">ETH Spent</th>
                  <th className="px-3 py-2">Votes</th>
                </tr>
              </thead>
              <tbody>
                {dailyEth.map((row) => (
                  <tr key={row.day} className="border-b border-border/10">
                    <td className="px-3 py-2 text-sm">
                      {new Date(row.day).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-sm cm-highlight">
                      <EthAmount eth={row.total_eth} price={ethPrice} />
                    </td>
                    <td className="px-3 py-2 text-sm">{row.vote_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  <th className="px-3 py-2">Contract</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <MatchOnchainRow key={m.id} match={m} chainId={chainId} ethPrice={ethPrice} />
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
                        <a
                          href={`/users/${v.voter_address}`}
                          className="text-[var(--highlight-yellow)] hover:underline"
                        >
                          {truncateAddress(v.voter_address)}
                        </a>
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
                      <td className="px-3 py-2 text-sm">
                        <EthAmount eth={v.total_cost_eth} price={ethPrice} />
                      </td>
                      <td className="px-3 py-2 text-sm font-mono">
                        {v.tx_hash ? (
                          <a
                            href={getTxExplorerUrl(chainId, v.tx_hash)}
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
