"use client"

import { useState, useEffect, type KeyboardEvent } from "react"
import { X, TrendingUp, Users, Zap, AlertTriangle, Minus, Plus, Info } from "lucide-react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect } from "wagmi"
import { parseEther } from "viem"
import { useFarcaster } from "@/lib/farcaster-provider"
import { ShareModal } from "./share-modal"
import { useNotifications } from "@/components/notifications"

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
  currentPrice: _currentPrice,
  pricePhase,
  matchId,
  contractAddress,
  teamIndex,
}: VoteModalProps) {
  const [voteCount, setVoteCount] = useState(1)
  const [showShareModal, setShowShareModal] = useState(false)
  const [votePlaced, setVotePlaced] = useState(false)
  const [isDemoVote, setIsDemoVote] = useState(false)

  const { address: _address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError } = useWaitForTransactionReceipt({
    hash,
  })
  const { isFrameContext, isAutoConnecting } = useFarcaster()
  const { success, error, info } = useNotifications()

  const basePrice = 0.001 // Starting price in ETH
  const pricePerVote =
    pricePhase === "linear"
      ? basePrice * (1 + 0.01) // Simplified for demo - real price from contract
      : basePrice * (1 + 0.03) // Simplified for demo - real price from contract

  const totalCost = pricePerVote * voteCount

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if ((isSuccess || isDemoVote) && !votePlaced) {
      setVotePlaced(true)
      setTimeout(() => {
        setShowShareModal(true)
      }, 500)
    }
  }, [isSuccess, isDemoVote, votePlaced])

  // Notification for transaction submitted
  useEffect(() => {
    if (hash && isPending) {
      info("Transaction Submitted", "Waiting for confirmation on Base network...")
    }
  }, [hash, isPending, info])

  // Notification for successful vote
  useEffect(() => {
    if (isSuccess) {
      success(
        "Vote Confirmed!",
        `Your ${voteCount} vote${voteCount !== 1 ? "s" : ""} for ${team} ${voteCount !== 1 ? "have" : "has"} been recorded on-chain`
      )
    }
  }, [isSuccess, voteCount, team, success])

  // Notification for transaction errors
  useEffect(() => {
    if (isConfirmError) {
      error("Transaction Failed", "Your vote could not be confirmed. Please try again.")
    }
  }, [isConfirmError, error])

  useEffect(() => {
    if (writeError) {
      error("Transaction Rejected", writeError.message || "Please try again.")
    }
  }, [writeError, error])

  const handleVote = async () => {
    if (voteCount < 1) return

    if (!isConnected) {
      // In Farcaster, wallet should auto-connect. If still connecting, wait.
      if (isFrameContext) {
        if (isAutoConnecting) {
          info("Connecting Wallet", "Wallet is connecting automatically...")
          return
        }
        // Try to connect with Farcaster's injected wallet
        const injectedConnector = connectors.find((c) => c.type === "injected")
        if (injectedConnector) {
          try {
            info("Connecting Wallet", "Connecting via Farcaster wallet...")
            await connect({ connector: injectedConnector })
            return // Will vote on next click after connection settles
          } catch (err) {
            console.error("Failed to connect Farcaster wallet:", err)
            error("Connection Failed", "Unable to connect wallet. Please try again.")
            return
          }
        }
      }

      // Desktop: demo mode
      setIsDemoVote(true)
      info("Demo Vote Placed", "Connect your wallet to place real votes on-chain")
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
    } catch (err) {
      console.error("Vote transaction failed:", err)
      error("Transaction Error", "Failed to submit transaction. Please try again.")
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
                <div className="text-xs lg:text-sm text-muted-foreground">Buy votes to back your team</div>
              </div>
            </div>
            <button onClick={onClose} className="text-foreground hover:text-accent transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isConnected && !isFrameContext && (
            <div className="p-3 bg-purple-900/30 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs lg:text-sm font-bold text-purple-400 uppercase">Demo Mode</span>
              </div>
              <p className="text-xs lg:text-sm text-foreground/70 mt-1">
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
                  <span className="text-xs lg:text-sm font-bold text-green-400 uppercase">Early Bird Window - Vote Now!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs lg:text-sm font-bold text-orange-400 uppercase">Prices Rising Fast!</span>
                </>
              )}
            </div>
            <p className="text-xs lg:text-sm text-foreground/70">
              {pricePhase === "linear"
                ? "First 2 hours! Prices increase gradually with each vote."
                : "Hours 2-24. Prices rise exponentially - earlier is better!"}
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
                <div className="text-xs lg:text-sm font-bold text-accent">Current Pricing Phase</div>
              </div>
              {pricePhase === "linear" ? (
                <div className="text-xs lg:text-sm text-foreground bg-secondary/30 p-2 rounded">
                  <strong className="text-green-400">Phase 1: Early Bird (0-2 hours)</strong>
                  <br />
                  <span className="text-muted-foreground">Price increases gradually with each vote. Best rates!</span>
                </div>
              ) : (
                <div className="text-xs lg:text-sm text-foreground bg-secondary/30 p-2 rounded">
                  <strong className="text-orange-400">Phase 2: Standard (2-24 hours)</strong>
                  <br />
                  <span className="text-muted-foreground">Price rises exponentially. Still 22 hours to vote!</span>
                </div>
              )}
            </div>

            <div className="text-xs lg:text-sm text-muted-foreground">
              Voting is open for 24 hours total. The earlier you vote, the better your price!
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
                <div className="text-xs lg:text-sm text-muted-foreground mt-1">vote{voteCount !== 1 ? "s" : ""}</div>
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
                  className={`cm-nav-tab py-2 rounded-sm text-xs lg:text-sm font-bold transition-all ${
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
                <span className="text-sm text-muted-foreground">Price per Vote:</span>
                <span className="text-sm font-mono text-foreground">{pricePerVote.toFixed(4)} ETH</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total Cost:</span>
                <span className="text-lg font-mono font-bold cm-highlight">{totalCost.toFixed(4)} ETH</span>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs lg:text-sm text-orange-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {pricePhase === "linear"
                      ? "Phase 2 starts in under 2 hours - prices will rise exponentially!"
                      : "Voting in Phase 2 - prices rising fast with each new vote"}
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
                <p className="text-xs lg:text-sm text-green-400/70 mt-1">Share your vote to earn bragging rights!</p>
              </div>
            )}

            {/* Winner Info */}
            <div className="mt-4 flex items-start gap-2 bg-accent/10 border border-accent/30 rounded-sm p-3">
              <Users className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs lg:text-sm text-foreground">
                <strong>All winning voters share 90% of prize pool proportionally.</strong> Your share = (Your Votes /
                Total Winning Votes) × 90% Pool. You have 24 hours to vote!
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
                  ? "Connecting Wallet..."
                  : isConnected
                    ? `Buy ${voteCount} Vote${voteCount !== 1 ? "s" : ""} for ${totalCost.toFixed(3)} ETH`
                    : isFrameContext
                      ? "Connect Wallet"
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
