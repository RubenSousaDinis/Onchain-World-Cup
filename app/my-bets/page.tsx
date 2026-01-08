"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, TrendingUp, Clock, Share2, Eye, CheckCircle } from "lucide-react"
import { useAccount } from "wagmi"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { UserMilestones } from "@/components/user-milestones"
import { ShareModal } from "@/components/share-modal"
import { useState } from "react"
import Link from "next/link"

const mockUserBets = [
  {
    matchId: "1",
    team1: "Brazil",
    team2: "Argentina",
    team1Flag: "🇧🇷",
    team2Flag: "🇦🇷",
    votedTeam: "Argentina",
    votedTeamFlag: "🇦🇷",
    votes: 12,
    costPaid: "0.05",
    status: "active" as const,
    winningTeam: null,
    potentialReturn: "0.089",
    matchDate: "June 15, 2026",
  },
  {
    matchId: "2",
    team1: "Germany",
    team2: "France",
    team1Flag: "🇩🇪",
    team2Flag: "🇫🇷",
    votedTeam: "Germany",
    votedTeamFlag: "🇩🇪",
    votes: 25,
    costPaid: "0.1",
    status: "active" as const,
    winningTeam: null,
    potentialReturn: "0.18",
    matchDate: "June 16, 2026",
  },
  {
    matchId: "3",
    team1: "Spain",
    team2: "Italy",
    team1Flag: "🇪🇸",
    team2Flag: "🇮🇹",
    votedTeam: "Spain",
    votedTeamFlag: "🇪🇸",
    votes: 6,
    costPaid: "0.025",
    status: "settled" as const,
    winningTeam: "Spain",
    potentialReturn: "0.047",
    matchDate: "June 10, 2026",
  },
  {
    matchId: "4",
    team1: "England",
    team2: "Portugal",
    team1Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    team2Flag: "🇵🇹",
    votedTeam: "England",
    votedTeamFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    votes: 18,
    costPaid: "0.08",
    status: "settled" as const,
    winningTeam: "England",
    potentialReturn: "0.152",
    matchDate: "June 8, 2026",
  },
  {
    matchId: "5",
    team1: "Netherlands",
    team2: "Belgium",
    team1Flag: "🇳🇱",
    team2Flag: "🇧🇪",
    votedTeam: "Netherlands",
    votedTeamFlag: "🇳🇱",
    votes: 10,
    costPaid: "0.04",
    status: "settled" as const,
    winningTeam: "Netherlands",
    potentialReturn: "0.072",
    matchDate: "June 5, 2026",
  },
  {
    matchId: "6",
    team1: "Croatia",
    team2: "Morocco",
    team1Flag: "🇭🇷",
    team2Flag: "🇲🇦",
    votedTeam: "Croatia",
    votedTeamFlag: "🇭🇷",
    votes: 8,
    costPaid: "0.03",
    status: "settled" as const,
    winningTeam: "Morocco",
    potentialReturn: "0.0",
    matchDate: "June 3, 2026",
  },
  {
    matchId: "7",
    team1: "Japan",
    team2: "South Korea",
    team1Flag: "🇯🇵",
    team2Flag: "🇰🇷",
    votedTeam: "Japan",
    votedTeamFlag: "🇯🇵",
    votes: 5,
    costPaid: "0.02",
    status: "settled" as const,
    winningTeam: "South Korea",
    potentialReturn: "0.0",
    matchDate: "June 1, 2026",
  },
  {
    matchId: "7",
    team1: "Japan",
    team2: "South Korea",
    team1Flag: "🇯🇵",
    team2Flag: "🇰🇷",
    votedTeam: "South Korea",
    votedTeamFlag: "🇰🇷",
    votes: 8,
    costPaid: "0.035",
    status: "settled" as const,
    winningTeam: "South Korea",
    potentialReturn: "0.062",
    matchDate: "June 1, 2026",
  },
]

export default function MyBetsPage() {
  const { address, isConnected } = useAccount()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<(typeof mockUserBets)[0] | null>(null)
  const [showDemoData, setShowDemoData] = useState(true)

  const totalVotes = mockUserBets.reduce((sum, bet) => sum + bet.votes, 0)
  const totalSpent = mockUserBets.reduce((sum, bet) => sum + Number.parseFloat(bet.costPaid), 0)
  const activeBets = mockUserBets.filter((b) => b.status === "active").length
  const settledBets = mockUserBets.filter((b) => b.status === "settled").length

  const earningBets = mockUserBets.filter((b) => b.status === "settled" && b.winningTeam === b.votedTeam)
  const totalEarnings = earningBets.reduce((sum, bet) => sum + Number.parseFloat(bet.potentialReturn), 0)

  const handleShareWin = (bet: (typeof mockUserBets)[0]) => {
    setSelectedBet(bet)
    setShareModalOpen(true)
  }

  const shouldShowContent = isConnected || showDemoData

  const didEarn = (bet: (typeof mockUserBets)[0]) => bet.status === "settled" && bet.winningTeam === bet.votedTeam

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">My Votes</span>
            </h1>
            <p className="text-xs lg:text-sm text-foreground/80">
              Track your votes, monitor active matches, and claim your earnings
            </p>
          </div>
        </div>

        {!isConnected && (
          <div className="cm-panel rounded-sm p-4 mb-6 border-2 border-accent bg-accent/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-bold text-accent">Demo Mode</p>
                  <p className="text-xs text-foreground/70">
                    {showDemoData
                      ? "Viewing sample data. Connect wallet to see your actual votes."
                      : "Connect wallet to view your votes and milestones."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDemoData(!showDemoData)}
                  className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all ${
                    showDemoData ? "bg-accent text-accent-foreground" : "cm-nav-tab"
                  }`}
                >
                  {showDemoData ? "Hide Demo" : "Show Demo"}
                </button>
                <WalletConnectButton />
              </div>
            </div>
          </div>
        )}

        {!shouldShowContent ? (
          <div className="cm-panel rounded-sm p-8 lg:p-12 text-center">
            <Trophy className="w-12 lg:w-16 h-12 lg:h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg lg:text-xl font-bold cm-highlight mb-2">Connect Your Wallet</h2>
            <p className="text-xs lg:text-sm text-foreground/70 mb-6">
              Connect your wallet to view your votes and earnings
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Total Votes</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">{totalVotes}</div>
                <div className="text-[10px] text-muted-foreground">({totalSpent.toFixed(3)} ETH spent)</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-accent">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Active</div>
                <div className="text-lg lg:text-2xl font-bold text-accent font-mono">{activeBets}</div>
                <div className="text-[10px] text-muted-foreground">matches</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-purple-500">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Settled</div>
                <div className="text-lg lg:text-2xl font-bold text-purple-400 font-mono">{settledBets}</div>
                <div className="text-[10px] text-muted-foreground">matches</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-green-500">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Earned</div>
                <div className="text-lg lg:text-2xl font-bold text-green-400 font-mono">{earningBets.length}</div>
                <div className="text-[10px] text-muted-foreground">winning votes</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary col-span-2 lg:col-span-1">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Total Earnings</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">
                  {totalEarnings.toFixed(3)} ETH
                </div>
              </div>
            </div>

            {/* Milestones Section */}
            <div className="mb-6 lg:mb-8">
              <UserMilestones />
            </div>

            {/* Bets List */}
            <div className="cm-panel rounded-sm overflow-hidden mb-4">
              <div className="bg-secondary/40 px-4 py-3 border-b-2 border-border">
                <h2 className="text-sm font-bold cm-highlight uppercase">Your Voting History</h2>
              </div>
            </div>

            <div className="space-y-3 lg:space-y-4">
              {mockUserBets.map((bet, index) => (
                <div key={`${bet.matchId}-${bet.votedTeam}-${index}`} className="cm-panel rounded-sm overflow-hidden">
                  <div className="bg-secondary/40 px-3 lg:px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-0 border-b-2 border-border">
                    <Link
                      href={`/matches/${bet.matchId}`}
                      className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <div className="text-xs lg:text-sm flex items-center flex-wrap gap-1">
                        <span className="text-2xl lg:text-4xl">{bet.team1Flag}</span>
                        <span className="text-foreground font-bold">{bet.team1}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-foreground font-bold">{bet.team2}</span>
                        <span className="text-2xl lg:text-4xl">{bet.team2Flag}</span>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 lg:gap-4">
                      <div className="text-[10px] lg:text-xs text-foreground/70 font-mono">{bet.matchDate}</div>
                      {bet.status === "active" && (
                        <div className="flex items-center gap-1.5 bg-accent/20 px-2 py-1 rounded-sm border border-accent">
                          <Clock className="w-3 h-3 text-accent" />
                          <span className="text-[10px] lg:text-xs text-accent font-bold uppercase">Active</span>
                        </div>
                      )}
                      {bet.status === "settled" && (
                        <div
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border ${
                            didEarn(bet) ? "bg-green-500/20 border-green-500" : "bg-purple-500/20 border-purple-500"
                          }`}
                        >
                          {didEarn(bet) ? (
                            <>
                              <Trophy className="w-3 h-3 text-green-400" />
                              <span className="text-[10px] lg:text-xs text-green-400 font-bold uppercase">Earned</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 text-purple-400" />
                              <span className="text-[10px] lg:text-xs text-purple-400 font-bold uppercase">
                                Settled
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 lg:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-secondary/10">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                      <div className="bg-card/50 p-2 rounded-sm">
                        <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                          You Voted For
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl lg:text-2xl">{bet.votedTeamFlag}</span>
                          <span className="text-base lg:text-lg font-bold text-foreground">{bet.votedTeam}</span>
                        </div>
                      </div>
                      <div className="bg-card/50 p-2 rounded-sm">
                        <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                          Votes Placed
                        </div>
                        <div className="text-base lg:text-lg font-mono font-bold cm-highlight">{bet.votes} votes</div>
                        <div className="text-[10px] text-muted-foreground">(paid {bet.costPaid} ETH)</div>
                      </div>
                      {bet.status === "settled" && bet.winningTeam && (
                        <div className="bg-card/50 p-2 rounded-sm">
                          <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                            Match Winner
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-accent" />
                            <span className="text-xs lg:text-sm font-bold text-foreground">{bet.winningTeam}</span>
                          </div>
                        </div>
                      )}
                      {bet.status === "active" && (
                        <div className="bg-card/50 p-2 rounded-sm">
                          <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                            Status
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-accent animate-pulse" />
                            <span className="text-xs lg:text-sm font-bold text-accent">Match in progress</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-left lg:text-right bg-card/50 p-3 rounded-sm">
                      <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                        {bet.status === "active" ? "Potential Earnings" : didEarn(bet) ? "Earnings" : "Result"}
                      </div>
                      <div
                        className={`text-xl lg:text-2xl font-mono font-bold ${
                          bet.status === "active"
                            ? "cm-highlight"
                            : didEarn(bet)
                              ? "text-green-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {bet.status === "active"
                          ? `~${bet.potentialReturn} ETH`
                          : didEarn(bet)
                            ? `+${bet.potentialReturn} ETH`
                            : "No earnings"}
                      </div>
                      {didEarn(bet) && (
                        <div className="flex gap-2 mt-2">
                          <button
                            className="flex-1 bg-primary text-primary-foreground px-3 lg:px-4 py-1.5 lg:py-2 rounded-sm text-xs lg:text-sm font-bold uppercase hover:scale-105 transition-transform border border-primary"
                            disabled={!isConnected}
                          >
                            {isConnected ? "Claim" : "Demo"}
                          </button>
                          <button
                            onClick={() => handleShareWin(bet)}
                            className="cm-nav-tab px-3 py-1.5 lg:py-2 rounded-sm text-xs lg:text-sm font-bold uppercase hover:scale-105 transition-transform flex items-center gap-1"
                          >
                            <Share2 className="w-3 h-3" />
                            Share
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {selectedBet && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          type="result"
          data={{
            team: selectedBet.votedTeam,
            teamFlag: selectedBet.votedTeamFlag,
            matchId: selectedBet.matchId,
            result: "earned",
            winnings: `${selectedBet.potentialReturn} ETH`,
          }}
        />
      )}
    </div>
  )
}
