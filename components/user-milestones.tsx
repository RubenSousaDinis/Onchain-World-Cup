"use client"

import type React from "react"

import { useState } from "react"
import { Trophy, Flame, Zap, Crown, Target, Award, Rocket, Shield } from "lucide-react"
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
  disabled?: boolean
  disabledReason?: string
}

const milestones: Milestone[] = [
  {
    id: "first-vote-qual",
    title: "First Vote",
    description: "Cast your first qualification vote",
    icon: "⚽",
    iconComponent: <Zap className="w-6 h-6" />,
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: "Jan 5, 2026",
    rarity: "common",
  },
  {
    id: "ten-votes-qual",
    title: "Qualification Supporter",
    description: "Vote for 10 different countries",
    icon: "🔥",
    iconComponent: <Flame className="w-6 h-6" />,
    progress: 10,
    total: 10,
    unlocked: true,
    unlockedAt: "Jan 7, 2026",
    rarity: "common",
  },
  {
    id: "boost-voter",
    title: "Boost Power",
    description: "Use boost voting 5 times",
    icon: "⚡",
    iconComponent: <Zap className="w-6 h-6" />,
    progress: 5,
    total: 5,
    unlocked: true,
    unlockedAt: "Jan 8, 2026",
    rarity: "rare",
  },
  {
    id: "underdog-supporter",
    title: "Underdog Hero",
    description: "Support a country ranked below 50",
    icon: "🦸",
    iconComponent: <Shield className="w-6 h-6" />,
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: "Jan 6, 2026",
    rarity: "rare",
  },
  {
    id: "early-voter",
    title: "Early Believer",
    description: "Vote in the first week of qualification",
    icon: "🐦",
    iconComponent: <Rocket className="w-6 h-6" />,
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: "Jan 2, 2026",
    rarity: "epic",
  },
  {
    id: "heavy-voter",
    title: "Vote Whale",
    description: "Cast 100 total votes in qualification",
    icon: "🐋",
    iconComponent: <Crown className="w-6 h-6" />,
    progress: 47,
    total: 100,
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "diversified-qual",
    title: "Global Voter",
    description: "Vote for countries from all 6 confederations",
    icon: "🌍",
    iconComponent: <Target className="w-6 h-6" />,
    progress: 4,
    total: 6,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "kingmaker",
    title: "Kingmaker",
    description: "Help push a country from rank 49+ into top 48",
    icon: "👑",
    iconComponent: <Crown className="w-6 h-6" />,
    progress: 0,
    total: 1,
    unlocked: false,
    rarity: "legendary",
  },
  {
    id: "first-win",
    title: "Winner!",
    description: "Win your first bet",
    icon: "🏆",
    iconComponent: <Trophy className="w-6 h-6" />,
    progress: 0,
    total: 1,
    unlocked: false,
    rarity: "rare",
    disabled: true,
    disabledReason: "Available in Tournament Phase",
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

              {milestone.disabled && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <span className="text-[10px] text-red-400 font-bold uppercase">{milestone.disabledReason}</span>
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
