"use client"

interface MatchResultNFTCardProps {
  team1: string
  team2: string
  team1Flag: string
  team2Flag: string
  team1Votes: number
  team2Votes: number
  winner: string
  matchDate: string
  stadium: string
}

export function MatchResultNFTCard({
  team1,
  team2,
  team1Flag,
  team2Flag,
  team1Votes,
  team2Votes,
  winner,
  matchDate,
  stadium,
}: MatchResultNFTCardProps) {
  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-lg overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
      </div>

      {/* Border */}
      <div
        className="absolute inset-0 border-4 border-accent rounded-lg"
        style={{ boxShadow: "0 0 30px rgba(255, 215, 0, 0.4)" }}
      />

      {/* Content */}
      <div className="relative h-full p-8 flex flex-col justify-between text-white">
        {/* Header */}
        <div className="text-center">
          <div className="text-sm font-bold uppercase text-accent mb-2 tracking-wider">Match Result NFT</div>
          <div className="text-xs text-white/70">{matchDate}</div>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-center gap-8 my-6">
          <div className="text-center flex-1">
            <div className="text-6xl mb-3">{team1Flag}</div>
            <div className="text-base font-bold mb-2">{team1}</div>
            <div
              className={`text-5xl font-bold font-mono ${winner === team1 ? "text-accent animate-pulse" : "text-white/40"}`}
            >
              {team1Votes}
            </div>
          </div>

          <div className="text-3xl font-bold text-white/30">VS</div>

          <div className="text-center flex-1">
            <div className="text-6xl mb-3">{team2Flag}</div>
            <div className="text-base font-bold mb-2">{team2}</div>
            <div
              className={`text-5xl font-bold font-mono ${winner === team2 ? "text-accent animate-pulse" : "text-white/40"}`}
            >
              {team2Votes}
            </div>
          </div>
        </div>

        {/* Winner Banner */}
        <div className="bg-accent/20 border-2 border-accent rounded-lg p-4 text-center backdrop-blur-sm">
          <div className="text-xs text-accent font-bold uppercase tracking-wider mb-1">Match Winner</div>
          <div className="text-2xl font-bold">{winner}</div>
        </div>

        {/* Stadium Info */}
        <div className="text-center mt-4">
          <div className="text-xs text-white/60 mb-2">{stadium}</div>
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g style={{ transform: "scale(95%)", transformOrigin: "center" }}>
                <path fill="#FBBF24" d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z" />
                <path fill="#FBBF24" d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z" />
              </g>
            </svg>
            <div className="text-sm font-bold text-accent tracking-wider">ONCHAIN WORLD CUP 2026</div>
          </div>
        </div>
      </div>
    </div>
  )
}
