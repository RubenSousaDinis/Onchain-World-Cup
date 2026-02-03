"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { RetroNavTabs } from "@/components/retro-nav-tabs"
import { Clock, TrendingUp, Trophy, Share2 } from "lucide-react"
import Link from "next/link"
import { useState, use } from "react"
import { NFTMintModal } from "@/components/nft-mint-modal"
import { ShareModal } from "@/components/share-modal"

interface MatchDetailPageProps {
  params: Promise<{
    matchId: string
  }>
}

const tabs = [
  { label: "Live Bets", value: "bets" },
  { label: "Statistics", value: "stats" },
  { label: "Prize Pool", value: "pool" },
]

// Mock data - replace with real contract data
const mockMatchData = {
  id: "1",
  team1: { name: "Brazil", flag: "🇧🇷", votes: 87, eth: 12.5 },
  team2: { name: "Argentina", flag: "🇦🇷", votes: 142, eth: 18.2 },
  stadium: "MetLife Stadium, NY",
  matchDate: "June 15, 2026 - 8:00 PM",
  timeRemaining: "1h 23m",
  pricePhase: "linear" as const,
  currentPrice: "0.0045",
  contractAddress: "0x1234567890123456789012345678901234567890",
}

const mockBets = [
  { user: "0x1234...5678", team: "Argentina", votes: 5, amount: 0.8, timestamp: "2 min ago" },
  { user: "0xabcd...ef01", team: "Brazil", votes: 3, amount: 0.5, timestamp: "5 min ago" },
  { user: "0x9876...5432", team: "Argentina", votes: 10, amount: 1.2, timestamp: "8 min ago" },
  { user: "0x4567...8901", team: "Brazil", votes: 7, amount: 0.9, timestamp: "12 min ago" },
  { user: "0xdef0...1234", team: "Argentina", votes: 12, amount: 1.5, timestamp: "15 min ago" },
  { user: "0x2468...1357", team: "Brazil", votes: 8, amount: 1.0, timestamp: "18 min ago" },
  { user: "0x1357...2468", team: "Argentina", votes: 15, amount: 2.1, timestamp: "22 min ago" },
  { user: "0x8642...9753", team: "Brazil", votes: 4, amount: 0.6, timestamp: "25 min ago" },
]

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  // Unwrap params immediately to prevent React DevTools serialization issues
  const unwrappedParams = use(params)
  const { matchId } = unwrappedParams

  const [activeTab, setActiveTab] = useState("bets")
  const [nftMintModalOpen, setNftMintModalOpen] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const totalPool = mockMatchData.team1.eth + mockMatchData.team2.eth
  const totalVotes = mockMatchData.team1.votes + mockMatchData.team2.votes
  const team1VotePercentage = (mockMatchData.team1.votes / totalVotes) * 100
  const team2VotePercentage = (mockMatchData.team2.votes / totalVotes) * 100

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">
              Matches
            </Link>
            <span>/</span>
            <span className="text-foreground">Match #{matchId}</span>
          </div>

          {/* Match Overview Card */}
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="soccer-field-bg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-sm">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-xs text-foreground font-mono">{mockMatchData.timeRemaining}</span>
                </div>
                <div className="flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-sm">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-xs cm-highlight uppercase font-bold">
                    {mockMatchData.pricePhase === "linear" ? "Phase 1" : "Phase 2"}
                  </span>
                </div>
              </div>

              {/* Teams Score Display */}
              <div className="flex items-center justify-center gap-4 lg:gap-8 mb-4">
                <Link
                  href={`/teams/${mockMatchData.team1.name.toLowerCase()}`}
                  className="flex-1 text-center hover:opacity-80 transition-opacity"
                >
                  <div className="text-5xl lg:text-7xl mb-2">{mockMatchData.team1.flag}</div>
                  <div className="text-lg lg:text-2xl font-bold text-foreground mb-1">{mockMatchData.team1.name}</div>
                  <div className="text-4xl lg:text-6xl font-bold cm-highlight">{mockMatchData.team1.votes}</div>
                  <div className="text-xs text-muted-foreground mt-1">votes</div>
                </Link>

                <div className="text-2xl lg:text-4xl text-muted-foreground font-bold">-</div>

                <Link
                  href={`/teams/${mockMatchData.team2.name.toLowerCase()}`}
                  className="flex-1 text-center hover:opacity-80 transition-opacity"
                >
                  <div className="text-5xl lg:text-7xl mb-2">{mockMatchData.team2.flag}</div>
                  <div className="text-lg lg:text-2xl font-bold text-foreground mb-1">{mockMatchData.team2.name}</div>
                  <div className="text-4xl lg:text-6xl font-bold cm-highlight">{mockMatchData.team2.votes}</div>
                  <div className="text-xs text-muted-foreground mt-1">votes</div>
                </Link>
              </div>

              {/* Vote Progress Bar */}
              <div className="bg-card/90 rounded-sm p-4 mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-foreground font-bold">{team1VotePercentage.toFixed(1)}%</span>
                  <span className="text-muted-foreground">Vote Distribution</span>
                  <span className="text-foreground font-bold">{team2VotePercentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                  <div
                    className="bg-primary transition-all duration-500"
                    style={{ width: `${team1VotePercentage}%` }}
                  />
                  <div className="bg-accent transition-all duration-500" style={{ width: `${team2VotePercentage}%` }} />
                </div>
              </div>

              {/* Match Info */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-card/90 px-3 py-2 rounded-sm">
                  <div className="text-xs text-muted-foreground mb-1">Total Votes</div>
                  <div className="text-lg font-bold cm-highlight">{totalVotes}</div>
                </div>
                <div className="bg-card/90 px-3 py-2 rounded-sm">
                  <div className="text-xs text-muted-foreground mb-1">Prize Pool</div>
                  <div className="text-lg font-bold cm-highlight">{totalPool.toFixed(2)} ETH</div>
                </div>
                <div className="bg-card/90 px-3 py-2 rounded-sm col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">Stadium</div>
                  <div className="text-sm font-bold text-foreground truncate">{mockMatchData.stadium}</div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-muted-foreground">Current Vote Price:</span>
                  <span className="ml-2 cm-highlight font-mono font-bold">{mockMatchData.currentPrice} ETH</span>
                </div>
                <button
                  onClick={() => setNftMintModalOpen(true)}
                  className="text-xs cm-highlight hover:text-accent transition-colors font-bold uppercase flex items-center gap-1"
                >
                  <Trophy className="w-3 h-3" />
                  Mint NFT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <RetroNavTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content based on active tab */}
        {activeTab === "bets" && (
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="bg-secondary/40 px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold cm-highlight uppercase">Recent Bets</h3>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/20 text-xs">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted-foreground font-bold uppercase">User</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-bold uppercase">Team</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-bold uppercase">Votes</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-bold uppercase">Amount</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-bold uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBets.map((bet, index) => (
                    <tr
                      key={index}
                      className="border-t border-border hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/users/${bet.user}`} className="text-accent hover:text-primary font-mono">
                          {bet.user}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${bet.team === mockMatchData.team1.name ? "text-primary" : "text-accent"}`}
                        >
                          {bet.team}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold cm-highlight">{bet.votes}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{bet.amount.toFixed(4)} ETH</td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">{bet.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border">
              {mockBets.map((bet, index) => (
                <div key={index} className="p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/users/${bet.user}`} className="text-accent hover:text-primary font-mono text-xs">
                      {bet.user}
                    </Link>
                    <span className="text-xs text-muted-foreground">{bet.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`font-bold text-sm ${bet.team === mockMatchData.team1.name ? "text-primary" : "text-accent"}`}
                      >
                        {bet.team}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">• {bet.votes} votes</span>
                    </div>
                    <div className="text-sm font-mono text-foreground">{bet.amount.toFixed(4)} ETH</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="grid gap-4 lg:gap-6">
            <div className="cm-panel rounded-sm p-4 lg:p-6">
              <h3 className="text-sm font-bold cm-highlight uppercase mb-4">Match Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Average Bet Size</div>
                  <div className="text-2xl font-bold cm-highlight">0.95 ETH</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Total Voters</div>
                  <div className="text-2xl font-bold cm-highlight">{totalVotes}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Largest Bet</div>
                  <div className="text-2xl font-bold cm-highlight">2.1 ETH</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Phase Multiplier</div>
                  <div className="text-2xl font-bold text-accent">1.2x</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pool" && (
          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold cm-highlight uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Prize Pool Distribution
              </h3>
              <button
                onClick={() => setShowShareModal(true)}
                className="cm-nav-tab flex items-center gap-2 px-3 py-2 rounded-sm font-bold text-xs hover:scale-105 transition-transform"
                aria-label="Share prize pool"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            <div className="bg-card rounded-sm p-4 mb-6 border-2 border-primary">
              <div className="text-sm text-muted-foreground mb-1">Total Prize Pool</div>
              <div className="text-3xl lg:text-4xl font-bold cm-highlight font-mono">{totalPool.toFixed(2)} ETH</div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Winner Takes:</span>
                  <div className="text-accent font-bold text-lg mt-1">{(totalPool * 0.9).toFixed(2)} ETH</div>
                  <div className="text-muted-foreground text-xs">90% of pool</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Platform Fee:</span>
                  <div className="text-foreground font-bold text-lg mt-1">{(totalPool * 0.1).toFixed(2)} ETH</div>
                  <div className="text-muted-foreground text-xs">10% of pool</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-secondary/20 rounded-sm p-4 border-l-4 border-primary">
                <div className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                  <span>
                    {mockMatchData.team1.name} {mockMatchData.team1.flag}
                  </span>
                  <span className="text-xs text-muted-foreground">{mockMatchData.team1.votes} votes</span>
                </div>
                <div className="text-3xl font-bold cm-highlight font-mono mb-2">{mockMatchData.team1.eth} ETH</div>
                <div className="text-xs text-muted-foreground">{team1VotePercentage.toFixed(1)}% of total pool</div>
              </div>

              <div className="bg-secondary/20 rounded-sm p-4 border-r-4 border-accent">
                <div className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                  <span>
                    {mockMatchData.team2.name} {mockMatchData.team2.flag}
                  </span>
                  <span className="text-xs text-muted-foreground">{mockMatchData.team2.votes} votes</span>
                </div>
                <div className="text-3xl font-bold cm-highlight font-mono mb-2">{mockMatchData.team2.eth} ETH</div>
                <div className="text-xs text-muted-foreground">{team2VotePercentage.toFixed(1)}% of total pool</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <NFTMintModal
        isOpen={nftMintModalOpen}
        onClose={() => setNftMintModalOpen(false)}
        type="match"
        data={{
          title: `${mockMatchData.team1.name} vs ${mockMatchData.team2.name}`,
          description: `${mockMatchData.team1.votes} - ${mockMatchData.team2.votes} • ${mockMatchData.matchDate}`,
          imageComponent: (
            <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-6 flex flex-col justify-between soccer-field-bg">
              <div className="text-center">
                <div className="text-xs text-white/70 mb-4">CRYPTO WORLD CUP 2026</div>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{mockMatchData.team1.flag}</div>
                    <div className="text-lg font-bold text-white">{mockMatchData.team1.name}</div>
                  </div>
                  <div className="text-4xl font-bold text-white">{mockMatchData.team1.votes}</div>
                  <div className="text-2xl text-white/50">-</div>
                  <div className="text-4xl font-bold text-white">{mockMatchData.team2.votes}</div>
                  <div className="text-center">
                    <div className="text-5xl mb-2">{mockMatchData.team2.flag}</div>
                    <div className="text-lg font-bold text-white">{mockMatchData.team2.name}</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/80 mb-2">{mockMatchData.stadium}</div>
                <div className="text-xs text-white/60">{mockMatchData.matchDate}</div>
                <div className="mt-4 bg-white/10 rounded px-4 py-2">
                  <div className="text-xs text-white/70">Total Prize Pool</div>
                  <div className="text-2xl font-bold text-white">{totalPool.toFixed(2)} ETH</div>
                </div>
              </div>
            </div>
          ),
          metadata: {
            matchId,
            teams: [mockMatchData.team1.name, mockMatchData.team2.name],
            score: [mockMatchData.team1.votes, mockMatchData.team2.votes],
          },
        }}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="prize-pool"
        data={{
          prizePool: {
            totalPool: totalPool.toFixed(2),
            team1Name: mockMatchData.team1.name,
            team1Flag: mockMatchData.team1.flag,
            team1Pool: mockMatchData.team1.eth.toFixed(2),
            team1Votes: mockMatchData.team1.votes,
            team2Name: mockMatchData.team2.name,
            team2Flag: mockMatchData.team2.flag,
            team2Pool: mockMatchData.team2.eth.toFixed(2),
            team2Votes: mockMatchData.team2.votes,
            matchId,
          },
        }}
      />
    </div>
  )
}
