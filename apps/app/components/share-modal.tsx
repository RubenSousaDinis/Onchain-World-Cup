"use client"

import { useState, useEffect } from "react"
import { X, Twitter, Share2, Copy, Check, Trophy, Flame, Zap, TrendingUp } from "lucide-react"
import { useNotifications } from "@/components/notifications"
import { MilestoneNFTCard } from "@/components/milestone-nft-card"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  type: "vote" | "result" | "milestone" | "country" | "leaderboard" | "user-stats" | "prize-pool"
  data: {
    team?: string
    teamFlag?: string
    opponent?: string
    opponentFlag?: string
    amount?: string
    votes?: number
    matchId?: string
    result?: "won" | "lost" | "earned"
    winnings?: string
    milestone?: {
      title: string
      description: string
      icon: string
      rarity?: "common" | "rare" | "epic" | "legendary"
      address?: string
    }
    country?: string
    countryCode?: string
    countryFlag?: string
    topCountries?: Array<{
      rank: number
      name: string
      flag: string
      votes: number
    }>
    userStats?: {
      ethSpent: string
      currentEarnings: string
      favoriteCountry: string
      favoriteCountryFlag: string
      totalVotes: number
      rank?: number
      levelNum?: number
      levelName?: string
      achievementPoints?: number
    }
    prizePool?: {
      totalPool: string
      team1Name: string
      team1Flag: string
      team1Pool: string
      team1Votes: number
      team2Name: string
      team2Flag: string
      team2Pool: string
      team2Votes: number
      matchId?: string
    }
  }
}

export function ShareModal({ isOpen, onClose, type, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const { success, error } = useNotifications()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getShareText = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

    if (type === "prize-pool") {
      const pool = data.prizePool
      return {
        title: "Match Prize Pool",
        text: `🏆 ${pool?.team1Flag} ${pool?.team1Name} vs ${pool?.team2Flag} ${pool?.team2Name}\n\n💰 Prize Pool: ${pool?.totalPool} ETH\n\n${pool?.team1Flag} ${pool?.team1Name}: ${pool?.team1Pool} ETH (${pool?.team1Votes} votes)\n${pool?.team2Flag} ${pool?.team2Name}: ${pool?.team2Pool} ETH (${pool?.team2Votes} votes)\n\nWinner takes 90% of the pool! ⚽\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: pool?.matchId ? `${baseUrl}/matches/${pool.matchId}` : baseUrl,
        ogImage: `${baseUrl}/api/og/prize-pool?totalPool=${pool?.totalPool}&team1Name=${encodeURIComponent(pool?.team1Name || "")}&team1Flag=${encodeURIComponent(pool?.team1Flag || "")}&team1Pool=${pool?.team1Pool}&team1Votes=${pool?.team1Votes}&team2Name=${encodeURIComponent(pool?.team2Name || "")}&team2Flag=${encodeURIComponent(pool?.team2Flag || "")}&team2Pool=${pool?.team2Pool}&team2Votes=${pool?.team2Votes}`,
      }
    }

    if (type === "user-stats") {
      const stats = data.userStats
      return {
        title: "My Crypto World Cup Stats",
        text: `My Crypto World Cup 2026 Stats:\n\n💰 Spent: ${stats?.ethSpent} ETH\n🏆 Earnings: ${stats?.currentEarnings} ETH\n⚽ Favorite: ${stats?.favoriteCountryFlag} ${stats?.favoriteCountry}\n📊 Total Votes: ${stats?.totalVotes}${stats?.rank ? `\n🎯 Rank: #${stats.rank}` : ''}\n\nJoin the action and vote for your favorite teams!\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: baseUrl,
        ogImage: `${baseUrl}/api/og/user-stats?ethSpent=${stats?.ethSpent}&earnings=${stats?.currentEarnings}&country=${encodeURIComponent(stats?.favoriteCountry || "")}&countryFlag=${encodeURIComponent(stats?.favoriteCountryFlag || "")}&votes=${stats?.totalVotes}&rank=${stats?.rank || 0}&levelNum=${stats?.levelNum || 1}&levelName=${encodeURIComponent(stats?.levelName || 'Youth Player')}&achievementPoints=${stats?.achievementPoints || 0}`,
      }
    }

    if (type === "leaderboard") {
      const top3 = data.topCountries?.slice(0, 3) || []
      const top3Text = top3.map((c, i) => `${i + 1}. ${c.flag} ${c.name} - ${c.votes.toLocaleString()} votes`).join('\n')

      // Format countries for OG image URL: Name1,Flag1,Votes1,ETH1|Name2,Flag2,Votes2,ETH2|...
      const top5 = data.topCountries?.slice(0, 5) || []
      const countriesParam = top5
        .map((c) => {
          // Calculate ETH from votes (approximate - you might want to pass actual ETH data)
          const eth = (c.votes * 0.001).toFixed(4) // Placeholder calculation
          return `${encodeURIComponent(c.name)},${encodeURIComponent(c.flag)},${c.votes},${eth}`
        })
        .join('|')

      return {
        title: "Qualification Leaderboard",
        text: `🏆 Current Qualification Leaderboard:\n\n${top3Text}\n\nTop 48 countries qualify! Vote for your country now! ⚽\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: `${baseUrl}/qualification`,
        ogImage: `${baseUrl}/api/og/leaderboard?countries=${countriesParam}`,
      }
    }

    if (type === "country") {
      return {
        title: "I just voted for my country!",
        text: `I just backed ${data.countryFlag} ${data.country} with ${data.votes} vote${(data.votes || 0) > 1 ? "s" : ""} to qualify for the World Cup 2026!\n\nVote early = better prices. Help your country qualify! ⚽\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: `${baseUrl}/qualification/${data.countryCode}`,
        ogImage: `${baseUrl}/api/og/country-vote?country=${encodeURIComponent(data.country || "")}&countryCode=${data.countryCode}&votes=${data.votes}&amount=${data.amount}`,
      }
    }

    if (type === "vote") {
      return {
        title: "I just voted!",
        text: `I just placed ${data.votes} vote${(data.votes || 0) > 1 ? "s" : ""} for ${data.teamFlag} ${data.team} in the Crypto World Cup 2026!\n\nVote early for better odds. The more you wait, the more you pay.\n\n#CryptoWorldCup #WorldCup2026 #Base`,
        url: `${baseUrl}/matches/${data.matchId}`,
      }
    }

    if (type === "result") {
      if (data.result === "won" || data.result === "earned") {
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
      success("Copied to Clipboard!", "Share text has been copied. Paste it anywhere you like!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      error("Copy Failed", "Unable to copy to clipboard. Please try again.")
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
            {type === "leaderboard" && <Trophy className="w-6 h-6 text-accent" />}
            {type === "country" && <Zap className="w-6 h-6 text-accent" />}
            {type === "vote" && <Zap className="w-6 h-6 text-accent" />}
            {type === "result" && <Trophy className="w-6 h-6 text-accent" />}
            {type === "milestone" && <Flame className="w-6 h-6 text-accent" />}
            {type === "user-stats" && <TrendingUp className="w-6 h-6 text-accent" />}
            {type === "prize-pool" && <Trophy className="w-6 h-6 text-accent" />}
            <div>
              <div className="text-lg font-bold cm-highlight">
                {type === "leaderboard" && "Share Leaderboard"}
                {type === "country" && "Country Vote Placed!"}
                {type === "vote" && "Vote Placed!"}
                {type === "result" && (data.result === "won" || data.result === "earned" ? "You Won!" : "Match Ended")}
                {type === "milestone" && "Achievement Unlocked!"}
                {type === "user-stats" && "Share Your Stats"}
                {type === "prize-pool" && "Share Prize Pool"}
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
          {type === "leaderboard" && (
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-xl font-bold cm-highlight mb-3">Qualification Leaderboard</div>
              <div className="space-y-2 text-left max-w-sm mx-auto">
                {data.topCountries?.slice(0, 5).map((country) => (
                  <div key={country.rank} className="flex items-center justify-between bg-secondary/20 border border-border rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${country.rank === 1 ? 'text-yellow-400' : country.rank === 2 ? 'text-gray-300' : country.rank === 3 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                        #{country.rank}
                      </span>
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-sm font-bold">{country.name}</span>
                    </div>
                    <span className="text-xs font-mono text-accent">{country.votes.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === "country" && (
            <div className="text-center">
              <div className="text-6xl mb-3">{data.countryFlag}</div>
              <div className="text-2xl font-bold text-foreground mb-2">{data.country}</div>
              <div className="text-sm text-muted-foreground mb-3">Qualification Vote</div>
              <div className="inline-block bg-primary/20 border border-primary px-4 py-2 rounded-sm">
                <span className="text-lg font-bold cm-highlight">{data.votes} Votes</span>
                <span className="text-sm text-muted-foreground ml-2">({data.amount} ETH)</span>
              </div>
            </div>
          )}

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
              {data.result === "won" || data.result === "earned" ? (
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

          {type === "milestone" && data.milestone && (
            <div className="rounded-sm overflow-hidden">
              <MilestoneNFTCard
                title={data.milestone.title}
                description={data.milestone.description}
                icon={data.milestone.icon}
                rarity={data.milestone.rarity ?? "common"}
                unlockedAt="Recently"
                address={data.milestone.address ?? "0x0000...0000"}
              />
            </div>
          )}

          {type === "user-stats" && (
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-xl font-bold cm-highlight mb-2">My Crypto World Cup Stats</div>
              {data.userStats?.levelNum != null && (
                <div className="inline-flex items-center gap-2 bg-secondary/30 border border-border rounded-sm px-3 py-1.5 mb-4 text-sm font-bold">
                  <span className="text-muted-foreground">Lv.{data.userStats.levelNum}</span>
                  <span className="cm-highlight">{data.userStats.levelName}</span>
                  {data.userStats.achievementPoints != null && (
                    <span className="text-muted-foreground">· {data.userStats.achievementPoints} pts</span>
                  )}
                </div>
              )}
              <div className="space-y-3 max-w-sm mx-auto">
                <div className="bg-secondary/20 border border-border rounded px-4 py-3">
                  <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                  <div className="text-lg font-bold text-foreground font-mono">{data.userStats?.ethSpent} ETH</div>
                </div>
                <div className="bg-secondary/20 border border-border rounded px-4 py-3">
                  <div className="text-xs text-muted-foreground mb-1">Current Earnings</div>
                  <div className="text-lg font-bold text-accent font-mono">
                    {typeof data.userStats?.currentEarnings === "string" && data.userStats.currentEarnings.endsWith(" ETH")
                      ? data.userStats.currentEarnings
                      : `${data.userStats?.currentEarnings ?? "0"} ETH`}
                  </div>
                </div>
                <div className="bg-secondary/20 border border-border rounded px-4 py-3">
                  <div className="text-xs text-muted-foreground mb-1">Favorite Country</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{data.userStats?.favoriteCountryFlag}</span>
                    <span className="text-lg font-bold">{data.userStats?.favoriteCountry}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-secondary/20 border border-border rounded px-3 py-2">
                    <div className="text-xs text-muted-foreground mb-1">Votes</div>
                    <div className="text-sm font-bold cm-highlight font-mono">{data.userStats?.totalVotes ?? 0}</div>
                  </div>
                  {data.userStats?.rank != null && data.userStats.rank > 0 && (
                    <div className="flex-1 bg-secondary/20 border border-border rounded px-3 py-2">
                      <div className="text-xs text-muted-foreground mb-1">Rank</div>
                      <div className="text-sm font-bold text-accent font-mono">#{data.userStats.rank}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {type === "prize-pool" && (
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-xl font-bold cm-highlight mb-4">Prize Pool</div>

              {/* Total Pool */}
              <div className="bg-primary/20 border border-primary rounded px-4 py-3 mb-4 max-w-sm mx-auto">
                <div className="text-xs text-muted-foreground mb-1">Total Prize Pool</div>
                <div className="text-2xl font-bold cm-highlight font-mono">{data.prizePool?.totalPool} ETH</div>
                <div className="text-xs text-accent mt-1">Winner takes 90%</div>
              </div>

              {/* Teams */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <div className="bg-secondary/20 border-l-4 border-primary rounded px-3 py-3">
                  <div className="text-2xl mb-2">{data.prizePool?.team1Flag}</div>
                  <div className="text-sm font-bold mb-2">{data.prizePool?.team1Name}</div>
                  <div className="text-lg font-bold cm-highlight font-mono mb-1">{data.prizePool?.team1Pool} ETH</div>
                  <div className="text-xs text-muted-foreground">{data.prizePool?.team1Votes} votes</div>
                </div>
                <div className="bg-secondary/20 border-r-4 border-accent rounded px-3 py-3">
                  <div className="text-2xl mb-2">{data.prizePool?.team2Flag}</div>
                  <div className="text-sm font-bold mb-2">{data.prizePool?.team2Name}</div>
                  <div className="text-lg font-bold cm-highlight font-mono mb-1">{data.prizePool?.team2Pool} ETH</div>
                  <div className="text-xs text-muted-foreground">{data.prizePool?.team2Votes} votes</div>
                </div>
              </div>
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
