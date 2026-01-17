"use client"

import { Clock, TrendingUp, Share2, Flame } from "lucide-react"
import { useState } from "react"
import { VoteModal } from "./vote-modal"
import { ShareModal } from "./share-modal"
import { FomoBanner } from "./fomo-banner"
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
  status?: "live" | "upcoming" | "finished"
  winner?: string
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
  status = "live",
  winner,
}: MatchCardProps) {
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<{ name: string; flag: string; index: number } | null>(null)

  const handleVoteClick = (teamName: string, teamFlag: string, teamIndex: number) => {
    setSelectedTeam({ name: teamName, flag: teamFlag, index: teamIndex })
    setVoteModalOpen(true)
  }

  const team1VoteCount = Number.parseInt(team1Votes)
  const team2VoteCount = Number.parseInt(team2Votes)
  const totalVotes = team1VoteCount + team2VoteCount

  const isHot = totalVotes > 100

  return (
    <>
      <div className="cm-panel rounded-sm overflow-hidden max-w-full hover:ring-2 hover:ring-accent transition-all">
        {status === "live" && (
          <div className="px-3 pt-3">
            <FomoBanner
              pricePhase={pricePhase}
              timeRemaining={timeRemaining}
              currentPrice={currentPrice}
              recentVotes={isHot ? 12 : 3}
            />
          </div>
        )}

        <Link href={`/matches/${id}`} className="block cursor-pointer">
          {/* Match Header */}
          <div className="soccer-field-bg p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <div className="flex items-center gap-2 bg-card/90 px-2 lg:px-3 py-1.5 rounded-sm">
                <Clock className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-accent" />
                <span className="text-xs lg:text-xs text-foreground font-mono">{timeRemaining}</span>
              </div>
              <div className="flex items-center gap-2">
                {isHot && (
                  <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1.5 rounded-sm border border-orange-500/50">
                    <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                    <span className="text-xs lg:text-sm text-orange-400 font-bold">HOT</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-card/90 px-2 lg:px-3 py-1.5 rounded-sm">
                  <TrendingUp className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-accent" />
                  <span className="text-xs lg:text-xs cm-highlight uppercase font-bold">
                    {pricePhase === "linear" ? "Phase 1" : "Phase 2"}
                  </span>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 lg:gap-8">
              {/* Team 1 */}
              <div
                className={`flex-1 flex items-center gap-2 lg:gap-3 bg-card/95 p-3 lg:p-4 rounded-sm border-l-4 ${winner === team1 ? "border-green-500" : "border-primary"} min-w-0`}
              >
                <div className="text-xl lg:text-4xl flex-shrink-0">{team1Flag}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm lg:text-lg font-bold text-foreground truncate hover:text-accent transition-colors">
                    {team1}
                  </div>
                  <div className="text-xs lg:text-xs text-muted-foreground mt-0.5">HOME</div>
                </div>
                <div className="text-xl lg:text-4xl font-bold cm-highlight flex-shrink-0">{team1VoteCount}</div>
              </div>

              {/* VS */}
              <div className="text-muted-foreground font-bold text-xs lg:text-sm text-center flex-shrink-0">VS</div>

              {/* Team 2 */}
              <div
                className={`flex-1 flex items-center gap-2 lg:gap-3 bg-card/95 p-3 lg:p-4 rounded-sm border-r-4 ${winner === team2 ? "border-green-500" : "border-accent"} min-w-0`}
              >
                <div className="text-xl lg:text-4xl font-bold cm-highlight flex-shrink-0">{team2VoteCount}</div>
                <div className="flex-1 lg:text-right min-w-0">
                  <div className="text-sm lg:text-lg font-bold text-foreground truncate hover:text-accent transition-colors">
                    {team2}
                  </div>
                  <div className="text-xs lg:text-xs text-muted-foreground mt-0.5">AWAY</div>
                </div>
                <div className="text-xl lg:text-4xl flex-shrink-0">{team2Flag}</div>
              </div>
            </div>
          </div>

          {/* Match Info Footer */}
          <div className="bg-secondary/30 px-3 lg:px-4 py-2 lg:py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-0 border-t border-border">
            <div className="flex flex-col gap-1 w-full lg:w-auto text-xs lg:text-xs">
              <div className="truncate">
                <span className="text-muted-foreground">Stadium:</span>
                <span className="ml-2 cm-highlight">{stadium}</span>
              </div>
              <div className="truncate">
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 text-foreground">{matchDate}</span>
              </div>
            </div>
            <div className="flex gap-3 text-xs lg:text-xs">
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

        {/* Vote/Share Buttons */}
        <div className="p-3 lg:p-4 flex gap-2 lg:gap-3">
          {status === "live" ? (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleVoteClick(team1, team1Flag, 0)
                }}
                className="flex-1 cm-nav-tab py-2 lg:py-3 rounded-sm font-bold uppercase text-sm lg:text-base hover:scale-[1.02] transition-transform min-w-0 truncate"
              >
                Vote {team1}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleVoteClick(team2, team2Flag, 1)
                }}
                className="flex-1 cm-nav-tab py-2 lg:py-3 rounded-sm font-bold uppercase text-sm lg:text-base hover:scale-[1.02] transition-transform min-w-0 truncate"
              >
                Vote {team2}
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault()
                setShareModalOpen(true)
              }}
              className="flex-1 cm-nav-tab py-2 lg:py-3 rounded-sm font-bold uppercase text-sm lg:text-base hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Result
            </button>
          )}
        </div>
      </div>

      {selectedTeam && (
        <VoteModal
          isOpen={voteModalOpen}
          onClose={() => setVoteModalOpen(false)}
          team={selectedTeam.name}
          teamFlag={selectedTeam.flag}
          opponent={selectedTeam.index === 0 ? team2 : team1}
          opponentFlag={selectedTeam.index === 0 ? team2Flag : team1Flag}
          currentPrice={Number.parseFloat(currentPrice)}
          pricePhase={pricePhase}
          matchId={id}
          contractAddress={contractAddress}
          teamIndex={selectedTeam.index}
        />
      )}

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        type="result"
        data={{
          team: winner || team1,
          teamFlag: winner === team2 ? team2Flag : team1Flag,
          matchId: id,
          result: "won",
          winnings: "2.5 ETH",
        }}
      />
    </>
  )
}
