"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { RetroNavTabs } from "@/components/retro-nav-tabs"
import { Trophy, Medal, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"

const mockLeaderboard = [
  {
    rank: 1,
    address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    farcasterName: "cryptoking.eth",
    farcasterAvatar: "/crypto-king-avatar.png",
    totalWinnings: "45.8",
    totalVotes: 1250,
    totalBets: 23,
    winRate: 78,
  },
  {
    rank: 2,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    farcasterName: "worldcupfan",
    farcasterAvatar: "/world-cup-fan-avatar.jpg",
    totalWinnings: "38.2",
    totalVotes: 1120,
    totalBets: 19,
    winRate: 74,
  },
  {
    rank: 3,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    farcasterName: "betmaster",
    farcasterAvatar: "/bet-master-avatar.jpg",
    totalWinnings: "32.5",
    totalVotes: 1050,
    totalBets: 17,
    winRate: 71,
  },
  {
    rank: 4,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    farcasterName: "soccerpro",
    farcasterAvatar: "/soccer-pro-avatar.jpg",
    totalWinnings: "28.9",
    totalVotes: 980,
    totalBets: 15,
    winRate: 67,
  },
  {
    rank: 5,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    farcasterName: null,
    farcasterAvatar: null,
    totalWinnings: "24.3",
    totalVotes: 890,
    totalBets: 14,
    winRate: 64,
  },
  {
    rank: 6,
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    farcasterName: "degenbet",
    farcasterAvatar: "/degen-bet-avatar.jpg",
    totalWinnings: "21.7",
    totalVotes: 850,
    totalBets: 12,
    winRate: 58,
  },
  {
    rank: 7,
    address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    farcasterName: null,
    farcasterAvatar: null,
    totalWinnings: "19.2",
    totalVotes: 790,
    totalBets: 11,
    winRate: 55,
  },
  {
    rank: 8,
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    farcasterName: "cryptofan",
    farcasterAvatar: "/crypto-fan-avatar.jpg",
    totalWinnings: "16.8",
    totalVotes: 720,
    totalBets: 10,
    winRate: 50,
  },
  {
    rank: 9,
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    farcasterName: null,
    farcasterAvatar: null,
    totalWinnings: "14.5",
    totalVotes: 650,
    totalBets: 9,
    winRate: 44,
  },
  {
    rank: 10,
    address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
    farcasterName: "soccerbet",
    farcasterAvatar: "/soccer-bet-avatar.jpg",
    totalWinnings: "12.1",
    totalVotes: 580,
    totalBets: 8,
    winRate: 38,
  },
]

export default function LeaderboardPage() {
  const [searchQuery, _setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("qualification")

  const [displayedCount, setDisplayedCount] = useState(10)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const filteredLeaderboard = mockLeaderboard.filter(
    (entry) =>
      entry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.farcasterName && entry.farcasterName.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const { sentinelRef, shouldLoadMore } = useInfiniteScroll({
    hasMore: displayedCount < filteredLeaderboard.length,
    isLoading: isLoadingMore,
  })

  useEffect(() => {
    if (shouldLoadMore) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedCount((prev) => Math.min(prev + 10, filteredLeaderboard.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadMore, filteredLeaderboard.length])

  // Reset displayed count when search changes
  useEffect(() => {
    setDisplayedCount(10)
  }, [searchQuery])

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">Leaderboard</span>
            </h1>
            <p className="text-xs lg:text-sm text-foreground/80">Top voters ranked by total winnings • Base Network</p>
          </div>
        </div>

        <div className="mb-6 lg:mb-8">
          <RetroNavTabs
            tabs={[
              { label: "Qualification", href: "#" },
              { label: "Tournament", href: "#", disabled: true, className: "opacity-40 cursor-not-allowed" },
              { label: "Finals", href: "#", disabled: true, className: "opacity-40 cursor-not-allowed" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {/* 1st Place */}
          <div className="cm-panel rounded-sm p-4 lg:p-6 flex flex-col items-center border-2 border-primary/50 lg:order-2 bg-secondary/20">
            {mockLeaderboard[0].farcasterAvatar ? (
              <img
                src={mockLeaderboard[0].farcasterAvatar || "/placeholder.svg"}
                alt={mockLeaderboard[0].farcasterName || "User"}
                className="w-16 lg:w-20 h-16 lg:h-20 rounded-full mb-3 border-4 border-primary shadow-lg object-cover"
              />
            ) : (
              <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full bg-primary flex items-center justify-center mb-3 shadow-lg">
                <Trophy className="w-8 lg:w-10 h-8 lg:h-10 text-primary-foreground" />
              </div>
            )}
            <div className="text-sm cm-highlight mb-1 font-bold uppercase">1st Place</div>
            <div className="text-sm font-bold text-foreground mb-2">
              {mockLeaderboard[0].farcasterName || (
                <span className="font-mono text-xs">
                  {mockLeaderboard[0].address.slice(0, 6)}...{mockLeaderboard[0].address.slice(-4)}
                </span>
              )}
            </div>
            <div className="text-2xl lg:text-3xl font-bold cm-highlight font-mono mb-1">
              {mockLeaderboard[0].totalWinnings} ETH
            </div>
            <div className="text-xs text-accent font-bold mb-1">{mockLeaderboard[0].totalVotes} Total Votes</div>
            <div className="text-[10px] text-muted-foreground">{mockLeaderboard[0].winRate}% Win Rate</div>
          </div>

          {/* 2nd Place */}
          <div className="cm-panel rounded-sm p-4 lg:p-6 flex flex-col items-center lg:justify-end lg:order-1 bg-secondary/10">
            {mockLeaderboard[1].farcasterAvatar ? (
              <img
                src={mockLeaderboard[1].farcasterAvatar || "/placeholder.svg"}
                alt={mockLeaderboard[1].farcasterName || "User"}
                className="w-14 lg:w-16 h-14 lg:h-16 rounded-full mb-3 border-2 border-muted shadow-lg object-cover"
              />
            ) : (
              <div className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Medal className="w-7 lg:w-8 h-7 lg:h-8 text-muted-foreground" />
              </div>
            )}
            <div className="text-sm text-foreground/70 mb-1 uppercase font-bold">2nd Place</div>
            <div className="text-sm font-bold text-foreground mb-2">
              {mockLeaderboard[1].farcasterName || (
                <span className="font-mono text-xs">
                  {mockLeaderboard[1].address.slice(0, 6)}...{mockLeaderboard[1].address.slice(-4)}
                </span>
              )}
            </div>
            <div className="text-xl lg:text-2xl font-bold cm-highlight font-mono mb-1">
              {mockLeaderboard[1].totalWinnings} ETH
            </div>
            <div className="text-xs text-accent font-bold mb-1">{mockLeaderboard[1].totalVotes} Total Votes</div>
            <div className="text-[10px] text-muted-foreground">{mockLeaderboard[1].winRate}% Win Rate</div>
          </div>

          {/* 3rd Place */}
          <div className="cm-panel rounded-sm p-4 lg:p-6 flex flex-col items-center lg:justify-end lg:order-3 bg-secondary/10">
            {mockLeaderboard[2].farcasterAvatar ? (
              <img
                src={mockLeaderboard[2].farcasterAvatar || "/placeholder.svg"}
                alt={mockLeaderboard[2].farcasterName || "User"}
                className="w-14 lg:w-16 h-14 lg:h-16 rounded-full mb-3 border-2 border-muted shadow-lg object-cover"
              />
            ) : (
              <div className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp className="w-7 lg:w-8 h-7 lg:h-8 text-muted-foreground" />
              </div>
            )}
            <div className="text-sm text-foreground/70 mb-1 uppercase font-bold">3rd Place</div>
            <div className="text-sm font-bold text-foreground mb-2">
              {mockLeaderboard[2].farcasterName || (
                <span className="font-mono text-xs">
                  {mockLeaderboard[2].address.slice(0, 6)}...{mockLeaderboard[2].address.slice(-4)}
                </span>
              )}
            </div>
            <div className="text-xl lg:text-2xl font-bold cm-highlight font-mono mb-1">
              {mockLeaderboard[2].totalWinnings} ETH
            </div>
            <div className="text-xs text-accent font-bold mb-1">{mockLeaderboard[2].totalVotes} Total Votes</div>
            <div className="text-[10px] text-muted-foreground">{mockLeaderboard[2].winRate}% Win Rate</div>
          </div>
        </div>

        <div className="cm-panel rounded-sm overflow-hidden max-w-full">
          <div className="bg-secondary/40 px-3 lg:px-4 py-3 border-b-2 border-border">
            <h3 className="text-xs lg:text-sm font-bold cm-highlight uppercase">Complete Rankings</h3>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[600px]">
              <thead className="bg-secondary/30 border-b-2 border-border">
                <tr>
                  <th className="px-3 lg:px-4 py-3 text-left text-[10px] lg:text-xs font-bold cm-highlight uppercase">
                    Rank
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-[10px] lg:text-xs font-bold cm-highlight uppercase">
                    User
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-right text-[10px] lg:text-xs font-bold cm-highlight uppercase whitespace-nowrap">
                    Total Votes
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-right text-[10px] lg:text-xs font-bold cm-highlight uppercase whitespace-nowrap">
                    Winnings
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-right text-[10px] lg:text-xs font-bold cm-highlight uppercase whitespace-nowrap">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.slice(0, displayedCount).map((entry, index) => (
                  <tr
                    key={entry.address}
                    className={`border-b border-border hover:bg-secondary/20 transition-colors ${index % 2 === 0 ? "bg-card/30" : "bg-card/10"}`}
                  >
                    <td className="px-3 lg:px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.rank === 1 && <Trophy className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-primary" />}
                        {entry.rank === 2 && <Medal className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-muted-foreground" />}
                        {entry.rank === 3 && <TrendingUp className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-accent" />}
                        <span className="text-xs lg:text-sm font-mono font-bold cm-highlight">#{entry.rank}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-3">
                      <Link
                        href={`/users/${entry.address}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {entry.farcasterAvatar ? (
                          <img
                            src={entry.farcasterAvatar || "/placeholder.svg"}
                            alt={entry.farcasterName || "User"}
                            className="w-6 lg:w-8 h-6 lg:h-8 rounded-full border border-border object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 lg:w-8 h-6 lg:h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold">?</span>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          {entry.farcasterName ? (
                            <>
                              <span className="text-xs lg:text-sm font-bold truncate">{entry.farcasterName}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs lg:text-sm font-mono font-bold">
                              {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-right">
                      <span className="text-xs lg:text-sm font-mono font-bold cm-highlight whitespace-nowrap">
                        {entry.totalVotes}
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-right">
                      <span className="text-xs lg:text-sm font-mono text-accent font-bold whitespace-nowrap">
                        {entry.totalWinnings} ETH
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 lg:w-16 h-2 bg-card rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-accent transition-all" style={{ width: `${entry.winRate}%` }} />
                        </div>
                        <span className="text-xs lg:text-sm font-mono text-accent font-bold whitespace-nowrap">
                          {entry.winRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedCount < filteredLeaderboard.length && (
              <div ref={sentinelRef} className="p-4 text-center border-t border-border">
                <div className="text-xs text-muted-foreground">Loading more users...</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
