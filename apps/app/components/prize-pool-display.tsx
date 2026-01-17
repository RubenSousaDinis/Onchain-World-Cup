"use client"

import { Trophy, Users, Award } from "lucide-react"

interface PrizePoolDisplayProps {
  totalPool: number
  team1Name: string
  team2Name: string
  team1Pool: number
  team2Pool: number
  team1Voters: number
  team2Voters: number
}

export function PrizePoolDisplay({
  totalPool,
  team1Name,
  team2Name,
  team1Pool,
  team2Pool,
  team1Voters,
  team2Voters,
}: PrizePoolDisplayProps) {
  const team1Percentage = (team1Pool / totalPool) * 100
  const team2Percentage = (team2Pool / totalPool) * 100
  const winnerPool = totalPool * 0.9
  const platformFee = totalPool * 0.1

  return (
    <div className="cm-panel rounded-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Prize Pool Distribution</h3>
      </div>

      {/* Total Pool */}
      <div className="bg-card rounded-sm p-4 mb-6 border-2 border-primary">
        <div className="text-sm text-muted-foreground mb-1">Total Prize Pool</div>
        <div className="text-3xl font-bold cm-highlight font-mono">{totalPool.toFixed(2)} ETH</div>
        <div className="mt-2 flex items-center gap-4 text-xs lg:text-sm">
          <div>
            <span className="text-muted-foreground">Winner Takes:</span>
            <span className="ml-2 text-accent font-bold">{winnerPool.toFixed(2)} ETH (90%)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Platform Fee:</span>
            <span className="ml-2 text-foreground">{platformFee.toFixed(2)} ETH (10%)</span>
          </div>
        </div>
      </div>

      {/* Team Pools */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team 1 */}
        <div className="bg-secondary/20 rounded-sm p-4 border-l-4 border-primary">
          <div className="text-sm font-bold text-foreground mb-3">{team1Name}</div>
          <div className="space-y-2">
            <div>
              <div className="text-xs lg:text-sm text-muted-foreground mb-1">Pool Amount</div>
              <div className="text-2xl font-bold cm-highlight font-mono">{team1Pool.toFixed(2)} ETH</div>
            </div>
            <div className="flex items-center gap-2 text-xs lg:text-sm">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span className="text-foreground">{team1Voters} voters</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs lg:text-sm mb-1">
                <span className="text-muted-foreground">Share</span>
                <span className="cm-highlight font-bold">{team1Percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${team1Percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div className="bg-secondary/20 rounded-sm p-4 border-r-4 border-accent">
          <div className="text-sm font-bold text-foreground mb-3">{team2Name}</div>
          <div className="space-y-2">
            <div>
              <div className="text-xs lg:text-sm text-muted-foreground mb-1">Pool Amount</div>
              <div className="text-2xl font-bold cm-highlight font-mono">{team2Pool.toFixed(2)} ETH</div>
            </div>
            <div className="flex items-center gap-2 text-xs lg:text-sm">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span className="text-foreground">{team2Voters} voters</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs lg:text-sm mb-1">
                <span className="text-muted-foreground">Share</span>
                <span className="cm-highlight font-bold">{team2Percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${team2Percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Info */}
      <div className="mt-6 bg-card/50 rounded-sm p-4 flex items-start gap-3">
        <Award className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <div className="text-xs lg:text-sm text-muted-foreground">
          <strong className="text-foreground">Winner Distribution:</strong> The team with the most votes wins. All
          voters who picked the winning team share 90% of the total prize pool proportionally based on their vote
          amount.
          <div className="mt-2 font-mono text-xs lg:text-sm bg-secondary/30 rounded px-2 py-1.5">
            Your Share = (Your Votes / Total Winning Votes) × 90% Pool
          </div>
        </div>
      </div>
    </div>
  )
}
