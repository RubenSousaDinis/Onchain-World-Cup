"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { shareMessages } from "@/lib/share-messages"

type ShareMessageKey = keyof typeof shareMessages

interface ShareButtonProps {
  messageKey: ShareMessageKey
  messageData?: any
  variant?: "default" | "compact"
}

export function ShareButton({ messageKey, messageData, variant = "default" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const message = shareMessages[messageKey]
  const shareText =
    typeof message === "function" ? message(messageData).text : message.text

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        })
      } catch (error) {
        // User cancelled or share failed - fallback to clipboard
        if (error instanceof Error && error.name !== "AbortError") {
          await copyToClipboard()
        }
      }
    } else {
      // Fallback: Copy to clipboard
      await copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleShare}
        className="p-2 hover:bg-secondary rounded-sm transition-colors"
        title="Share"
        aria-label="Share"
      >
        <Share2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="cm-nav-tab flex items-center gap-2 px-4 py-2"
    >
      <Share2 className="w-4 h-4" />
      {copied ? "Copied!" : "Share"}
    </button>
  )
}
