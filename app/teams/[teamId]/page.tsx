"use client"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const mockTeams = {
  brazil: {
    id: "brazil",
    name: "Brazil",
    flag: "🇧🇷",
    group: "Group F",
    played: 3,
    won: 2,
    drawn: 1,
    lost: 0,
    gf: 7,
    ga: 3,
    pts: 7,
    form: ["W", "W", "D"],
    totalVotes: "45.2 ETH",
    topVoters: [
      { address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", amount: "8.5 ETH" },
      { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", amount: "6.2 ETH" },
      { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", amount: "5.1 ETH" },
    ],
    upcomingMatches: [
      {
        id: "1",
        opponent: "Argentina",
        flag: "🇦🇷",
        date: "June 15, 2026",
        stadium: "MetLife Stadium",
        time: "20:00 ET",
      },
      { id: "2", opponent: "Uruguay", flag: "🇺🇾", date: "June 19, 2026", stadium: "AT&T Stadium", time: "18:00 CT" },
    ],
    pastMatches: [
      { id: "3", opponent: "Colombia", flag: "🇨🇴", result: "W 2-1", date: "June 10, 2026", totalVotes: "32.5 ETH" },
      { id: "4", opponent: "Peru", flag: "🇵🇪", result: "W 3-0", date: "June 6, 2026", totalVotes: "28.7 ETH" },
      { id: "5", opponent: "Venezuela", flag: "🇻🇪", result: "D 2-2", date: "June 2, 2026", totalVotes: "21.3 ETH" },
    ],
  },
  argentina: {
    id: "argentina",
    name: "Argentina",
    flag: "🇦🇷",
    group: "Group F",
    played: 3,
    won: 2,
    drawn: 0,
    lost: 1,
    gf: 6,
    ga: 4,
    pts: 6,
    form: ["W", "L", "W"],
    totalVotes: "52.8 ETH",
    topVoters: [
      { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", amount: "9.2 ETH" },
      { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", amount: "7.8 ETH" },
      { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", amount: "6.5 ETH" },
    ],
    upcomingMatches: [
      { id: "1", opponent: "Brazil", flag: "🇧🇷", date: "June 15, 2026", stadium: "MetLife Stadium", time: "20:00 ET" },
      { id: "6", opponent: "Chile", flag: "🇨🇱", date: "June 20, 2026", stadium: "Rose Bowl", time: "19:00 PT" },
    ],
    pastMatches: [
      { id: "7", opponent: "Paraguay", flag: "🇵🇾", result: "W 3-1", date: "June 11, 2026", totalVotes: "35.8 ETH" },
      { id: "8", opponent: "Ecuador", flag: "🇪🇨", result: "L 1-2", date: "June 7, 2026", totalVotes: "29.4 ETH" },
      { id: "9", opponent: "Bolivia", flag: "🇧🇴", result: "W 2-1", date: "June 3, 2026", totalVotes: "24.1 ETH" },
    ],
  },
  germany: {
    id: "germany",
    name: "Germany",
    flag: "🇩🇪",
    group: "Group B",
    played: 3,
    won: 3,
    drawn: 0,
    lost: 0,
    gf: 8,
    ga: 2,
    pts: 9,
    form: ["W", "W", "W"],
    totalVotes: "38.7 ETH",
    topVoters: [
      { address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", amount: "7.1 ETH" },
      { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", amount: "5.9 ETH" },
      { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", amount: "4.8 ETH" },
    ],
    upcomingMatches: [
      { id: "10", opponent: "France", flag: "🇫🇷", date: "June 16, 2026", stadium: "SoFi Stadium", time: "17:00 PT" },
      { id: "11", opponent: "Spain", flag: "🇪🇸", date: "June 21, 2026", stadium: "Gillette Stadium", time: "15:00 ET" },
    ],
    pastMatches: [
      { id: "12", opponent: "Poland", flag: "🇵🇱", result: "W 3-1", date: "June 12, 2026", totalVotes: "31.2 ETH" },
      { id: "13", opponent: "Austria", flag: "🇦🇹", result: "W 2-0", date: "June 8, 2026", totalVotes: "26.8 ETH" },
      {
        id: "14",
        opponent: "Czech Republic",
        flag: "🇨🇿",
        result: "W 3-1",
        date: "June 4, 2026",
        totalVotes: "22.5 ETH",
      },
    ],
  },
  france: {
    id: "france",
    name: "France",
    flag: "🇫🇷",
    group: "Group B",
    played: 3,
    won: 2,
    drawn: 1,
    lost: 0,
    gf: 6,
    ga: 2,
    pts: 7,
    form: ["W", "D", "W"],
    totalVotes: "41.5 ETH",
    topVoters: [
      { address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", amount: "8.1 ETH" },
      { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", amount: "6.7 ETH" },
      { address: "0x0000000000085d4780B73119b644AE5ecd22b376", amount: "5.5 ETH" },
    ],
    upcomingMatches: [
      { id: "10", opponent: "Germany", flag: "🇩🇪", date: "June 16, 2026", stadium: "SoFi Stadium", time: "17:00 PT" },
      {
        id: "15",
        opponent: "Italy",
        flag: "🇮🇹",
        date: "June 22, 2026",
        stadium: "Lincoln Financial Field",
        time: "16:00 ET",
      },
    ],
    pastMatches: [
      { id: "16", opponent: "Belgium", flag: "🇧🇪", result: "W 2-1", date: "June 13, 2026", totalVotes: "33.7 ETH" },
      { id: "17", opponent: "Netherlands", flag: "🇳🇱", result: "D 1-1", date: "June 9, 2026", totalVotes: "27.9 ETH" },
      { id: "18", opponent: "Switzerland", flag: "🇨🇭", result: "W 3-0", date: "June 5, 2026", totalVotes: "23.6 ETH" },
    ],
  },
}

export default function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const teamId = params.teamId
  const team = mockTeams[teamId as keyof typeof mockTeams]

  if (!team) {
    return (
      <div className="min-h-screen flex">
        <RetroSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-24 p-8 pb-20 lg:pb-8">
          <div className="cm-panel p-8 rounded-sm text-center">
            <p className="text-muted-foreground">Team not found</p>
            <Link href="/teams" className="cm-nav-tab inline-block px-6 py-2 mt-4">
              Back to Teams
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Back Button */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-xs lg:text-sm text-accent hover:text-accent/80 mb-4 lg:mb-6"
        >
          <ArrowLeft className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
          Back to Teams
        </Link>

        {/* Team Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-8 flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
            <div className="text-5xl lg:text-8xl">{team.flag}</div>
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-3xl lg:text-5xl font-bold cm-highlight mb-2">{team.name}</h1>
              <p className="text-sm lg:text-base text-muted-foreground">{team.group}</p>
            </div>
            <div className="text-center bg-card/90 p-4 lg:p-6 rounded-sm">
              <div className="text-xs text-muted-foreground mb-1">Total Votes</div>
              <div className="text-2xl lg:text-4xl font-bold cm-highlight font-mono">{team.totalVotes}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Statistics */}
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">STATISTICS</h3>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 text-muted-foreground">Matches Played</td>
                    <td className="py-3 text-right font-mono cm-highlight font-bold">{team.played}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-muted-foreground">Wins</td>
                    <td className="py-3 text-right font-mono text-green-400 font-bold">{team.won}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-muted-foreground">Draws</td>
                    <td className="py-3 text-right font-mono text-yellow-400 font-bold">{team.drawn}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-muted-foreground">Losses</td>
                    <td className="py-3 text-right font-mono text-red-400 font-bold">{team.lost}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-muted-foreground">Goals For</td>
                    <td className="py-3 text-right font-mono cm-highlight font-bold">{team.gf}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-muted-foreground">Goals Against</td>
                    <td className="py-3 text-right font-mono text-foreground font-bold">{team.ga}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Points</td>
                    <td className="py-3 text-right font-mono cm-highlight font-bold text-lg">{team.pts}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Recent Form</div>
                <div className="flex gap-2">
                  {team.form.map((result, idx) => (
                    <div
                      key={idx}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-sm ${
                        result === "W"
                          ? "bg-green-600 text-white"
                          : result === "D"
                            ? "bg-yellow-600 text-white"
                            : "bg-red-600 text-white"
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Voters */}
          <div className="cm-panel rounded-sm overflow-hidden">
            <div className="cm-section-header px-4 py-2">
              <h3 className="text-sm font-bold">TOP VOTERS</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {team.topVoters.map((voter, idx) => (
                  <Link
                    key={voter.address}
                    href={`/users/${voter.address}`}
                    className="cm-hover-row p-3 rounded-sm flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <span className="text-sm font-mono text-foreground truncate">
                        {voter.address.slice(0, 8)}...{voter.address.slice(-6)}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold cm-highlight flex-shrink-0">{voter.amount}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="cm-section-header px-4 py-2">
            <h3 className="text-sm font-bold">UPCOMING MATCHES</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {team.upcomingMatches.map((match) => (
                <div key={match.id} className="cm-hover-row p-4 rounded-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-3xl flex-shrink-0">{match.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate">{match.opponent}</div>
                      <div className="text-xs text-muted-foreground truncate">{match.stadium}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-accent font-mono">{match.date}</div>
                    <div className="text-xs text-muted-foreground">{match.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Past Results */}
        <div className="cm-panel rounded-sm overflow-hidden">
          <div className="cm-section-header px-4 py-2">
            <h3 className="text-sm font-bold">PAST RESULTS</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {team.pastMatches.map((match) => (
                <div key={match.id} className="cm-hover-row p-4 rounded-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-3xl flex-shrink-0">{match.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate">{match.opponent}</div>
                      <div className="text-xs text-muted-foreground">{match.date}</div>
                      <div className="text-xs text-accent font-mono mt-1">Total: {match.totalVotes}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-lg font-bold font-mono ${
                        match.result.startsWith("W")
                          ? "text-green-400"
                          : match.result.startsWith("D")
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {match.result}
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
