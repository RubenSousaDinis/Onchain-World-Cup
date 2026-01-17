"use client"

import { Clock, TrendingUp, Share2, Flame, Calendar, Trophy, Coins } from "lucide-react"
import { useState } from "react"
import { VoteModal } from "./vote-modal"
import { ShareModal } from "./share-modal"
import { FomoBanner } from "./fomo-banner"
import { MatchCountdown } from "./match-countdown"
import { NFTMintModal } from "./nft-mint-modal"
import { MatchResultNFTCard } from "./match-result-nft-card"
import Link from "next/link"

type MatchStatus = "upcoming" | "voting" | "completed"

interface UnifiedMatchCardProps {
  id: string
  team1: string
  team2: string
  team1Flag: string
  team2Flag: string
  team1Votes: string
  team2Votes: string
  currentPrice: string
  pricePhase?: "linear" | "exponential"
  timeRemaining?: string
  timeUntilStart?: string // For upcoming matches
  stadium: string
  matchDate: string
  contractAddress: `0x${string}`
  status: MatchStatus
  winner?: string
  finalScore?: { team1: number; team2: number }
}

export function UnifiedMatchCard({
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
  timeUntilStart,
  stadium,
  matchDate,
  contractAddress,
  status,
  winner,
  finalScore: _finalScore,
}: UnifiedMatchCardProps) {
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [nftModalOpen, setNftModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<{ name: string; flag: string; index: number } | null>(null)

  const handleVoteClick = (teamName: string, teamFlag: string, teamIndex: number) => {
    setSelectedTeam({ name: teamName, flag: teamFlag, index: teamIndex })
    setVoteModalOpen(true)
  }

  const team1VoteCount = Number.parseInt(team1Votes)
  const team2VoteCount = Number.parseInt(team2Votes)
  const totalVotes = team1VoteCount + team2VoteCount

  const isHot = totalVotes > 100

  const votingEndTime = Date.now() + 24 * 60 * 60 * 1000 // Mock: 24 hours from now

  return (
    <>
      <div className="cm-panel rounded-sm overflow-hidden max-w-full hover:ring-2 hover:ring-accent transition-all">
        {/* Status Banner */}
        {status === "upcoming" && (
          <div className="bg-secondary/40 px-3 py-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-xs lg:text-sm font-bold cm-highlight uppercase">Upcoming Match</span>
            </div>
            <div className="text-xs lg:text-sm text-orange-400 font-mono font-bold">Voting opens in {timeUntilStart}</div>
          </div>
        )}

        {status === "voting" && (
          <div className="px-3 pt-3 space-y-2">
            <MatchCountdown endTime={votingEndTime} phase={pricePhase!} />
            <FomoBanner
              pricePhase={pricePhase!}
              timeRemaining={timeRemaining!}
              currentPrice={currentPrice}
              recentVotes={isHot ? 12 : 3}
            />
          </div>
        )}

        {status === "completed" && (
          <div className="bg-green-900/30 px-3 py-2 border-b border-green-500/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-xs lg:text-sm font-bold text-green-400 uppercase">Match Completed</span>
            </div>
            {winner && <div className="text-xs lg:text-sm text-green-400 font-bold">{winner} Won</div>}
          </div>
        )}

        <Link href={`/matches/${contractAddress}`} className="block cursor-pointer">
          {/* Match Header */}
          <div className="soccer-field-bg p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <div className="flex items-center gap-2 bg-card/90 px-2 lg:px-3 py-1.5 rounded-sm">
                <Clock className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-accent" />
                <span className="text-xs lg:text-xs text-foreground font-mono">
                  {status === "upcoming" ? timeUntilStart : status === "voting" ? timeRemaining : "Final"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {status === "voting" && isHot && (
                  <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1.5 rounded-sm border border-orange-500/50">
                    <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                    <span className="text-xs lg:text-sm text-orange-400 font-bold">HOT</span>
                  </div>
                )}
                {status === "voting" && pricePhase && (
                  <div className="flex items-center gap-2 bg-card/90 px-2 lg:px-3 py-1.5 rounded-sm">
                    <TrendingUp className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-accent" />
                    <span className="text-xs lg:text-xs cm-highlight uppercase font-bold">
                      {pricePhase === "linear" ? "Phase 1" : "Phase 2"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Teams */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 lg:gap-8">
              {/* Team 1 */}
              <div
                className={`flex-1 flex items-center gap-2 lg:gap-3 bg-card/95 p-3 lg:p-4 rounded-sm border-l-4 ${
                  status === "completed" && winner === team1 ? "border-green-500" : "border-primary"
                } min-w-0`}
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
              <div className="text-muted-foreground font-bold text-xs lg:text-sm text-center flex-shrink-0">
                {status === "completed" ? "FT" : "VS"}
              </div>

              {/* Team 2 */}
              <div
                className={`flex-1 flex items-center gap-2 lg:gap-3 bg-card/95 p-3 lg:p-4 rounded-sm border-r-4 ${
                  status === "completed" && winner === team2 ? "border-green-500" : "border-accent"
                } min-w-0`}
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
              {status !== "upcoming" && (
                <>
                  <div>
                    <span className="text-muted-foreground">Pool:</span>
                    <span className="ml-1 text-accent font-mono font-bold">
                      {team1Votes} / {team2Votes} ETH
                    </span>
                  </div>
                  {status === "voting" && (
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <span className="ml-1 cm-highlight font-mono font-bold">{currentPrice} ETH</span>
                    </div>
                  )}
                </>
              )}
              {status === "upcoming" && (
                <div>
                  <span className="text-muted-foreground">Opens:</span>
                  <span className="ml-1 cm-highlight font-mono font-bold">{timeUntilStart}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="p-3 lg:p-4 flex gap-2 lg:gap-3">
          {status === "upcoming" && (
            <div className="flex-1 bg-secondary/30 py-2 lg:py-3 rounded-sm font-bold uppercase text-sm lg:text-base text-center text-muted-foreground">
              Voting Not Open
            </div>
          )}

          {status === "voting" && (
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
          )}

          {status === "completed" && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setShareModalOpen(true)
                }}
                className="flex-1 cm-nav-tab py-2 lg:py-3 rounded-sm font-bold uppercase text-sm lg:text-base hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setNftModalOpen(true)
                }}
                className="flex-1 bg-accent text-accent-foreground py-2 lg:py-3 rounded-sm font-bold uppercase text-sm lg:text-base hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                Mint NFT
              </button>
            </>
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
          pricePhase={pricePhase!}
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

      <NFTMintModal
        isOpen={nftModalOpen}
        onClose={() => setNftModalOpen(false)}
        type="match"
        data={{
          title: `${team1} vs ${team2}`,
          description: `Match Result: ${winner} won with ${winner === team1 ? team1VoteCount : team2VoteCount} votes`,
          imageComponent: (
            <MatchResultNFTCard
              team1={team1}
              team2={team2}
              team1Flag={team1Flag}
              team2Flag={team2Flag}
              team1Votes={team1VoteCount}
              team2Votes={team2VoteCount}
              winner={winner || team1}
              matchDate={matchDate}
              stadium={stadium}
              userWon={false}
              userWinnings="0"
            />
          ),
          metadata: {
            matchId: id,
            team1,
            team2,
            winner,
            votes: { team1: team1VoteCount, team2: team2VoteCount },
          },
        }}
      />
    </>
  )
}
