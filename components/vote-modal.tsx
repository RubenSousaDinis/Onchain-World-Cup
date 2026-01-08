"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, Users, Zap, AlertTriangle, Minus, Plus, Info } from "lucide-react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect } from "wagmi"
import { parseEther } from "viem"
import { useFarcaster } from "@/lib/farcaster-provider"
import { ShareModal } from "./share-modal"

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  team: string
  teamFlag: string
  opponent?: string
  opponentFlag?: string
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
  opponent,
  opponentFlag,
  currentPrice,
  pricePhase,
  matchId,
  contractAddress,
  teamIndex,
}: VoteModalProps) {
  const [voteCount, setVoteCount] = useState(1)
  const [showShareModal, setShowShareModal] = useState(false)
  const [votePlaced, setVotePlaced] = useState(false)
  const [isDemoVote, setIsDemoVote] = useState(false)

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  const { isFrameContext, isAutoConnecting } = useFarcaster()

  const basePrice = 0.001 // Starting price in ETH
  const pricePerVote =
    pricePhase === "linear"
      ? basePrice * (1 + 0.005 * voteCount) // Phase 1: +0.5% per vote (linear)
      : basePrice * Math.pow(1.02, voteCount) // Phase 2: +2% compounding per vote (exponential)

  const totalCost =
    pricePhase === "linear"
      ? basePrice * voteCount * (1 + (0.005 * (voteCount + 1)) / 2) // Sum of linear series
      : (basePrice * (Math.pow(1.02, voteCount) - 1)) / 0.02 // Sum of geometric series

  const nextVotePrice =
    pricePhase === "linear" ? basePrice * (1 + 0.005 * (voteCount + 1)) : basePrice * Math.pow(1.02, voteCount + 1)

  useEffect(() => {
    if ((isSuccess || isDemoVote) && !votePlaced) {
      setVotePlaced(true)
      setTimeout(() => {
        setShowShareModal(true)
      }, 500)
    }
  }, [isSuccess, isDemoVote, votePlaced])

  const handleVote = async () => {
    if (voteCount < 1) return

    if (!isConnected) {
      setIsDemoVote(true)
      return
    }

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
        value: parseEther(totalCost.toString()),
      })
    } catch (error) {
      console.error("[v0] Vote transaction failed:", error)
    }
  }

  const handleCloseAll = () => {
    setShowShareModal(false)
    setVotePlaced(false)
    setIsDemoVote(false)
    setVoteCount(1)
    onClose()
  }

  const incrementVotes = () => setVoteCount((prev) => Math.min(prev + 1, 100))
  const decrementVotes = () => setVoteCount((prev) => Math.max(prev - 1, 1))

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
        <div className="cm-panel w-full max-w-md rounded-sm border-2 border-primary max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-secondary p-4 flex items-center justify-between border-b border-border sticky top-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{teamFlag}</span>
              <div>
                <div className="text-lg font-bold text-foreground">Vote for {team}</div>
                <div className="text-xs text-muted-foreground">Buy votes to back your team</div>
              </div>
            </div>
            <button onClick={onClose} className="text-foreground hover:text-accent transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isConnected && (
            <div className="p-3 bg-purple-900/30 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase">Demo Mode</span>
              </div>
              <p className="text-[10px] text-foreground/70 mt-1">
                Try voting without connecting! Share feature will still work.
              </p>
            </div>
          )}

          {/* FOMO Banner */}
          <div
            className={`p-3 border-b border-border ${pricePhase === "linear" ? "bg-green-900/20" : "bg-orange-900/20"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {pricePhase === "linear" ? (
                <>
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold text-green-400 uppercase">Early Bird Pricing Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-400 uppercase">Prices Rising Fast!</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-foreground/70">
              {pricePhase === "linear"
                ? "You're getting the best rates! Prices increase after Phase 1 ends."
                : "Vote now before prices increase further. Every minute counts!"}
            </p>
          </div>

          {/* Pricing Info */}
          <div className="p-4 bg-card/50 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-foreground">
                  {pricePhase === "linear" ? "Phase 1: Linear Pricing" : "Phase 2: Exponential Pricing"}
                </span>
              </div>
            </div>

            <div className="cm-panel p-3 rounded-sm mb-3">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-xs font-bold text-accent">Pricing Formula</div>
              </div>
              {pricePhase === "linear" ? (
                <div className="text-xs text-foreground font-mono bg-secondary/30 p-2 rounded">
                  Price = Base × (1 + 0.5% × vote_number)
                  <br />
                  <span className="text-muted-foreground">Each vote costs 0.5% more than the previous</span>
                </div>
              ) : (
                <div className="text-xs text-foreground font-mono bg-secondary/30 p-2 rounded">
                  Price = Base × 1.02^vote_number
                  <br />
                  <span className="text-muted-foreground">Each vote costs 2% more than the previous (compounds)</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {pricePhase === "linear"
                ? "First 2 hours after match opens. Best time to vote!"
                : "Hours 2-24. Prices rise rapidly - vote early for better rates."}
            </div>
          </div>

          {/* Vote Count Selector */}
          <div className="p-6">
            <label className="block text-sm font-bold text-foreground mb-4 text-center">
              How many votes do you want to buy?
            </label>

            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={decrementVotes}
                disabled={voteCount <= 1}
                className="cm-nav-tab w-12 h-12 rounded-sm flex items-center justify-center text-xl font-bold disabled:opacity-50 hover:scale-105 transition-transform"
              >
                <Minus className="w-6 h-6" />
              </button>

              <div className="cm-panel px-8 py-4 rounded-sm text-center min-w-[120px]">
                <div className="text-4xl font-bold cm-highlight font-mono">{voteCount}</div>
                <div className="text-xs text-muted-foreground mt-1">vote{voteCount !== 1 ? "s" : ""}</div>
              </div>

              <button
                onClick={incrementVotes}
                disabled={voteCount >= 100}
                className="cm-nav-tab w-12 h-12 rounded-sm flex items-center justify-center text-xl font-bold disabled:opacity-50 hover:scale-105 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[1, 5, 10, 25].map((count) => (
                <button
                  key={count}
                  onClick={() => setVoteCount(count)}
                  className={`cm-nav-tab py-2 rounded-sm text-xs font-bold transition-all ${
                    voteCount === count ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {count} vote{count !== 1 ? "s" : ""}
                </button>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="cm-panel p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Number of Votes:</span>
                <span className="text-sm font-mono font-bold cm-highlight">{voteCount}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Base Price:</span>
                <span className="text-sm font-mono text-foreground">{basePrice.toFixed(4)} ETH</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Price for Vote #{voteCount}:</span>
                <span className="text-sm font-mono text-foreground">
                  {(pricePhase === "linear"
                    ? basePrice * (1 + 0.005 * voteCount)
                    : basePrice * Math.pow(1.02, voteCount)
                  ).toFixed(4)}{" "}
                  ETH
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total Cost:</span>
                <span className="text-lg font-mono font-bold cm-highlight">{totalCost.toFixed(4)} ETH</span>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-[10px] text-orange-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    Vote #{voteCount + 1} will cost {nextVotePrice.toFixed(4)} ETH (+
                    {pricePhase === "linear" ? "0.5%" : "2%"} more)
                  </span>
                </div>
              </div>
            </div>

            {isConfirming && (
              <div className="mt-4 bg-accent/10 border border-accent/30 rounded-sm p-3 text-center">
                <p className="text-sm text-accent font-bold">Transaction confirming...</p>
              </div>
            )}

            {(isSuccess || isDemoVote) && (
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-sm p-3 text-center">
                <p className="text-sm text-green-400 font-bold">
                  {isDemoVote ? "Demo vote placed!" : "Vote placed successfully!"}
                </p>
                <p className="text-xs text-green-400/70 mt-1">Share your vote to earn bragging rights!</p>
              </div>
            )}

            {/* Winner Info */}
            <div className="mt-4 flex items-start gap-2 bg-accent/10 border border-accent/30 rounded-sm p-3">
              <Users className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground">
                <strong>All winning voters share 90% of prize pool proportionally.</strong> Your share = (Your Votes /
                Total Winning Votes) x 90% Pool.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-border flex gap-3 sticky bottom-0 bg-card">
            <button
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="flex-1 cm-panel py-3 rounded-sm font-bold uppercase text-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={isPending || isConfirming || isAutoConnecting || voteCount < 1}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPending || isConfirming
                ? "Voting..."
                : isAutoConnecting
                  ? "Connecting..."
                  : isConnected
                    ? `Buy ${voteCount} Vote${voteCount !== 1 ? "s" : ""} for ${totalCost.toFixed(3)} ETH`
                    : `Try Demo Vote (${voteCount} vote${voteCount !== 1 ? "s" : ""})`}
            </button>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={handleCloseAll}
        type="vote"
        data={{
          team,
          teamFlag,
          opponent,
          opponentFlag,
          votes: voteCount,
          amount: totalCost.toFixed(4),
          matchId,
        }}
      />
    </>
  )
}
