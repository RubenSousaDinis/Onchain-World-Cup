"use client"

import { X, Award, Download, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import type React from "react"
import { useNotifications } from "@/components/notifications"

// Debug logging - only enable in development
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true"

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
  const [isMinting, setIsMinting] = useState(false)
  const { writeContract: _writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const { success, error, info } = useNotifications()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Show notification when NFT minting succeeds
  useEffect(() => {
    if (isSuccess) {
      success("NFT Minted!", "Your NFT has been minted successfully on Base")
    }
  }, [isSuccess, success])

  if (!isOpen) return null

  const handleMint = async () => {
    setIsMinting(true)
    info("Preparing NFT", "Uploading metadata to IPFS...")

    // TODO: Replace with actual NFT contract address
    const _nftContractAddress = "0x0000000000000000000000000000000000000000"

    try {
      // In a real implementation, you would:
      // 1. Upload metadata to IPFS
      // 2. Call the mint function on the NFT contract
      if (DEBUG) {
        console.log("Minting NFT with data:", data)
      }

      info("Minting NFT", "Waiting for transaction confirmation...")

      // Simulate minting for demo
      setTimeout(() => {
        setIsMinting(false)
        success("NFT Minted!", "Your achievement NFT has been minted successfully")
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error minting NFT:", err)
      setIsMinting(false)
      error("Minting Failed", err instanceof Error ? err.message : "Unable to mint NFT. Please try again.")
    }
  }

  const handleDownload = () => {
    // In production, this would download the actual generated image
    if (DEBUG) {
      console.log("Downloading NFT image")
    }
    info("Download Coming Soon", "This feature will be available after NFT contracts are deployed")
  }

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

            <div className="bg-secondary/30 rounded-sm p-4 space-y-2 text-xs">
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
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleMint}
              disabled={isMinting || isConfirming}
              className="w-full cm-nav-tab py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinting || isConfirming ? "Minting..." : "Mint NFT"}
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-sm font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => window.open("https://opensea.io", "_blank")}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-sm font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Collection
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Your NFT will be minted on Base network and visible in your wallet
          </p>
        </div>
      </div>
    </div>
  )
}
