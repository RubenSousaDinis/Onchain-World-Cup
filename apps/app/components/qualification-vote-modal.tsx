"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, Zap, AlertTriangle, Minus, Plus, Info } from "lucide-react"
import { useAccount, useConnect } from "wagmi"
import { useQualificationVotePrice } from "@/lib/hooks/use-vote-price"
import { useNotifications } from "@/components/notifications"

interface QualificationVoteModalProps {
  isOpen: boolean
  onClose: () => void
  country: {
    name: string
    flag: string
    code: string
    rank: number
    votes: number
  } | null
  contractAddress?: `0x${string}`
}

export function QualificationVoteModal({ isOpen, onClose, country, contractAddress }: QualificationVoteModalProps) {
  const [voteCount, setVoteCount] = useState(1)
  const [isVoting, setIsVoting] = useState(false)

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { success, error, info } = useNotifications()

  // Real-time vote price from contract (if contract address is provided)
  const {
    currentVotes: contractVotes,
    votePrice,
    pricePerVote,
    isLoading: isPriceLoading,
  } = useQualificationVotePrice({
    contractAddress: contractAddress || "0x0000000000000000000000000000000000000000",
    countryCode: country?.code || "",
    voteCount,
    enabled: !!contractAddress && !!country?.code && isOpen,
  })

  // Use mock pricing if no contract address is provided
  const useMockPricing = !contractAddress
  const mockBasePrice = 0.001 // Starting price in ETH
  const mockCurrentPrice = mockBasePrice * (1 + (country?.votes || 0) * 0.0001)
  const mockTotalCost = mockCurrentPrice * voteCount

  // Use real or mock data based on contract availability
  const currentPrice = useMockPricing ? mockCurrentPrice : parseFloat(pricePerVote)
  const totalCost = useMockPricing ? mockTotalCost : parseFloat(votePrice)
  const displayVotes = useMockPricing ? country?.votes || 0 : contractVotes

  useEffect(() => {
    if (!isOpen) {
      setVoteCount(1)
      setIsVoting(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape as any)
    return () => window.removeEventListener("keydown", handleEscape as any)
  }, [isOpen, onClose])

  const handleVote = async () => {
    if (voteCount < 1) return

    if (!isConnected) {
      // Try to connect wallet first
      const coinbaseConnector = connectors.find((c) => c.name === "Coinbase Wallet")
      if (coinbaseConnector) {
        try {
          info("Connecting Wallet", "Please approve the connection request...")
          await connect({ connector: coinbaseConnector })
          success("Wallet Connected", "You can now place your vote")
        } catch (err) {
          console.error("Failed to connect wallet:", err)
          error("Connection Failed", "Unable to connect wallet. Please try again.")
        }
      }
      return
    }

    setIsVoting(true)
    info("Submitting Vote", `Voting for ${country?.name} with ${voteCount} vote${voteCount !== 1 ? "s" : ""}...`)

    // TODO: Call smart contract to vote
    // For now, just simulate
    setTimeout(() => {
      setIsVoting(false)
      success(
        "Vote Confirmed!",
        `Your ${voteCount} vote${voteCount !== 1 ? "s" : ""} for ${country?.name} ${voteCount !== 1 ? "have" : "has"} been recorded`
      )
      onClose()
    }, 2000)
  }

  if (!isOpen || !country) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg cm-panel rounded-sm border-2 border-accent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-secondary/40 p-4 border-b-2 border-accent/30 flex items-center justify-between">
          <h2 className="text-lg font-bold cm-highlight">Vote for Qualification</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Country Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-sm border border-border">
            <span className="text-5xl">{country.flag}</span>
            <div>
              <h3 className="text-2xl font-bold cm-highlight">{country.name}</h3>
              <p className="text-sm text-muted-foreground">
                Current Rank: <span className="cm-highlight font-bold">#{country.rank}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total Votes: <span className="text-foreground font-bold">{displayVotes.toLocaleString()}</span>
                {!useMockPricing && !isPriceLoading && <span className="text-accent ml-1">●</span>}
              </p>
            </div>
          </div>

          {/* Vote Count Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold cm-highlight">Number of Votes</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
                className="cm-nav-tab w-10 h-10 flex items-center justify-center font-bold"
                disabled={voteCount <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={voteCount}
                onChange={(e) => setVoteCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-input border border-border rounded-sm px-4 py-2 text-center text-lg font-bold cm-highlight"
                min="1"
              />
              <button
                onClick={() => setVoteCount(voteCount + 1)}
                className="cm-nav-tab w-10 h-10 flex items-center justify-center font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              {[1, 5, 10, 25].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setVoteCount(amount)}
                  className="flex-1 cm-nav-tab py-1.5 text-xs font-bold"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Price Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Price per Vote:</span>
              <span className="font-bold cm-highlight">
                {isPriceLoading && !useMockPricing ? "Loading..." : `${currentPrice.toFixed(6)} ETH`}
                {!useMockPricing && !isPriceLoading && <span className="text-accent ml-1 text-xs">LIVE</span>}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="cm-highlight">Total Cost:</span>
              <span className="text-accent">
                {isPriceLoading && !useMockPricing ? "..." : `${totalCost.toFixed(6)} ETH`}
              </span>
            </div>
            {useMockPricing && (
              <p className="text-xs text-muted-foreground italic">
                * Estimated prices - Contract not deployed yet
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-secondary/20 border border-accent/30 rounded-sm p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><Zap className="w-3 h-3 inline text-accent" /> <strong>Early voters get better prices</strong> - Price increases with each vote</p>
                <p><TrendingUp className="w-3 h-3 inline text-green-500" /> Help {country.name} qualify for the tournament!</p>
                <p><AlertTriangle className="w-3 h-3 inline text-yellow-500" /> Top 48 countries qualify</p>
              </div>
            </div>
          </div>

          {/* Wallet Status */}
          {!isConnected && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 text-center">
              <p className="text-sm text-destructive-foreground">
                Connect your wallet to vote
              </p>
            </div>
          )}

          {address && (
            <div className="text-xs text-muted-foreground text-center">
              Voting from: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 cm-nav-tab py-3 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={isVoting || voteCount < 1}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-3 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVoting ? "Voting..." : isConnected ? `Vote ${totalCost.toFixed(6)} ETH` : "Connect & Vote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
