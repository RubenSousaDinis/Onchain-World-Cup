"use client"

import { useState } from "react"
import { useChainId } from "wagmi"
import { Address, formatEther } from "viem"
import { getAddressExplorerUrl } from "@/lib/admin"
import {
  useMatchDetails,
  useMatchPaused,
  useMatchPlatformFee,
  useMatchPlatformAddress,
  useMatchPause,
  useMatchSetPlatformFee,
  useMatchSetPlatformAddress,
} from "@/lib/contracts/match-admin"

export function MatchContractPanel({ contractAddress }: { contractAddress: Address }) {
  const chainId = useChainId()
  const { data: details, isLoading: detailsLoading } = useMatchDetails(contractAddress)
  const { data: isPaused, refetch: refetchPaused } = useMatchPaused(contractAddress)
  const { data: feePercent } = useMatchPlatformFee(contractAddress)
  const { data: platAddr } = useMatchPlatformAddress(contractAddress)

  const { pause, unpause, isPending: pausePending } = useMatchPause(contractAddress)
  const { setPlatformFee, isPending: feePending } = useMatchSetPlatformFee(contractAddress)
  const { setPlatformAddress, isPending: addrPending } = useMatchSetPlatformAddress(contractAddress)

  const [newFee, setNewFee] = useState("")
  const [newAddr, setNewAddr] = useState("")

  if (detailsLoading) {
    return <p className="text-muted-foreground text-sm">Loading contract state...</p>
  }

  const prizePool = details ? details[6] : BigInt(0)
  const phase = details ? Number(details[8]) : 0
  const isFinalized = details ? details[9] : false

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground font-mono break-all">
        Contract:{" "}
        <a
          href={getAddressExplorerUrl(chainId, contractAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--highlight-yellow)] hover:underline"
        >
          {contractAddress}
        </a>
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground block">Prize Pool</span>
          <span className="cm-highlight">{Number(formatEther(prizePool)).toFixed(4)} ETH</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Phase</span>
          <span>{phase === 0 ? "Closed" : `Phase ${phase}`}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Finalized</span>
          <span className={isFinalized ? "text-green-400" : "text-yellow-400"}>
            {isFinalized ? "Yes" : "No"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Paused</span>
          <span className={isPaused ? "text-red-400" : "text-green-400"}>
            {isPaused ? "Yes" : "No"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2 border-t border-border/20">
        <button
          onClick={() => {
            if (isPaused) {
              unpause()
            } else {
              pause()
            }
            setTimeout(() => refetchPaused(), 5000)
          }}
          disabled={pausePending}
          className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {pausePending ? "Pending..." : isPaused ? "Unpause" : "Pause"}
        </button>
      </div>

      <div className="pt-2 border-t border-border/20 space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-muted-foreground mb-1">
              Platform Fee (basis points, current: {feePercent != null ? Number(feePercent) : "?"})
            </label>
            <input
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="e.g. 1000 = 10%"
              className="w-full bg-background border border-border/50 rounded px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={() => {
              if (newFee) setPlatformFee(BigInt(newFee))
            }}
            disabled={feePending || !newFee}
            className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
          >
            {feePending ? "..." : "Set Fee"}
          </button>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-muted-foreground mb-1">
              Platform Address (current: {platAddr ? `${String(platAddr).slice(0, 8)}...` : "?"})
            </label>
            <input
              type="text"
              value={newAddr}
              onChange={(e) => setNewAddr(e.target.value)}
              placeholder="0x..."
              className="w-full bg-background border border-border/50 rounded px-3 py-1.5 text-sm font-mono"
            />
          </div>
          <button
            onClick={() => {
              if (newAddr) setPlatformAddress(newAddr as Address)
            }}
            disabled={addrPending || !newAddr}
            className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
          >
            {addrPending ? "..." : "Set Address"}
          </button>
        </div>
      </div>
    </div>
  )
}
