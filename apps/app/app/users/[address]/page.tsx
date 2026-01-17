"use client"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft, Trophy, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"
import { use } from "react"

const mockUserData = {
  address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  farcasterUsername: "cryptoking",
  farcasterProfilePic: "/crypto-king-avatar.png",
  hasFarcaster: true,
  totalWinnings: "45.8 ETH",
  totalBets: 23,
  winRate: 78,
  rank: 1,
  activeBets: [
    {
      id: "1",
      team: "Brazil",
      flag: "🇧🇷",
      opponent: "Argentina",
      opponentFlag: "🇦🇷",
      amount: "2.5 ETH",
      matchDate: "June 15, 2026",
      status: "active",
    },
    {
      id: "2",
      team: "Germany",
      flag: "🇩🇪",
      opponent: "France",
      opponentFlag: "🇫🇷",
      amount: "1.8 ETH",
      matchDate: "June 16, 2026",
      status: "active",
    },
  ],
  pastBets: [
    {
      id: "3",
      team: "Brazil",
      flag: "🇧🇷",
      opponent: "Colombia",
      opponentFlag: "🇨🇴",
      amount: "3.2 ETH",
      winnings: "5.8 ETH",
      result: "won",
      matchDate: "June 10, 2026",
    },
    {
      id: "4",
      team: "Argentina",
      flag: "🇦🇷",
      opponent: "Paraguay",
      opponentFlag: "🇵🇾",
      amount: "2.1 ETH",
      winnings: "4.2 ETH",
      result: "won",
      matchDate: "June 11, 2026",
    },
    {
      id: "5",
      team: "France",
      flag: "🇫🇷",
      opponent: "Netherlands",
      opponentFlag: "🇳🇱",
      amount: "1.5 ETH",
      winnings: "0 ETH",
      result: "lost",
      matchDate: "June 9, 2026",
    },
  ],
  favoriteTeams: [
    { name: "Brazil", flag: "🇧🇷", totalBets: "12.5 ETH", betsCount: 8 },
    { name: "Argentina", flag: "🇦🇷", totalBets: "8.3 ETH", betsCount: 5 },
    { name: "Germany", flag: "🇩🇪", totalBets: "6.1 ETH", betsCount: 4 },
  ],
}

export default function UserProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params)

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Back Button */}
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-sm lg:text-base text-accent hover:text-accent/80 mb-4 lg:mb-6"
        >
          <ArrowLeft className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          Back to Leaderboard
        </Link>

        {/* User Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
              {mockUserData.hasFarcaster ? (
                <img
                  src={mockUserData.farcasterProfilePic || "/placeholder.svg"}
                  alt={mockUserData.farcasterUsername}
                  className="w-16 lg:w-24 h-16 lg:h-24 rounded-full border-4 border-primary"
                />
              ) : (
                <div className="w-16 lg:w-24 h-16 lg:h-24 rounded-full bg-primary flex items-center justify-center">
                  <Trophy className="w-8 lg:w-12 h-8 lg:h-12 text-primary-foreground" />
                </div>
              )}
              <div className="text-center lg:text-left flex-1">
                {mockUserData.hasFarcaster ? (
                  <>
                    <div className="text-xs lg:text-sm text-muted-foreground mb-1">Farcaster User</div>
                    <h1 className="text-lg lg:text-2xl font-bold cm-highlight mb-2">
                      @{mockUserData.farcasterUsername}
                    </h1>
                    <div className="text-xs lg:text-sm text-muted-foreground font-mono break-all">{address}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs lg:text-sm text-muted-foreground mb-1">Wallet Address</div>
                    <h1 className="text-lg lg:text-2xl font-bold cm-highlight font-mono mb-2 break-all">{address}</h1>
                  </>
                )}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Rank:</span>
                    <span className="cm-highlight font-bold">#{mockUserData.rank}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="text-accent font-bold">{mockUserData.winRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">Total Winnings</div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold cm-highlight font-mono">{mockUserData.totalWinnings}</div>
          </div>

          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">Total Bets</div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-foreground font-mono">{mockUserData.totalBets}</div>
          </div>

          <div className="cm-panel rounded-sm p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div className="text-xs lg:text-sm text-muted-foreground uppercase">Win Rate</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${mockUserData.winRate}%` }} />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-accent font-mono">{mockUserData.winRate}%</div>
            </div>
          </div>
        </div>

        {/* Favorite Teams */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="cm-section-header px-4 py-2">
            <h3 className="text-sm font-bold">FAVORITE TEAMS</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {mockUserData.favoriteTeams.map((team) => (
                <Link
                  key={team.name}
                  href={`/teams/${team.name.toLowerCase()}`}
                  className="cm-hover-row p-4 rounded-sm flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-3xl">{team.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{team.name}</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">{team.betsCount} bets</div>
                    <div className="text-xs lg:text-sm text-accent font-mono mt-1">{team.totalBets}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Active Bets */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="cm-section-header px-4 py-2">
            <h3 className="text-sm font-bold">ACTIVE BETS</h3>
          </div>
          <div className="p-4">
            {mockUserData.activeBets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active bets</p>
            ) : (
              <div className="space-y-3">
                {mockUserData.activeBets.map((bet) => (
                  <div key={bet.id} className="cm-hover-row p-4 rounded-sm">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{bet.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{bet.team}</div>
                          <div className="text-xs lg:text-sm text-muted-foreground">
                            vs {bet.opponentFlag} {bet.opponent}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold cm-highlight font-mono">{bet.amount}</div>
                        <div className="text-xs lg:text-sm text-accent">{bet.matchDate}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Past Bets */}
        <div className="cm-panel rounded-sm overflow-hidden">
          <div className="cm-section-header px-4 py-2">
            <h3 className="text-sm font-bold">BET HISTORY</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {mockUserData.pastBets.map((bet) => (
                <div key={bet.id} className="cm-hover-row p-4 rounded-sm">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{bet.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{bet.team}</div>
                        <div className="text-xs lg:text-sm text-muted-foreground">
                          vs {bet.opponentFlag} {bet.opponent}
                        </div>
                        <div className="text-xs lg:text-sm text-muted-foreground mt-1">{bet.matchDate}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs lg:text-sm text-muted-foreground mb-1">Bet: {bet.amount}</div>
                      <div
                        className={`text-sm font-bold font-mono ${bet.result === "won" ? "text-green-400" : "text-red-400"}`}
                      >
                        {bet.result === "won" ? `+${bet.winnings}` : "Lost"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
