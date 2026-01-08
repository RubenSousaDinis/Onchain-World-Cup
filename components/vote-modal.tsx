"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, Users } from "lucide-react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect } from "wagmi"
import { parseEther } from "viem"
import { useFarcaster } from "@/lib/farcaster-provider"

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  team: string
  teamFlag: string
  currentPrice: number
  pricePhase: "linear" | "exponential"
  matchId: string
  contractAddress: `0x${string}`
  teamIndex: number
}

export function VoteModal({
  isOpen,
  onClose,
  team,
  teamFlag,
  currentPrice,
  pricePhase,
  matchId,
  contractAddress,
  teamIndex,
}: VoteModalProps) {
  const [voteAmount, setVoteAmount] = useState("")
  const [estimatedCost, setEstimatedCost] = useState(0)

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  const { isFrameContext, isAutoConnecting } = useFarcaster()

  useEffect(() => {
    if (voteAmount && !isNaN(Number.parseFloat(voteAmount))) {
      // Simplified pricing calculation
      const amount = Number.parseFloat(voteAmount)
      const baseCost = currentPrice * amount
      const phaseFee = pricePhase === "exponential" ? baseCost * 0.15 : baseCost * 0.05
      setEstimatedCost(baseCost + phaseFee)
    } else {
      setEstimatedCost(0)
    }
  }, [voteAmount, currentPrice, pricePhase])

  useEffect(() => {
    if (isSuccess) {
      setVoteAmount("")
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }, [isSuccess, onClose])

  const handleVote = async () => {
    if (!voteAmount || isNaN(Number.parseFloat(voteAmount)) || !isConnected) return

    try {
      writeContract({
        address: contractAddress,
        abi: [
          {
            name: "vote",
            type: "function",
            stateMutability: "payable",
            inputs: [{ name: "teamIndex", type: "uint8" }],
            outputs: [],
          },
        ],
        functionName: "vote",
        args: [teamIndex],
        value: parseEther(estimatedCost.toString()),
      })
    } catch (error) {
      console.error("[v0] Vote transaction failed:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="cm-panel w-full max-w-md rounded-sm border-2 border-primary">
        {/* Header */}
        <div className="bg-secondary p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{teamFlag}</span>
            <div>
              <div className="text-lg font-bold text-foreground">Vote for {team}</div>
              <div className="text-xs text-muted-foreground">Place your ETH vote</div>
            </div>
          </div>
          <button onClick={onClose} className="text-foreground hover:text-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Phase Info */}
        <div className="p-4 bg-card/50 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-foreground">
                {pricePhase === "linear" ? "Phase 1: Linear Pricing" : "Phase 2: Exponential Pricing"}
              </span>
            </div>
            <div className="cm-panel px-2 py-1 rounded-sm">
              <span className="text-xs cm-highlight font-mono">{currentPrice.toFixed(4)} ETH</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {pricePhase === "linear" ? "First 2 hours: +5% fee per vote" : "Hours 2-24: +15% exponential fee"}
          </div>
        </div>

        {/* Vote Input */}
        <div className="p-6">
          <label className="block text-sm font-bold text-foreground mb-2">Vote Amount (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={voteAmount}
            onChange={(e) => setVoteAmount(e.target.value)}
            placeholder="0.00"
            disabled={!isConnected}
            className="w-full bg-input border-2 border-border rounded-sm px-4 py-3 text-lg font-mono text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
          />

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[0.01, 0.05, 0.1, 0.5].map((amount) => (
              <button
                key={amount}
                onClick={() => setVoteAmount(amount.toString())}
                disabled={!isConnected}
                className="cm-nav-tab py-2 rounded-sm text-xs font-bold disabled:opacity-50"
              >
                {amount} ETH
              </button>
            ))}
          </div>

          {/* Estimated Cost */}
          {estimatedCost > 0 && (
            <div className="mt-6 cm-panel p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Base Cost:</span>
                <span className="text-sm font-mono text-foreground">
                  {(currentPrice * Number.parseFloat(voteAmount)).toFixed(4)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Phase Fee ({pricePhase}):</span>
                <span className="text-sm font-mono text-foreground">
                  {(estimatedCost - currentPrice * Number.parseFloat(voteAmount)).toFixed(4)} ETH
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total Cost:</span>
                <span className="text-lg font-mono font-bold cm-highlight">{estimatedCost.toFixed(4)} ETH</span>
              </div>
            </div>
          )}

          {isConfirming && (
            <div className="mt-4 bg-accent/10 border border-accent/30 rounded-sm p-3 text-center">
              <p className="text-sm text-accent font-bold">Transaction confirming...</p>
            </div>
          )}

          {isSuccess && (
            <div className="mt-4 bg-accent/10 border border-accent/30 rounded-sm p-3 text-center">
              <p className="text-sm text-accent font-bold">Vote placed successfully!</p>
            </div>
          )}

          {/* Warning */}
          <div className="mt-4 flex items-start gap-2 bg-accent/10 border border-accent/30 rounded-sm p-3">
            <Users className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground">
              <strong>All winning voters share 90% of prize pool proportionally.</strong> Your share = (Your Votes /
              Total Winning Votes) × 90% Pool.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border flex gap-3">
          {!isConnected && !isAutoConnecting ? (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform"
            >
              {isFrameContext ? "Connecting Wallet..." : "Connect Wallet to Vote"}
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={isPending || isConfirming}
                className="flex-1 cm-panel py-3 rounded-sm font-bold uppercase text-sm hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVote}
                disabled={
                  !voteAmount || isNaN(Number.parseFloat(voteAmount)) || isPending || isConfirming || isAutoConnecting
                }
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {isPending || isConfirming ? "Voting..." : isAutoConnecting ? "Connecting..." : "Place Vote"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
