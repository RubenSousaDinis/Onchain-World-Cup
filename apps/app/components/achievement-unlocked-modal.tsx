"use client"

import { useState } from "react"
import { X, ChevronRight, Award } from "lucide-react"
import { type ComputedAchievement } from "@/lib/achievements"
import { NFTMintModal } from "@/components/nft-mint-modal"

const RARITY_STYLES: Record<string, { border: string; bg: string; text: string; label: string }> = {
  common:    { border: "border-gray-500",   bg: "bg-gray-500/10",   text: "text-gray-400",   label: "Common" },
  rare:      { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400",   label: "Rare" },
  epic:      { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", label: "Epic" },
  legendary: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Legendary" },
}

const RARITY_GRADIENTS: Record<string, { from: string; to: string; accent: string; glow: string }> = {
  common:    { from: "#1f2937", to: "#374151", accent: "#9ca3af", glow: "rgba(156,163,175,0.3)" },
  rare:      { from: "#1e3a5f", to: "#1e40af", accent: "#60a5fa", glow: "rgba(96,165,250,0.4)" },
  epic:      { from: "#2d1b69", to: "#7c3aed", accent: "#c084fc", glow: "rgba(192,132,252,0.4)" },
  legendary: { from: "#451a03", to: "#92400e", accent: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
}

function AchievementNFTCard({ achievement }: { achievement: ComputedAchievement }) {
  const rarity = RARITY_STYLES[achievement.rarity] ?? RARITY_STYLES.common
  const gradient = RARITY_GRADIENTS[achievement.rarity] ?? RARITY_GRADIENTS.common

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        aspectRatio: "1 / 1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 40%, ${gradient.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: gradient.accent,
            opacity: 0.8,
          }}
        >
          Onchain World Cup 2026
        </span>
      </div>

      {/* Icon */}
      <div
        style={{
          fontSize: "5rem",
          lineHeight: 1,
          marginBottom: "1.25rem",
          filter: `drop-shadow(0 0 16px ${gradient.glow})`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {achievement.icon}
      </div>

      {/* Title */}
      <h3
        style={{
          color: "#ffffff",
          fontSize: "1.1rem",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "0.5rem",
          position: "relative",
          zIndex: 1,
          textShadow: `0 0 20px ${gradient.glow}`,
        }}
      >
        {achievement.title}
      </h3>

      {/* Rarity + points row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: gradient.accent,
            border: `1px solid ${gradient.accent}`,
            padding: "2px 8px",
            borderRadius: "2px",
          }}
        >
          {rarity.label}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: gradient.accent,
          }}
        >
          +{achievement.points} pts
        </span>
      </div>

      {/* Bottom watermark */}
      <div
        style={{
          position: "absolute",
          bottom: "0.75rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.55rem",
            color: gradient.accent,
            opacity: 0.5,
            letterSpacing: "0.1em",
          }}
        >
          ⚽ Achievement NFT
        </span>
      </div>
    </div>
  )
}

interface AchievementUnlockedModalProps {
  achievements: ComputedAchievement[]
  onClose: () => void
}

export function AchievementUnlockedModal({ achievements, onClose }: AchievementUnlockedModalProps) {
  const [index, setIndex] = useState(0)
  const [showMintModal, setShowMintModal] = useState(false)

  if (achievements.length === 0) return null

  const achievement = achievements[index]
  const rarity = RARITY_STYLES[achievement.rarity] ?? RARITY_STYLES.common
  const isLast = index === achievements.length - 1

  const handleNext = () => {
    if (isLast) {
      onClose()
    } else {
      setIndex(index + 1)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
        <div className={`cm-panel w-full max-w-sm rounded-sm border-2 ${rarity.border} overflow-hidden`}>

          {/* Header */}
          <div className={`${rarity.bg} p-4 flex items-center justify-between border-b ${rarity.border}`}>
            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${rarity.text}`} />
              <span className={`text-sm font-bold uppercase tracking-wide ${rarity.text}`}>
                Achievement Unlocked!
              </span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Achievement card */}
          <div className="p-6 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full border-2 ${rarity.border} ${rarity.bg} flex items-center justify-center`}>
              <span className="text-4xl">{achievement.icon}</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">{achievement.title}</h2>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded-sm border ${rarity.border} ${rarity.bg} ${rarity.text}`}>
                {rarity.label}
              </span>
              <span className="text-sm font-bold cm-highlight">+{achievement.points} pts</span>
            </div>

            {achievements.length > 1 && (
              <p className="text-xs text-muted-foreground">
                {index + 1} of {achievements.length} achievements unlocked
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-border flex gap-3">
            <button
              onClick={() => setShowMintModal(true)}
              className={`flex-1 py-2.5 rounded-sm font-bold text-sm border ${rarity.border} ${rarity.bg} ${rarity.text} hover:opacity-80 transition-opacity`}
            >
              Mint NFT
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-sm font-bold text-sm flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
            >
              {isLast ? "Continue" : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      <NFTMintModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        type="milestone"
        data={{
          title: achievement.title,
          description: achievement.description,
          imageComponent: <AchievementNFTCard achievement={achievement} />,
          metadata: {
            milestone: achievement,
            achievementId: achievement.id,
            rarity: achievement.rarity,
            points: achievement.points,
            unlockedAt: new Date().toISOString(),
          },
        }}
      />
    </>
  )
}
