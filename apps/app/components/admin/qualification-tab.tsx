"use client"

import { useEffect, useState, useMemo } from "react"
import { useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"
import {
  getQualificationAddress,
  isQualificationContractAvailable,
  useQualificationFinalized,
  useQualificationEndTime,
  useTotalPrizePool,
  countryCodeToBytes8,
} from "@/lib/contracts/qualification"
import { WORLD_CUP_QUALIFICATION_ABI } from "@/lib/contracts/qualification-abi"

interface CountryRow {
  code: string
  name: string
  flag_emoji: string
  total_votes: number
  total_eth: string
}

export function QualificationTab() {
  const chainId = useChainId()
  const available = isQualificationContractAvailable(chainId)

  const { data: finalized } = useQualificationFinalized(chainId)
  const { data: endTime } = useQualificationEndTime(chainId)
  const { data: prizePool } = useTotalPrizePool(chainId)

  const [countries, setCountries] = useState<CountryRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  const { data: finalizeHash, isPending: finalizePending, writeContract: writeFinalizeContract } = useWriteContract()
  const { isLoading: finalizeConfirming } = useWaitForTransactionReceipt({ hash: finalizeHash })

  const { data: sweepHash, isPending: sweepPending, writeContract: writeSweepContract } = useWriteContract()
  const { isLoading: sweepConfirming } = useWaitForTransactionReceipt({ hash: sweepHash })

  useEffect(() => {
    fetch("/api/qualification/countries")
      .then((r) => r.json())
      .then((res) => {
        const data: CountryRow[] = res.data || res || []
        // Sort by votes descending
        data.sort((a, b) => b.total_votes - a.total_votes)
        setCountries(data)
        // Pre-select top 48
        const top48 = new Set(data.slice(0, 48).map((c) => c.code))
        setSelected(top48)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleCountry = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  const handleFinalize = () => {
    if (!available) return
    const contractAddress = getQualificationAddress(chainId)
    const qualifiedBytes = Array.from(selected).map(countryCodeToBytes8)

    writeFinalizeContract({
      address: contractAddress,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: "finalizeQualification",
      args: [qualifiedBytes],
    })
    setShowConfirm(false)
  }

  const handleSweep = () => {
    if (!available) return
    const contractAddress = getQualificationAddress(chainId)

    writeSweepContract({
      address: contractAddress,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: "sweepResidual",
    })
  }

  if (!available) {
    return (
      <div className="cm-panel p-4">
        <p className="text-muted-foreground">Qualification contract not deployed on current chain.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Qualification Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Prize Pool</span>
            <span className="cm-highlight text-lg">
              {prizePool != null ? `${Number(formatEther(prizePool)).toFixed(4)} ETH` : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">End Time</span>
            <span>{endTime ? new Date(Number(endTime) * 1000).toLocaleString() : "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Finalized</span>
            <span className={finalized ? "text-green-400" : "text-yellow-400"}>
              {finalized != null ? (finalized ? "Yes" : "No") : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Finalize */}
      {!finalized && (
        <div className="cm-panel p-4">
          <h3 className="cm-section-header px-3 py-2 mb-4">
            Finalize Qualification — {selected.size}/48 Selected
          </h3>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading countries...</p>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto mb-4">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                      <th className="px-3 py-2 w-10"></th>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Country</th>
                      <th className="px-3 py-2">Votes</th>
                      <th className="px-3 py-2">ETH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((c, i) => (
                      <tr
                        key={c.code}
                        className={`border-b border-border/10 cursor-pointer ${
                          selected.has(c.code) ? "bg-[var(--nav-purple)]/20" : ""
                        }`}
                        onClick={() => toggleCountry(c.code)}
                      >
                        <td className="px-3 py-1.5">
                          <input
                            type="checkbox"
                            checked={selected.has(c.code)}
                            onChange={() => toggleCountry(c.code)}
                            className="accent-[var(--highlight-yellow)]"
                          />
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-1.5 text-sm">
                          {c.flag_emoji} {c.name}
                        </td>
                        <td className="px-3 py-1.5 text-sm">{c.total_votes}</td>
                        <td className="px-3 py-1.5 text-sm">{c.total_eth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={selected.size === 0}
                  className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-6 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Finalize with {selected.size} Countries
                </button>
              ) : (
                <div className="border border-red-400/50 rounded p-4 space-y-3">
                  <p className="text-red-400 font-semibold text-sm">
                    This action is irreversible. Confirm finalization with {selected.size} countries?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleFinalize}
                      disabled={finalizePending || finalizeConfirming}
                      className="bg-red-600 text-white px-6 py-2 text-sm font-semibold rounded disabled:opacity-50"
                    >
                      {finalizePending || finalizeConfirming ? "Confirming..." : "Confirm Finalize"}
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="bg-background border border-border/50 px-6 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Sweep Residual */}
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Sweep Residual</h3>
        <p className="text-muted-foreground text-sm mb-3">
          Sweep remaining contract balance to the fee recipient. Only available after finalization.
        </p>
        <button
          onClick={handleSweep}
          disabled={!finalized || sweepPending || sweepConfirming}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-6 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {sweepPending || sweepConfirming ? "Pending..." : "Sweep Residual"}
        </button>
      </div>
    </div>
  )
}
