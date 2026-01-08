"use client"

import { Clock, TrendingUp } from "lucide-react"
import { useState } from "react"
import { VoteModal } from "./vote-modal"
import Link from "next/link"

interface MatchCardProps {
  id: string
  team1: string
  team2: string
  team1Flag: string
  team2Flag: string
  team1Votes: string
  team2Votes: string
  currentPrice: string
  pricePhase: "linear" | "exponential"
  timeRemaining: string
  stadium: string
  matchDate: string
  contractAddress: `0x${string}`
}

export function MatchCard({
  id,
  team1,
  team2,
  team1Flag,
  team2Flag,
  team1Votes,
  team2Votes,
  currentPrice,
  pricePhase,
  timeRemaining,
  stadium,
  matchDate,
  contractAddress,
}: MatchCardProps) {
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<{ name: string; flag: string; index: number } | null>(null)

  const handleVoteClick = (teamName: string, teamFlag: string, teamIndex: number) => {
    setSelectedTeam({ name: teamName, flag: teamFlag, index: teamIndex })
    setVoteModalOpen(true)
  }

  const team1VoteCount = Number.parseInt(team1Votes)
  const team2VoteCount = Number.parseInt(team2Votes)

  return (
    <>
      <div className="cm-panel rounded-sm overflow-hidden max-w-full hover:ring-2 hover:ring-accent transition-all">
        <Link href={`/matches/${id}`} className="block cursor-pointer">
          {/* Match Header */}
          <div className="soccer-field-bg p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <div className="flex items-center gap-2 bg-card/90 px-2 lg:px-3 py-1.5 rounded-sm">
                <Clock className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-accent" />
                <span className="text-[10px] lg:text-xs text-foreground font-mono">{timeRemaining}</span>
              </div>
              <div className="flex items-center gap-2 bg-card/90 px-2 lg:px-3 py-1.5 rounded-sm">
                <TrendingUp className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-accent" />
                <span className="text-[10px] lg:text-xs cm-highlight uppercase font-bold">
                  {pricePhase === "linear" ? "Phase 1" : "Phase 2"}
                </span>
              </div>
            </div>

            {/* Teams */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 lg:gap-8">
              {/* Team 1 */}
              <div className="flex-1 flex items-center gap-2 lg:gap-3 bg-card/95 p-3 lg:p-4 rounded-sm border-l-4 border-primary min-w-0">
                <div className="text-xl lg:text-4xl flex-shrink-0">{team1Flag}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm lg:text-lg font-bold text-foreground truncate hover:text-accent transition-colors">
                    {team1}
                  </div>
                  <div className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">HOME</div>
                </div>
                <div className="text-xl lg:text-4xl font-bold cm-highlight flex-shrink-0">{team1VoteCount}</div>
              </div>

              {/* VS */}
              <div className="text-muted-foreground font-bold text-xs text-center flex-shrink-0">VS</div>

              {/* Team 2 */}
              <div className="flex-1 flex items-center gap-2 lg:gap-3 bg-card/95 p-3 lg:p-4 rounded-sm border-r-4 border-accent min-w-0">
                <div className="text-xl lg:text-4xl font-bold cm-highlight flex-shrink-0">{team2VoteCount}</div>
                <div className="flex-1 lg:text-right min-w-0">
                  <div className="text-sm lg:text-lg font-bold text-foreground truncate hover:text-accent transition-colors">
                    {team2}
                  </div>
                  <div className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">AWAY</div>
                </div>
                <div className="text-xl lg:text-4xl flex-shrink-0">{team2Flag}</div>
              </div>
            </div>
          </div>

          {/* Match Info Footer */}
          <div className="bg-secondary/30 px-3 lg:px-4 py-2 lg:py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-0 border-t border-border">
            <div className="flex flex-col gap-1 w-full lg:w-auto text-[10px] lg:text-xs">
              <div className="truncate">
                <span className="text-muted-foreground">Stadium:</span>
                <span className="ml-2 cm-highlight">{stadium}</span>
              </div>
              <div className="truncate">
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 text-foreground">{matchDate}</span>
              </div>
            </div>
            <div className="flex gap-3 text-[10px] lg:text-xs">
              <div>
                <span className="text-muted-foreground">Pool:</span>
                <span className="ml-1 text-accent font-mono font-bold">
                  {team1Votes} / {team2Votes} ETH
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-1 cm-highlight font-mono font-bold">{currentPrice} ETH</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Vote Buttons */}
        <div className="p-3 lg:p-4 flex gap-2 lg:gap-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              handleVoteClick(team1, team1Flag, 0)
            }}
            className="flex-1 cm-nav-tab py-2 lg:py-3 rounded-sm font-bold uppercase text-xs lg:text-sm hover:scale-[1.02] transition-transform min-w-0 truncate"
          >
            Vote {team1}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleVoteClick(team2, team2Flag, 1)
            }}
            className="flex-1 cm-nav-tab py-2 lg:py-3 rounded-sm font-bold uppercase text-xs lg:text-sm hover:scale-[1.02] transition-transform min-w-0 truncate"
          >
            Vote {team2}
          </button>
        </div>
      </div>

      {selectedTeam && (
        <VoteModal
          isOpen={voteModalOpen}
          onClose={() => setVoteModalOpen(false)}
          team={selectedTeam.name}
          teamFlag={selectedTeam.flag}
          currentPrice={Number.parseFloat(currentPrice)}
          pricePhase={pricePhase}
          matchId={id}
          contractAddress={contractAddress}
          teamIndex={selectedTeam.index}
        />
      )}
    </>
  )
}
