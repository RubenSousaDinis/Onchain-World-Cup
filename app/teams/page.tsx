"use client"

import { useState } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { RetroSearch } from "@/components/retro-search"
import Link from "next/link"

const mockTeams = [
  {
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
    upcomingMatches: [
      { opponent: "Argentina", flag: "🇦🇷", date: "June 15, 2026", stadium: "MetLife Stadium" },
      { opponent: "Uruguay", flag: "🇺🇾", date: "June 19, 2026", stadium: "AT&T Stadium" },
    ],
    pastMatches: [
      { opponent: "Colombia", flag: "🇨🇴", result: "W 2-1", date: "June 10, 2026" },
      { opponent: "Peru", flag: "🇵🇪", result: "W 3-0", date: "June 6, 2026" },
      { opponent: "Venezuela", flag: "🇻🇪", result: "D 2-2", date: "June 2, 2026" },
    ],
  },
  {
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
    upcomingMatches: [
      { opponent: "Brazil", flag: "🇧🇷", date: "June 15, 2026", stadium: "MetLife Stadium" },
      { opponent: "Chile", flag: "🇨🇱", date: "June 20, 2026", stadium: "Rose Bowl" },
    ],
    pastMatches: [
      { opponent: "Paraguay", flag: "🇵🇾", result: "W 3-1", date: "June 11, 2026" },
      { opponent: "Ecuador", flag: "🇪🇨", result: "L 1-2", date: "June 7, 2026" },
      { opponent: "Bolivia", flag: "🇧🇴", result: "W 2-1", date: "June 3, 2026" },
    ],
  },
  {
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
    upcomingMatches: [
      { opponent: "France", flag: "🇫🇷", date: "June 16, 2026", stadium: "SoFi Stadium" },
      { opponent: "Spain", flag: "🇪🇸", date: "June 21, 2026", stadium: "Gillette Stadium" },
    ],
    pastMatches: [
      { opponent: "Poland", flag: "🇵🇱", result: "W 3-1", date: "June 12, 2026" },
      { opponent: "Austria", flag: "🇦🇹", result: "W 2-0", date: "June 8, 2026" },
      { opponent: "Czech Republic", flag: "🇨🇿", result: "W 3-1", date: "June 4, 2026" },
    ],
  },
  {
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
    upcomingMatches: [
      { opponent: "Germany", flag: "🇩🇪", date: "June 16, 2026", stadium: "SoFi Stadium" },
      { opponent: "Italy", flag: "🇮🇹", date: "June 22, 2026", stadium: "Lincoln Financial Field" },
    ],
    pastMatches: [
      { opponent: "Belgium", flag: "🇧🇪", result: "W 2-1", date: "June 13, 2026" },
      { opponent: "Netherlands", flag: "🇳🇱", result: "D 1-1", date: "June 9, 2026" },
      { opponent: "Switzerland", flag: "🇨🇭", result: "W 3-0", date: "June 5, 2026" },
    ],
  },
]

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTeams = mockTeams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">Teams Overview</span>
            </h1>
            <p className="text-xs lg:text-sm text-foreground/80 mb-4">
              Complete team standings, statistics, past results, and upcoming matches
            </p>

            <div className="max-w-md">
              <RetroSearch placeholder="Search teams..." onSearch={setSearchQuery} value={searchQuery} />
            </div>
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-4 lg:space-y-6">
          {filteredTeams.length === 0 ? (
            <div className="cm-panel p-8 rounded-sm text-center">
              <p className="text-muted-foreground">No teams found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div key={team.id} className="cm-panel rounded-sm overflow-hidden">
                <div className="bg-secondary/40 px-4 py-3 flex items-center justify-between border-b-2 border-border">
                  <Link
                    href={`/teams/${team.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
                  >
                    <span className="text-3xl lg:text-4xl">{team.flag}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-bold cm-highlight">{team.name}</h3>
                      <p className="text-[10px] lg:text-xs text-foreground/70">{team.group}</p>
                    </div>
                  </Link>
                  <div className="text-right hidden lg:block bg-card/50 px-4 py-2 rounded-sm">
                    <div className="text-xs text-muted-foreground">Total Votes</div>
                    <div className="text-lg font-bold cm-highlight font-mono">{team.totalVotes}</div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="bg-secondary/10 rounded-sm p-3">
                    <div className="text-xs font-bold cm-highlight uppercase mb-2 border-b border-border pb-1">
                      Statistics
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-foreground/70 font-bold">P</th>
                          <th className="text-left py-2 text-foreground/70 font-bold">W</th>
                          <th className="text-left py-2 text-foreground/70 font-bold">D</th>
                          <th className="text-left py-2 text-foreground/70 font-bold">L</th>
                          <th className="text-left py-2 text-foreground/70 font-bold">GF</th>
                          <th className="text-left py-2 text-foreground/70 font-bold">GA</th>
                          <th className="text-left py-2 text-foreground/70 font-bold">Pts</th>
                          <th className="text-left py-2 text-foreground/70 font-bold">Form</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-card/20">
                          <td className="py-2 font-mono font-bold text-foreground">{team.played}</td>
                          <td className="py-2 font-mono font-bold text-foreground">{team.won}</td>
                          <td className="py-2 font-mono font-bold text-foreground">{team.drawn}</td>
                          <td className="py-2 font-mono font-bold text-foreground">{team.lost}</td>
                          <td className="py-2 font-mono font-bold text-foreground">{team.gf}</td>
                          <td className="py-2 font-mono font-bold text-foreground">{team.ga}</td>
                          <td className="py-2 font-mono font-bold cm-highlight">{team.pts}</td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              {team.form.map((result, idx) => (
                                <span
                                  key={idx}
                                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-sm ${
                                    result === "W"
                                      ? "bg-green-600 text-white"
                                      : result === "D"
                                        ? "bg-yellow-600 text-white"
                                        : "bg-red-600 text-white"
                                  }`}
                                >
                                  {result}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Upcoming Matches */}
                    <div>
                      <div className="bg-secondary/40 px-3 py-2 mb-2 border-b-2 border-accent/30">
                        <h4 className="text-xs font-bold cm-highlight uppercase">Upcoming Matches</h4>
                      </div>
                      <div className="space-y-2">
                        {team.upcomingMatches.map((match, idx) => (
                          <Link
                            key={idx}
                            href={`/matches/${idx + 1}`}
                            className="bg-card/30 hover:bg-card/50 transition-colors p-3 rounded-sm flex items-center justify-between gap-2 block cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-lg lg:text-xl flex-shrink-0">{match.flag}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-foreground truncate">{match.opponent}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{match.stadium}</div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[10px] cm-highlight font-mono font-bold">{match.date}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Past Results */}
                    <div>
                      <div className="bg-secondary/40 px-3 py-2 mb-2 border-b-2 border-accent/30">
                        <h4 className="text-xs font-bold cm-highlight uppercase">Past Results</h4>
                      </div>
                      <div className="space-y-2">
                        {team.pastMatches.map((match, idx) => (
                          <Link
                            key={idx}
                            href={`/matches/${idx + 10}`}
                            className="bg-card/30 hover:bg-card/50 transition-colors p-3 rounded-sm flex items-center justify-between gap-2 block cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-lg lg:text-xl flex-shrink-0">{match.flag}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-foreground truncate">{match.opponent}</div>
                                <div className="text-[10px] text-muted-foreground">{match.date}</div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div
                                className={`text-sm font-bold font-mono ${
                                  match.result.startsWith("W")
                                    ? "text-green-400"
                                    : match.result.startsWith("D")
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                }`}
                              >
                                {match.result.startsWith("W") ? "WON" : match.result.startsWith("D") ? "DRAW" : "LOST"}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
