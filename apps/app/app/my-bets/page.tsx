"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, Clock, Eye } from "lucide-react"
import { useAccount } from "wagmi"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { UserMilestones } from "@/components/user-milestones"
import { ShareModal } from "@/components/share-modal"
import { useState } from "react"
import { NoVotesEmpty, EmptyState } from "@/components/states"

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
  const { address: _address, isConnected } = useAccount()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<(typeof mockUserBets)[0] | null>(null)
  const [showDemoData, setShowDemoData] = useState(true)

  const totalVotes = mockUserBets.reduce((sum, bet) => sum + bet.votes, 0)
  const totalSpent = mockUserBets.reduce((sum, bet) => sum + Number.parseFloat(bet.costPaid), 0)
  const activeBets = mockUserBets.filter((b) => b.status === "active").length
  const _settledBets = mockUserBets.filter((b) => b.status === "settled").length

  const earningBets = mockUserBets.filter((b) => b.status === "settled" && b.winningTeam === b.votedTeam)
  const totalEarnings = earningBets.reduce((sum, bet) => sum + Number.parseFloat(bet.potentialReturn), 0)

  const _handleShareWin = (bet: (typeof mockUserBets)[0]) => {
    setSelectedBet(bet)
    setShareModalOpen(true)
  }

  const shouldShowContent = isConnected || showDemoData

  const _didEarn = (bet: (typeof mockUserBets)[0]) => bet.status === "settled" && bet.winningTeam === bet.votedTeam

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8">
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
          <NoVotesEmpty />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Total Votes</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">{totalVotes}</div>
                <div className="text-xs text-muted-foreground">votes placed</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-purple-500">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">ETH Spent</div>
                <div className="text-lg lg:text-2xl font-bold text-purple-400 font-mono">{totalSpent.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">ETH total</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-accent">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Active</div>
                <div className="text-lg lg:text-2xl font-bold text-accent font-mono">{activeBets}</div>
                <div className="text-xs text-muted-foreground">matches</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-green-500">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Earned</div>
                <div className="text-lg lg:text-2xl font-bold text-green-400 font-mono">{earningBets.length}</div>
                <div className="text-xs text-muted-foreground">winning votes</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary col-span-2 lg:col-span-1">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Total Earnings</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">
                  {totalEarnings.toFixed(3)} ETH
                </div>
                <div className="text-xs text-muted-foreground">ETH earned</div>
              </div>
            </div>

            {/* Milestones Section */}
            <div className="mb-6 lg:mb-8">
              <UserMilestones />
            </div>

            {/* Bets List */}
            <EmptyState
              icon={<Clock className="w-16 h-16" />}
              title="Match Voting History Coming Soon"
              description="Match voting history will be available during the Tournament Phase. Currently in Qualification Phase - only country voting is active."
              action={{
                label: "Go to Qualification",
                href: "/qualification"
              }}
            />
          </>
        )}
      </main>

      {/* Share Modal */}
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
