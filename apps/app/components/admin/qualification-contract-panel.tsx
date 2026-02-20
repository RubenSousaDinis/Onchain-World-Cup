"use client"

import { useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"
import {
  getQualificationAddress,
  isQualificationContractAvailable,
  useTotalPrizePool,
  useQualificationFinalized,
  useQualificationEndTime,
  usePaused,
} from "@/lib/contracts/qualification"
import { WORLD_CUP_QUALIFICATION_ABI } from "@/lib/contracts/qualification-abi"
import { getAddressExplorerUrl } from "@/lib/admin"

export function QualificationContractPanel() {
  const chainId = useChainId()
  const available = isQualificationContractAvailable(chainId)

  const { data: prizePool } = useTotalPrizePool(chainId)
  const { data: finalized } = useQualificationFinalized(chainId)
  const { data: endTime } = useQualificationEndTime(chainId)
  const { data: isPaused, refetch: refetchPaused } = usePaused(chainId)

  const { data: hash, isPending, writeContract } = useWriteContract()
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash })

  if (!available) {
    return (
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-4">Qualification Contract</h3>
        <p className="text-muted-foreground text-sm">
          Qualification contract not deployed on current chain.
        </p>
      </div>
    )
  }

  const contractAddress = getQualificationAddress(chainId)

  const handlePauseToggle = () => {
    writeContract({
      address: contractAddress,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: isPaused ? "unpause" : "pause",
    })
    setTimeout(() => refetchPaused(), 5000)
  }

  return (
    <div className="cm-panel p-4">
      <h3 className="cm-section-header px-3 py-2 mb-4">Qualification Contract</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
        <div>
          <span className="text-muted-foreground block">Prize Pool</span>
          <span className="cm-highlight">
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
          <span>{endTime ? new Date(Number(endTime) * 1000).toLocaleString() : "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Paused</span>
          <span className={isPaused ? "text-red-400" : "text-green-400"}>
            {isPaused != null ? (isPaused ? "Yes" : "No") : "—"}
          </span>
        </div>
      </div>

      <button
        onClick={handlePauseToggle}
        disabled={isPending || confirming}
        className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {isPending || confirming ? "Pending..." : isPaused ? "Unpause" : "Pause"}
      </button>

      <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
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
    </div>
  )
}
