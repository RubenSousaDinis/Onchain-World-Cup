"use client"

import { useState } from "react"
import { Award, Shield } from "lucide-react"
import { ShareModal } from "./share-modal"
import { NFTMintModal } from "./nft-mint-modal"
import { MilestoneNFTCard } from "./milestone-nft-card"
import { InlineLoader } from "./states"
import { LevelBadge } from "./level-badge"
import { useAchievements } from "@/hooks/use-achievements"
import type { ComputedAchievement } from "@/lib/achievements"

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

interface UserMilestonesProps {
  address?: string
}

export function UserMilestones({ address }: UserMilestonesProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [nftMintModalOpen, setNftMintModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<ComputedAchievement | null>(null)

  const { achievements, totalPoints, level, unlockedCount, totalCount, isLoading } = useAchievements(address)

  const handleShare = (milestone: ComputedAchievement) => {
    setSelectedMilestone(milestone)
    setShareModalOpen(true)
  }

  const handleMintNFT = (milestone: ComputedAchievement) => {
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
              <p className="text-xs lg:text-sm text-foreground/70 mt-1">Complete milestones to earn bragging rights</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <div className="text-2xl font-bold cm-highlight">
                {unlockedCount}/{totalCount}
              </div>
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">Unlocked</div>
              {address && !isLoading && <LevelBadge level={level} points={totalPoints} showPoints />}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-card/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: totalCount > 0 ? `${(unlockedCount / totalCount) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <InlineLoader text="Loading achievements..." />
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {achievements.map((milestone) => (
              <div
                key={milestone.id}
                className={`relative rounded-sm border-2 p-4 transition-all ${
                  milestone.unlocked
                    ? rarityColors[milestone.rarity]
                    : "border-border bg-card/30 opacity-70"
                }`}
              >
                {/* Rarity badge */}
                <div
                  className={`absolute top-2 right-2 text-xs font-bold uppercase ${rarityTextColors[milestone.rarity]}`}
                >
                  {milestone.rarity}
                </div>

                <div className="flex items-start gap-3">
                  <div className={`text-3xl ${milestone.unlocked ? "" : "grayscale opacity-50"}`}>{milestone.icon}</div>
                  <div className="flex-1 min-w-0 pr-12">
                    <div className="font-bold text-sm mb-1">{milestone.title}</div>
                    <div className="text-xs lg:text-sm text-muted-foreground mb-2">{milestone.description}</div>

                    {milestone.unlocked ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">Unlocked · {milestone.points}pts</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-mono">
                            {milestone.progress}/{milestone.progressTotal}
                          </span>
                        </div>
                        <div className="h-1.5 bg-card rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${(milestone.progress / milestone.progressTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {milestone.unlocked && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleMintNFT(milestone)}
                      className="flex-1 cm-nav-tab py-1.5 rounded-sm font-bold uppercase text-xs transition-colors"
                    >
                      Mint NFT
                    </button>
                    <button
                      onClick={() => handleShare(milestone)}
                      className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-1.5 rounded-sm font-bold uppercase text-xs transition-colors"
                    >
                      Share
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
                rarity: selectedMilestone.rarity,
                address: address,
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
                  unlockedAt="Recently"
                  address={address || "0x0000...0000"}
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
