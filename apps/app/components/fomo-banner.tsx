"use client"

import { Flame, AlertTriangle, Zap } from "lucide-react"
import { useEffect, useState } from "react"

interface FomoBannerProps {
  pricePhase: "linear" | "exponential"
  timeRemaining: string
  currentPrice: string
  recentVotes?: number
}

export function FomoBanner({ pricePhase, timeRemaining, currentPrice, recentVotes = 0 }: FomoBannerProps) {
  const [showUrgent, setShowUrgent] = useState(false)

  useEffect(() => {
    // Parse time remaining to show urgent message
    const match = timeRemaining.match(/(\d+)h?\s*(\d+)?m?/)
    if (match) {
      const hours = Number.parseInt(match[1]) || 0
      const minutes = Number.parseInt(match[2]) || 0
      setShowUrgent(hours < 2 || (hours === 0 && minutes < 30))
    }
  }, [timeRemaining])

  if (pricePhase === "linear") {
    return (
      <div className="bg-gradient-to-r from-green-900/50 to-green-800/30 border border-green-500/50 rounded-sm p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Zap className="w-5 h-5 text-green-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs lg:text-sm font-bold text-green-400 uppercase">Early Bird Phase</span>
              <span className="text-xs lg:text-sm bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Best Prices</span>
            </div>
            <p className="text-xs lg:text-sm text-foreground/80">
              Vote now at <span className="font-mono font-bold text-green-400">{currentPrice} ETH</span> before prices
              increase!
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-xs lg:text-sm text-muted-foreground">Ends in</div>
            <div className="text-sm font-bold font-mono text-green-400">{timeRemaining}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${showUrgent ? "bg-gradient-to-r from-red-900/50 to-orange-900/30 border-red-500/50" : "bg-gradient-to-r from-orange-900/50 to-yellow-900/30 border-orange-500/50"} border rounded-sm p-3 mb-4`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {showUrgent ? (
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          ) : (
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs lg:text-sm font-bold uppercase ${showUrgent ? "text-red-400" : "text-orange-400"}`}>
              {showUrgent ? "Last Chance!" : "Exponential Pricing Active"}
            </span>
            {recentVotes > 5 && (
              <span className="text-xs lg:text-sm bg-accent/20 text-accent px-2 py-0.5 rounded-full animate-pulse">
                {recentVotes} votes in last 5min
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-foreground/80">
            {showUrgent
              ? "Voting closes soon! Don't miss your chance to win!"
              : "Prices increase exponentially. Vote now or pay more later!"}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs lg:text-sm text-muted-foreground">Current Price</div>
          <div className={`text-sm font-bold font-mono ${showUrgent ? "text-red-400" : "text-orange-400"}`}>
            {currentPrice} ETH
          </div>
        </div>
      </div>
    </div>
  )
}
