"use client"

import { X, Award, Download, ExternalLink } from "lucide-react"
import { useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import type React from "react"
import { useNotifications } from "@/components/notifications"
import { parseEther } from "viem"
import { getAchievementNFTAddress, getMatchNFTAddress, NFT_ABI } from "@/lib/contracts/nft"
import type { ComputedAchievement } from "@/lib/achievements"

// Debug logging - only enable in development
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const

interface NFTMintModalProps {
  isOpen: boolean
  onClose: () => void
  type: "milestone" | "match"
  data: {
    title: string
    description: string
    imageUrl?: string
    imageComponent?: React.ReactNode
    metadata: Record<string, unknown>
  }
}

export function NFTMintModal({ isOpen, onClose, type, data }: NFTMintModalProps) {
  // Extract milestone early so it can be used in hooks below
  const milestone = data.metadata.milestone as ComputedAchievement | undefined
  const achievementId = milestone?.id ?? ""

  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const { success, error, info } = useNotifications()

  // Resolve contract address without throwing (may not be configured yet)
  let nftContractAddress: `0x${string}` | undefined
  try {
    nftContractAddress = type === "milestone" ? getAchievementNFTAddress() : getMatchNFTAddress()
  } catch { /* not configured */ }

  // Check on-chain how many times this user has minted this achievement
  const { data: mintedCount, refetch: refetchMinted } = useReadContract({
    address: nftContractAddress,
    abi: NFT_ABI,
    functionName: "mintCount",
    args: [address ?? ZERO_ADDRESS, achievementId],
    query: { enabled: !!address && !!achievementId && !!nftContractAddress },
  })

  const ownedCount = mintedCount !== undefined ? Number(mintedCount) : 0

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isSuccess) {
      success("NFT Minted!", "Your NFT has been minted successfully on Base")
      refetchMinted()
    }
  }, [isSuccess, success, refetchMinted])

  if (!isOpen) return null

  const buildMetadataUrl = () => {
    if (!milestone) return ""
    return (
      `${window.location.origin}/api/nft/metadata?` +
      new URLSearchParams({
        title: milestone.title,
        description: milestone.description,
        icon: milestone.icon,
        rarity: milestone.rarity,
        achievementId: milestone.id,
        points: String(milestone.points),
        address: address ?? "",
      }).toString()
    )
  }

  const handleMint = async () => {
    if (!address) {
      error("Not Logged In", "Please login to mint an NFT.")
      return
    }

    const metadataUrl = buildMetadataUrl()
    if (!metadataUrl) {
      error("Missing Data", "Achievement data is required to mint.")
      return
    }

    if (DEBUG) {
      console.log("Minting NFT with metadataUrl:", metadataUrl)
    }

    try {
      const nftAddress = type === "milestone" ? getAchievementNFTAddress() : getMatchNFTAddress()
      info("Confirm Transaction", "Please confirm the transaction in your wallet...")
      writeContract({
        address: nftAddress,
        abi: NFT_ABI,
        functionName: "mint",
        args: [address, metadataUrl, achievementId, JSON.stringify(milestone ?? data.metadata)],
        value: parseEther("0.001"),
      })
    } catch (err) {
      console.error("Error minting NFT:", err)
      error("Minting Failed", err instanceof Error ? err.message : "Unable to mint NFT. Please try again.")
    }
  }

  const handleDownload = async () => {
    if (!milestone) {
      info("Download Unavailable", "No achievement data available to download.")
      return
    }

    const imageUrl =
      `${window.location.origin}/api/og/achievement-card?` +
      new URLSearchParams({
        title: milestone.title,
        description: milestone.description,
        icon: milestone.icon,
        rarity: milestone.rarity,
        address: address ?? "",
      }).toString()

    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${milestone.id}-achievement.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch (err) {
      console.error("Error downloading NFT image:", err)
      error("Download Failed", "Unable to download the achievement image.")
    }
  }

  const handleViewCollection = () => {
    try {
      const collectionAddr =
        type === "milestone"
          ? process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS
          : process.env.NEXT_PUBLIC_MATCH_NFT_ADDRESS
      if (collectionAddr) {
        window.open(`https://opensea.io/assets/base/${collectionAddr}`, "_blank")
      } else {
        window.open("https://opensea.io", "_blank")
      }
    } catch {
      window.open("https://opensea.io", "_blank")
    }
  }

  const isMinting = isPending || isConfirming

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="cm-panel rounded-sm max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="soccer-field-bg p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold cm-highlight uppercase">
              Mint {type === "milestone" ? "Achievement" : "Match"} NFT
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview Image */}
          <div className="mb-6 rounded-sm overflow-hidden border-2 border-accent">
            {data.imageComponent ? (
              data.imageComponent
            ) : (
              <img src={data.imageUrl || "/placeholder.svg"} alt={data.title} className="w-full h-auto" />
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-lg font-bold text-foreground mb-1">{data.title}</h4>
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </div>

            <div className="bg-secondary/30 rounded-sm p-4 space-y-2 text-xs lg:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">NFT Type:</span>
                <span className="text-foreground font-bold capitalize">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="text-accent font-bold">Base</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mint Cost:</span>
                <span className="cm-highlight font-bold">0.001 ETH</span>
              </div>
              {ownedCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You own:</span>
                  <span className="text-accent font-bold">{ownedCount} {ownedCount === 1 ? "copy" : "copies"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleMint}
              disabled={isMinting || !address}
              className="w-full cm-nav-tab py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinting ? "Minting..." : "Mint NFT"}
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-sm font-bold uppercase text-xs lg:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleViewCollection}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-sm font-bold uppercase text-xs lg:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Collection
              </button>
            </div>
          </div>

          <p className="text-xs lg:text-sm text-muted-foreground text-center mt-4">
            Your NFT will be minted on Base network and visible in your wallet
          </p>
        </div>
      </div>
    </div>
  )
}
