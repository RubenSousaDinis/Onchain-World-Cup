"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, TrendingUp, Clock } from "lucide-react"
import { useAccount } from "wagmi"
import { WalletConnectButton } from "@/components/wallet-connect-button"

// Mock user bets data
const mockUserBets = [
  {
    matchId: "1",
    team1: "Brazil",
    team2: "Argentina",
    team1Flag: "🇧🇷",
    team2Flag: "🇦🇷",
    votedTeam: "Argentina",
    votedTeamFlag: "🇦🇷",
    amount: "0.05",
    status: "active",
    currentWinning: "Argentina",
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
    amount: "0.1",
    status: "active",
    currentWinning: "France",
    potentialReturn: "0.0",
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
    amount: "0.025",
    status: "won",
    currentWinning: "Spain",
    potentialReturn: "0.047",
    matchDate: "June 10, 2026",
  },
]

export default function MyBetsPage() {
  const { address, isConnected } = useAccount()

  const totalBetAmount = mockUserBets.reduce((sum, bet) => sum + Number.parseFloat(bet.amount), 0)
  const activeBets = mockUserBets.filter((b) => b.status === "active").length
  const wonBets = mockUserBets.filter((b) => b.status === "won").length
  const totalWinnings = mockUserBets
    .filter((b) => b.status === "won")
    .reduce((sum, bet) => sum + Number.parseFloat(bet.potentialReturn), 0)

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">My Bets</span>
            </h1>
            <p className="text-xs lg:text-sm text-foreground/80">
              Track your votes, monitor active bets, and claim your winnings
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="cm-panel rounded-sm p-8 lg:p-12 text-center">
            <Trophy className="w-12 lg:w-16 h-12 lg:h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg lg:text-xl font-bold cm-highlight mb-2">Connect Your Wallet</h2>
            <p className="text-xs lg:text-sm text-foreground/70 mb-6">
              Connect your wallet to view your bets and winnings
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Total Bet</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">
                  {totalBetAmount.toFixed(3)} ETH
                </div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-accent">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Active Bets</div>
                <div className="text-lg lg:text-2xl font-bold text-accent font-mono">{activeBets}</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-green-500">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Won Bets</div>
                <div className="text-lg lg:text-2xl font-bold text-green-400 font-mono">{wonBets}</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary">
                <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Total Winnings</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">
                  {totalWinnings.toFixed(3)} ETH
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:space-y-4">
              {mockUserBets.map((bet) => (
                <div key={bet.matchId} className="cm-panel rounded-sm overflow-hidden">
                  <div className="bg-secondary/40 px-3 lg:px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-0 border-b-2 border-border">
                    <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
                      <div className="text-xs lg:text-sm flex items-center flex-wrap gap-1">
                        <span className="text-2xl lg:text-4xl">{bet.team1Flag}</span>
                        <span className="text-foreground font-bold">{bet.team1}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-foreground font-bold">{bet.team2}</span>
                        <span className="text-2xl lg:text-4xl">{bet.team2Flag}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                      <div className="text-[10px] lg:text-xs text-foreground/70 font-mono">{bet.matchDate}</div>
                      {bet.status === "active" && (
                        <div className="flex items-center gap-1.5 bg-accent/20 px-2 py-1 rounded-sm border border-accent">
                          <Clock className="w-3 h-3 text-accent" />
                          <span className="text-[10px] lg:text-xs text-accent font-bold uppercase">Active</span>
                        </div>
                      )}
                      {bet.status === "won" && (
                        <div className="flex items-center gap-1.5 bg-primary/20 px-2 py-1 rounded-sm border border-primary">
                          <Trophy className="w-3 h-3 text-primary" />
                          <span className="text-[10px] lg:text-xs text-primary font-bold uppercase">Won</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 lg:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-secondary/10">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                      <div className="bg-card/50 p-2 rounded-sm">
                        <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                          Your Vote
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl lg:text-2xl">{bet.votedTeamFlag}</span>
                          <span className="text-base lg:text-lg font-bold text-foreground">{bet.votedTeam}</span>
                        </div>
                      </div>
                      <div className="bg-card/50 p-2 rounded-sm">
                        <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                          Amount Voted
                        </div>
                        <div className="text-base lg:text-lg font-mono font-bold cm-highlight">{bet.amount} ETH</div>
                      </div>
                      <div className="bg-card/50 p-2 rounded-sm">
                        <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                          Currently Winning
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-accent" />
                          <span className="text-xs lg:text-sm font-bold text-foreground">{bet.currentWinning}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left lg:text-right bg-card/50 p-3 rounded-sm">
                      <div className="text-[10px] lg:text-xs text-foreground/70 mb-1 uppercase font-bold">
                        {bet.status === "won" ? "Winnings" : "Potential Return"}
                      </div>
                      <div className="text-xl lg:text-2xl font-mono font-bold cm-highlight">
                        {bet.potentialReturn} ETH
                      </div>
                      {bet.status === "won" && (
                        <button className="mt-2 bg-primary text-primary-foreground px-3 lg:px-4 py-1.5 lg:py-2 rounded-sm text-xs lg:text-sm font-bold uppercase hover:scale-105 transition-transform border border-primary">
                          Claim Winnings
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
