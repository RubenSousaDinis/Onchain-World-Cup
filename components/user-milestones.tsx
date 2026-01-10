"use client"

import type React from "react"

import { useState } from "react"
import { Trophy, Flame, Star, Zap, Crown, Target, Award, Rocket, Shield } from "lucide-react"
import { ShareModal } from "./share-modal"
import { NFTMintModal } from "./nft-mint-modal"
import { MilestoneNFTCard } from "./milestone-nft-card"

interface Milestone {
  id: string
  title: string
  description: string
  icon: string
  iconComponent: React.ReactNode
  progress: number
  total: number
  unlocked: boolean
  unlockedAt?: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

const milestones: Milestone[] = [
  {
    id: "first-vote",
    title: "First Whistle",
    description: "Place your first vote",
    icon: "⚽",
    iconComponent: <Zap className="w-6 h-6" />,
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: "Jan 5, 2026",
    rarity: "common",
  },
  {
    id: "ten-votes",
    title: "Super Fan",
    description: "Place 10 votes across different matches",
    icon: "🔥",
    iconComponent: <Flame className="w-6 h-6" />,
    progress: 10,
    total: 10,
    unlocked: true,
    unlockedAt: "Jan 7, 2026",
    rarity: "common",
  },
  {
    id: "first-win",
    title: "Winner!",
    description: "Win your first bet",
    icon: "🏆",
    iconComponent: <Trophy className="w-6 h-6" />,
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: "Jan 6, 2026",
    rarity: "rare",
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Vote in Phase 1 on 5 different matches",
    icon: "🐦",
    iconComponent: <Rocket className="w-6 h-6" />,
    progress: 5,
    total: 5,
    unlocked: true,
    unlockedAt: "Jan 8, 2026",
    rarity: "rare",
  },
  {
    id: "eth-whale",
    title: "ETH Whale",
    description: "Bet more than 1 ETH in a single match",
    icon: "🐋",
    iconComponent: <Crown className="w-6 h-6" />,
    progress: 0.5,
    total: 1,
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "five-wins",
    title: "Lucky Streak",
    description: "Win 5 bets in a row",
    icon: "⭐",
    iconComponent: <Star className="w-6 h-6" />,
    progress: 3,
    total: 5,
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "diversified",
    title: "Diversified",
    description: "Vote for 10 different teams",
    icon: "🌍",
    iconComponent: <Target className="w-6 h-6" />,
    progress: 6,
    total: 10,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "champion",
    title: "World Champion",
    description: "Correctly predict the World Cup winner",
    icon: "👑",
    iconComponent: <Crown className="w-6 h-6" />,
    progress: 0,
    total: 1,
    unlocked: false,
    rarity: "legendary",
  },
]

const rarityColors = {
  common: "border-gray-500 bg-gray-500/10",
  rare: "border-blue-500 bg-blue-500/10",
  epic: "border-purple-500 bg-purple-500/10",
  legendary: "border-yellow-500 bg-yellow-500/10",
}

const rarityTextColors = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
}

export function UserMilestones() {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [nftMintModalOpen, setNftMintModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

  const unlockedCount = milestones.filter((m) => m.unlocked).length
  const totalCount = milestones.length

  const handleShare = (milestone: Milestone) => {
    setSelectedMilestone(milestone)
    setShareModalOpen(true)
  }

  const handleMintNFT = (milestone: Milestone) => {
    setSelectedMilestone(milestone)
    setNftMintModalOpen(true)
  }

  return (
    <>
      <div className="cm-panel rounded-sm overflow-hidden">
        <div className="soccer-field-bg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold cm-highlight flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
              </h3>
              <p className="text-xs text-foreground/70 mt-1">Complete milestones to earn bragging rights</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold cm-highlight">
                {unlockedCount}/{totalCount}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Unlocked</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-card/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`relative rounded-sm border-2 p-4 transition-all ${
                milestone.unlocked
                  ? `${rarityColors[milestone.rarity]} hover:scale-[1.02] cursor-pointer`
                  : "border-border bg-card/30 opacity-70"
              }`}
              onClick={() => milestone.unlocked && handleShare(milestone)}
            >
              {/* Rarity badge */}
              <div
                className={`absolute top-2 right-2 text-[10px] font-bold uppercase ${rarityTextColors[milestone.rarity]}`}
              >
                {milestone.rarity}
              </div>

              <div className="flex items-start gap-3">
                <div className={`text-3xl ${milestone.unlocked ? "" : "grayscale opacity-50"}`}>{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm mb-1">{milestone.title}</div>
                  <div className="text-xs text-muted-foreground mb-2">{milestone.description}</div>

                  {milestone.unlocked ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-green-400">Unlocked {milestone.unlockedAt}</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-mono">
                          {milestone.progress}/{milestone.total}
                        </span>
                      </div>
                      <div className="h-1.5 bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{ width: `${(milestone.progress / milestone.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {milestone.unlocked && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMintNFT(milestone)
                    }}
                    className="text-[10px] text-accent hover:text-primary transition-colors font-bold uppercase bg-card/80 px-2 py-1 rounded"
                  >
                    Mint NFT
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(milestone)
                    }}
                    className="text-[10px] text-accent hover:text-primary transition-colors"
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedMilestone && (
        <>
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            type="milestone"
            data={{
              milestone: {
                title: selectedMilestone.title,
                description: selectedMilestone.description,
                icon: selectedMilestone.icon,
              },
            }}
          />

          <NFTMintModal
            isOpen={nftMintModalOpen}
            onClose={() => setNftMintModalOpen(false)}
            type="milestone"
            data={{
              title: selectedMilestone.title,
              description: selectedMilestone.description,
              imageComponent: (
                <MilestoneNFTCard
                  title={selectedMilestone.title}
                  description={selectedMilestone.description}
                  icon={selectedMilestone.icon}
                  rarity={selectedMilestone.rarity}
                  unlockedAt={selectedMilestone.unlockedAt || "Recently"}
                  address="0x1234...5678"
                />
              ),
              metadata: {
                milestone: selectedMilestone,
              },
            }}
          />
        </>
      )}
    </>
  )
}
