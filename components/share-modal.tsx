"use client"

import { useState } from "react"
import { X, Twitter, Share2, Copy, Check, Trophy, Flame, Zap } from "lucide-react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  type: "vote" | "result" | "milestone"
  data: {
    team?: string
    teamFlag?: string
    opponent?: string
    opponentFlag?: string
    amount?: string
    votes?: number
    matchId?: string
    result?: "won" | "lost"
    winnings?: string
    milestone?: {
      title: string
      description: string
      icon: string
    }
  }
}

export function ShareModal({ isOpen, onClose, type, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const getShareText = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

    if (type === "vote") {
      return {
        title: "I just voted!",
        text: `I just placed ${data.votes} vote${(data.votes || 0) > 1 ? "s" : ""} for ${data.teamFlag} ${data.team} in the Crypto World Cup 2026!\n\nVote early for better odds. The more you wait, the more you pay.\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: `${baseUrl}/matches/${data.matchId}`,
      }
    }

    if (type === "result") {
      if (data.result === "won") {
        return {
          title: "I won!",
          text: `I just won ${data.winnings} betting on ${data.teamFlag} ${data.team} in the Crypto World Cup 2026!\n\nJoin the action and vote for your favorite teams.\n\n#CryptoWorldCup #WorldCup2026 #Base`,
          url: `${baseUrl}/matches/${data.matchId}`,
        }
      }
      return {
        title: "Better luck next time!",
        text: `My team ${data.teamFlag} ${data.team} lost in the Crypto World Cup 2026, but the game goes on!\n\nJoin and vote for the next match.\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: `${baseUrl}/matches/${data.matchId}`,
      }
    }

    if (type === "milestone") {
      return {
        title: data.milestone?.title || "Achievement Unlocked!",
        text: `${data.milestone?.icon} I just unlocked "${data.milestone?.title}" in Crypto World Cup 2026!\n\n${data.milestone?.description}\n\nJoin the competition!\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: baseUrl,
      }
    }

    return { title: "", text: "", url: baseUrl }
  }

  const shareData = getShareText()

  const shareToTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`
    window.open(tweetUrl, "_blank")
  }

  const shareToFarcaster = () => {
    const castUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareData.text + "\n\n" + shareData.url)}`
    window.open(castUrl, "_blank")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        })
      } catch (err) {
        console.error("Share failed:", err)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="cm-panel w-full max-w-md rounded-sm border-2 border-primary">
        {/* Header */}
        <div className="soccer-field-bg p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            {type === "vote" && <Zap className="w-6 h-6 text-accent" />}
            {type === "result" && <Trophy className="w-6 h-6 text-accent" />}
            {type === "milestone" && <Flame className="w-6 h-6 text-accent" />}
            <div>
              <div className="text-lg font-bold cm-highlight">
                {type === "vote" && "Vote Placed!"}
                {type === "result" && (data.result === "won" ? "You Won!" : "Match Ended")}
                {type === "milestone" && "Achievement Unlocked!"}
              </div>
              <div className="text-xs text-foreground/80">Share with your friends</div>
            </div>
          </div>
          <button onClick={onClose} className="text-foreground hover:text-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-4 bg-card/50">
          {type === "vote" && (
            <div className="text-center">
              <div className="text-4xl mb-2">{data.teamFlag}</div>
              <div className="text-xl font-bold text-foreground mb-1">{data.team}</div>
              <div className="text-sm text-muted-foreground mb-2">
                vs {data.opponentFlag} {data.opponent}
              </div>
              <div className="inline-block bg-primary/20 border border-primary px-3 py-1 rounded-sm">
                <span className="text-sm font-bold cm-highlight">{data.votes} Votes</span>
                <span className="text-xs text-muted-foreground ml-2">({data.amount} ETH)</span>
              </div>
            </div>
          )}

          {type === "result" && (
            <div className="text-center">
              <div className="text-4xl mb-2">{data.teamFlag}</div>
              <div className="text-xl font-bold text-foreground mb-2">{data.team}</div>
              {data.result === "won" ? (
                <div className="inline-block bg-green-500/20 border border-green-500 px-4 py-2 rounded-sm">
                  <div className="text-xs text-green-400 mb-1">WINNINGS</div>
                  <div className="text-2xl font-bold text-green-400 font-mono">{data.winnings}</div>
                </div>
              ) : (
                <div className="inline-block bg-red-500/20 border border-red-500 px-4 py-2 rounded-sm">
                  <div className="text-sm font-bold text-red-400">Better luck next time!</div>
                </div>
              )}
            </div>
          )}

          {type === "milestone" && (
            <div className="text-center">
              <div className="text-5xl mb-3">{data.milestone?.icon}</div>
              <div className="text-xl font-bold cm-highlight mb-2">{data.milestone?.title}</div>
              <div className="text-sm text-foreground/80">{data.milestone?.description}</div>
            </div>
          )}
        </div>

        {/* Share Buttons */}
        <div className="p-4 space-y-3">
          <button
            onClick={shareToTwitter}
            className="w-full flex items-center justify-center gap-3 bg-[#1DA1F2] text-white py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform"
          >
            <Twitter className="w-5 h-5" />
            Share on X / Twitter
          </button>

          <button
            onClick={shareToFarcaster}
            className="w-full flex items-center justify-center gap-3 bg-[#8A63D2] text-white py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Share on Farcaster
          </button>

          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={nativeShare}
              className="w-full flex items-center justify-center gap-3 cm-nav-tab py-3 rounded-sm font-bold uppercase text-sm hover:scale-[1.02] transition-transform"
            >
              <Share2 className="w-5 h-5" />
              More Options
            </button>
          )}

          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-3 cm-panel py-3 rounded-sm font-bold uppercase text-sm hover:bg-secondary/50 transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  )
}
