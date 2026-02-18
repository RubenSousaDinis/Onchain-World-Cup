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
          <div className="flex justify-center pt-1">
            <img src="/logo.svg" alt="Onchain World Cup" className="h-8 w-auto opacity-80" />
          </div>
        </div>
      </div>
    </div>
  )
}
