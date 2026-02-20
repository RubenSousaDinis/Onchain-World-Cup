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
            <img src="/logo.jpg" alt="Onchain World Cup" className="h-6 w-auto" />
            <div className="text-sm font-bold text-accent tracking-wider">ONCHAIN WORLD CUP 2026</div>
          </div>
        </div>
      </div>
    </div>
  )
}
