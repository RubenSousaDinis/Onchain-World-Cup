"use client"

import { useEffect, useState } from "react"
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

interface DbCountry {
  id: string
  name: string
  code: string
  flag_emoji: string
}

export function QualificationTab() {
  const chainId = useChainId()
  const available = isQualificationContractAvailable(chainId)

  const { data: finalized } = useQualificationFinalized(chainId)
  const { data: endTime } = useQualificationEndTime(chainId)
  const { data: prizePool } = useTotalPrizePool(chainId)

  const [countries, setCountries] = useState<CountryRow[]>([])
  const [dbCountries, setDbCountries] = useState<DbCountry[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  // Add countries state
  const [addCodesInput, setAddCodesInput] = useState("")
  const [addSelected, setAddSelected] = useState<Set<string>>(new Set())

  const { data: finalizeHash, isPending: finalizePending, writeContract: writeFinalizeContract } = useWriteContract()
  const { isLoading: finalizeConfirming } = useWaitForTransactionReceipt({ hash: finalizeHash })

  const { data: sweepHash, isPending: sweepPending, writeContract: writeSweepContract } = useWriteContract()
  const { isLoading: sweepConfirming } = useWaitForTransactionReceipt({ hash: sweepHash })

  const { data: addHash, isPending: addPending, writeContract: writeAddContract } = useWriteContract()
  const { isLoading: addConfirming } = useWaitForTransactionReceipt({ hash: addHash })

  useEffect(() => {
    fetch("/api/qualification/countries")
      .then((r) => r.json())
      .then((res) => {
        const data: CountryRow[] = res.data || res || []
        data.sort((a, b) => b.total_votes - a.total_votes)
        setCountries(data)
        const top48 = new Set(data.slice(0, 48).map((c) => c.code))
        setSelected(top48)
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // Fetch all countries from the database (for the "add" picker)
    fetch("/api/matches")
      .then(() =>
        // Use the Supabase countries list via a simple fetch
        fetch("/api/qualification/countries?limit=100&sort=code&order=asc")
      )
      .then((r) => r.json())
      .then((res) => {
        const data = res.data || []
        setDbCountries(
          data.map((c: { country_code: string }) => ({
            id: c.country_code,
            name: c.country_code,
            code: c.country_code,
            flag_emoji: "",
          }))
        )
      })
      .catch(console.error)
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

  const handleAddCountries = () => {
    if (!available) return
    const contractAddress = getQualificationAddress(chainId)

    // Collect codes from manual input + picker selection
    const manualCodes = addCodesInput
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0 && c.length <= 8)
    const pickerCodes = Array.from(addSelected)
    const allCodes = [...new Set([...manualCodes, ...pickerCodes])]

    if (allCodes.length === 0) return

    const countryBytes = allCodes.map(countryCodeToBytes8)

    if (countryBytes.length === 1) {
      writeAddContract({
        address: contractAddress,
        abi: WORLD_CUP_QUALIFICATION_ABI,
        functionName: "addCountry",
        args: [countryBytes[0]],
      })
    } else {
      writeAddContract({
        address: contractAddress,
        abi: WORLD_CUP_QUALIFICATION_ABI,
        functionName: "addCountries",
        args: [countryBytes],
      })
    }
  }

  // Codes already on-chain (from the countries API)
  const existingCodes = new Set(countries.map((c) => c.code))

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

      {/* Add Countries */}
      {!finalized && (
        <div className="cm-panel p-4">
          <h3 className="cm-section-header px-3 py-2 mb-4">Add Countries to Contract</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Register new country codes on the qualification contract. Countries must be added before users can vote for them.
          </p>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Country codes (comma-separated, max 8 chars each)
              </label>
              <input
                type="text"
                value={addCodesInput}
                onChange={(e) => setAddCodesInput(e.target.value)}
                placeholder="e.g. ARG, BRA, FRA, GB-ENG"
                className="w-full bg-background border border-border/50 rounded px-3 py-2 text-sm font-mono"
              />
            </div>

            {addCodesInput && (
              <div className="text-xs text-muted-foreground">
                Parsed codes:{" "}
                {addCodesInput
                  .split(",")
                  .map((c) => c.trim().toUpperCase())
                  .filter((c) => c.length > 0 && c.length <= 8)
                  .map((code) => (
                    <span
                      key={code}
                      className={`inline-block px-1.5 py-0.5 rounded mr-1 mb-1 ${
                        existingCodes.has(code)
                          ? "bg-yellow-900/30 text-yellow-400"
                          : "bg-[var(--nav-purple)] text-foreground"
                      }`}
                    >
                      {code}
                      {existingCodes.has(code) && " (exists)"}
                    </span>
                  ))}
              </div>
            )}

            {addHash && (
              <p className="text-green-400 text-sm">
                Transaction sent: <code className="text-xs break-all">{addHash}</code>
              </p>
            )}

            <button
              onClick={handleAddCountries}
              disabled={
                addPending ||
                addConfirming ||
                (!addCodesInput.trim() && addSelected.size === 0)
              }
              className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-6 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {addPending || addConfirming
                ? "Confirming..."
                : `Add Countries to Contract`}
            </button>
          </div>
        </div>
      )}

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
