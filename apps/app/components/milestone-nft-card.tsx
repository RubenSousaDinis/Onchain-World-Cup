"use client"

interface MilestoneNFTCardProps {
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt: string
  address: string
}

const rarityColors = {
  common: "#9CA3AF",
  rare: "#60A5FA",
  epic: "#A78BFA",
  legendary: "#FBBF24",
}

const rarityGradients = {
  common: "from-gray-600 to-gray-800",
  rare: "from-blue-600 to-blue-900",
  epic: "from-purple-600 to-purple-900",
  legendary: "from-yellow-600 to-orange-900",
}

export function MilestoneNFTCard({ title, description, icon, rarity, unlockedAt, address }: MilestoneNFTCardProps) {
  return (
    <div
      className={`relative w-full aspect-square bg-gradient-to-br ${rarityGradients[rarity]} rounded-lg overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(0deg,transparent_49%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_51%),linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_51%)] bg-[length:30px_30px]"></div>
      </div>

      {/* Border glow */}
      <div
        className="absolute inset-0 border-4 rounded-lg"
        style={{ borderColor: rarityColors[rarity], boxShadow: `0 0 20px ${rarityColors[rarity]}` }}
      />

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="text-6xl">{icon}</div>
          <div
            className="text-xs font-bold uppercase px-3 py-1 rounded-full"
            style={{ backgroundColor: rarityColors[rarity] }}
          >
            {rarity}
          </div>
        </div>

        {/* Middle */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/80">{description}</p>
        </div>

        {/* Footer */}
        <div className="space-y-2">
          <div className="text-xs text-white/70 text-center">Unlocked {unlockedAt}</div>
          <div className="text-xs font-mono text-white/50 text-center truncate">{address}</div>
          <div className="flex items-center justify-center gap-1.5 pt-1 opacity-60">
            <svg width="14" height="14" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g style={{ transform: "scale(95%)", transformOrigin: "center" }}>
                <path fill="white" d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z" />
                <path fill="white" d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z" />
              </g>
            </svg>
            <span className="text-xs text-white font-bold tracking-widest uppercase">Onchain World Cup</span>
          </div>
        </div>
      </div>
    </div>
  )
}
