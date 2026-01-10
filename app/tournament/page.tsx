"use client"

import { useState, useEffect } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { RetroNavTabs } from "@/components/retro-nav-tabs"
import { UnifiedMatchCard } from "@/components/unified-match-card"
import { VoteModal } from "@/components/vote-modal"
import { Trophy, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"

const tabs = [
  { label: "Summary", value: "summary" },
  { label: "Standings", value: "standings" },
  { label: "Schedule", value: "schedule" },
  { label: "Results", value: "results" },
  { label: "Most Votes", value: "top-teams" },
]

const mockStandings = [
  {
    pos: 1,
    team: "Brazil",
    flag: "🇧🇷",
    played: 3,
    won: 3,
    drawn: 0,
    lost: 0,
    gf: 8,
    ga: 2,
    gd: 6,
    pts: 9,
    votes: 1250,
  },
  {
    pos: 2,
    team: "France",
    flag: "🇫🇷",
    played: 3,
    won: 2,
    drawn: 1,
    lost: 0,
    gf: 7,
    ga: 3,
    gd: 4,
    pts: 7,
    votes: 1120,
  },
  {
    pos: 3,
    team: "Argentina",
    flag: "🇦🇷",
    played: 3,
    won: 2,
    drawn: 0,
    lost: 1,
    gf: 6,
    ga: 4,
    gd: 2,
    pts: 6,
    votes: 1050,
  },
  {
    pos: 4,
    team: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    played: 3,
    won: 2,
    drawn: 0,
    lost: 1,
    gf: 5,
    ga: 3,
    gd: 2,
    pts: 6,
    votes: 980,
  },
  { pos: 5, team: "Spain", flag: "🇪🇸", played: 3, won: 1, drawn: 2, lost: 0, gf: 5, ga: 3, gd: 2, pts: 5, votes: 890 },
  {
    pos: 6,
    team: "Germany",
    flag: "🇩🇪",
    played: 3,
    won: 1,
    drawn: 1,
    lost: 1,
    gf: 4,
    ga: 4,
    gd: 0,
    pts: 4,
    votes: 850,
  },
]

const allSchedule = [
  {
    date: "June 11, 2026",
    matches: [
      {
        time: "11:00 AM",
        team1: "USA",
        team2: "Wales",
        team1Flag: "🇺🇸",
        team2Flag: "🏴",
        stadium: "Rose Bowl, LA",
        group: "A",
      },
      {
        time: "2:00 PM",
        team1: "Senegal",
        team2: "Netherlands",
        team1Flag: "🇸🇳",
        team2Flag: "🇳🇱",
        stadium: "MetLife Stadium, NY",
        group: "A",
      },
    ],
  },
  {
    date: "June 12, 2026",
    matches: [
      {
        time: "11:00 AM",
        team1: "Argentina",
        team2: "Saudi Arabia",
        team1Flag: "🇦🇷",
        team2Flag: "🇸🇦",
        stadium: "AT&T Stadium, Dallas",
        group: "C",
      },
      {
        time: "2:00 PM",
        team1: "Mexico",
        team2: "Poland",
        team1Flag: "🇲🇽",
        team2Flag: "🇵🇱",
        stadium: "Arrowhead Stadium, KC",
        group: "C",
      },
    ],
  },
]

const results = [
  {
    id: "101",
    date: "June 10",
    team1: "Brazil",
    team2: "Serbia",
    team1Flag: "🇧🇷",
    team2Flag: "🇷🇸",
    score1: 2,
    score2: 0,
    votes1: "450",
    votes2: "180",
    winner: 1,
    stadium: "MetLife Stadium, NY",
    matchDate: "June 10, 2026",
    contractAddress: "0x1234567890123456789012345678901234567890",
  },
  {
    id: "102",
    date: "June 10",
    team1: "France",
    team2: "Australia",
    team1Flag: "🇫🇷",
    team2Flag: "🇦🇺",
    score1: 4,
    score2: 1,
    votes1: "520",
    votes2: "210",
    winner: 1,
    stadium: "Rose Bowl, LA",
    matchDate: "June 10, 2026",
    contractAddress: "0x2345678901234567890123456789012345678901",
  },
  {
    id: "103",
    date: "June 9",
    team1: "Argentina",
    team2: "Mexico",
    team1Flag: "🇦🇷",
    team2Flag: "🇲🇽",
    score1: 2,
    score2: 0,
    votes1: "410",
    votes2: "340",
    winner: 1,
    stadium: "SoFi Stadium, LA",
    matchDate: "June 9, 2026",
    contractAddress: "0x3456789012345678901234567890123456789012",
  },
]

const topTeamsByVotes = [
  { pos: 1, team: "Brazil", flag: "🇧🇷", totalVotes: 1250, totalETH: 12.5, voters: 340 },
  { pos: 2, team: "France", flag: "🇫🇷", totalVotes: 1120, totalETH: 11.2, voters: 310 },
  { pos: 3, team: "Argentina", flag: "🇦🇷", totalVotes: 1050, totalETH: 10.5, voters: 290 },
  { pos: 4, team: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", totalVotes: 980, totalETH: 9.8, voters: 270 },
  { pos: 5, team: "Spain", flag: "🇪🇸", totalVotes: 890, totalETH: 8.9, voters: 245 },
]

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState("summary")
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const [displayedStandings, setDisplayedStandings] = useState(6)
  const [displayedResults, setDisplayedResults] = useState(3)
  const [displayedTopTeams, setDisplayedTopTeams] = useState(5)
  const [displayedSchedule, setDisplayedSchedule] = useState(2)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Infinite scroll for standings
  const { sentinelRef: standingsSentinel, shouldLoadMore: shouldLoadStandings } = useInfiniteScroll({
    hasMore: displayedStandings < mockStandings.length,
    isLoading: isLoadingMore,
  })

  // Infinite scroll for results
  const { sentinelRef: resultsSentinel, shouldLoadMore: shouldLoadResults } = useInfiniteScroll({
    hasMore: displayedResults < results.length,
    isLoading: isLoadingMore,
  })

  // Infinite scroll for top teams
  const { sentinelRef: topTeamsSentinel, shouldLoadMore: shouldLoadTopTeams } = useInfiniteScroll({
    hasMore: displayedTopTeams < topTeamsByVotes.length,
    isLoading: isLoadingMore,
  })

  // Infinite scroll for schedule
  const { sentinelRef: scheduleSentinel, shouldLoadMore: shouldLoadSchedule } = useInfiniteScroll({
    hasMore: displayedSchedule < allSchedule.length,
    isLoading: isLoadingMore,
  })

  useEffect(() => {
    if (shouldLoadStandings) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedStandings((prev) => Math.min(prev + 6, mockStandings.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadStandings])

  useEffect(() => {
    if (shouldLoadResults) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedResults((prev) => Math.min(prev + 3, results.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadResults])

  useEffect(() => {
    if (shouldLoadTopTeams) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedTopTeams((prev) => Math.min(prev + 5, topTeamsByVotes.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadTopTeams])

  useEffect(() => {
    if (shouldLoadSchedule) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayedSchedule((prev) => Math.min(prev + 2, allSchedule.length))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [shouldLoadSchedule])

  const handleVoteClick = (match: any, teamIndex: number) => {
    setSelectedMatch({
      ...match,
      teamIndex,
      team: teamIndex === 0 ? match.team1 : match.team2,
      teamFlag: teamIndex === 0 ? match.team1Flag : match.team2Flag,
      opponent: teamIndex === 0 ? match.team2 : match.team1,
      opponentFlag: teamIndex === 0 ? match.team2Flag : match.team1Flag,
    })
    setVoteModalOpen(true)
  }

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">Tournament Central</span>
            </h1>
            <p className="text-xs lg:text-sm text-foreground/80">Live standings, schedule, results, and voting stats</p>
          </div>
        </div>

        {/* Using shared RetroNavTabs component */}
        <RetroNavTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="space-y-4 lg:space-y-6">
            {/* Today's Matches */}
            <div>
              <div className="cm-panel rounded-sm overflow-hidden mb-3">
                <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center gap-3">
                  <Clock className="w-4 lg:w-5 h-4 lg:h-5 text-accent" />
                  <h2 className="text-lg lg:text-xl font-bold cm-highlight">Today's Matches</h2>
                </div>
              </div>

              <div className="space-y-3">
                {/* Using UnifiedMatchCard with voting status */}
                <UnifiedMatchCard
                  id="1"
                  team1="Brazil"
                  team2="Croatia"
                  team1Flag="🇧🇷"
                  team2Flag="🇭🇷"
                  team1Votes="12.5"
                  team2Votes="18.2"
                  currentPrice="0.0045"
                  pricePhase="linear"
                  timeRemaining="1h 23m"
                  stadium="Rose Bowl, LA"
                  matchDate="June 15, 2026 - 2:00 PM"
                  contractAddress="0x1234567890123456789012345678901234567890"
                  status="voting"
                />
                <UnifiedMatchCard
                  id="2"
                  team1="Argentina"
                  team2="Netherlands"
                  team1Flag="🇦🇷"
                  team2Flag="🇳🇱"
                  team1Votes="8.7"
                  team2Votes="9.1"
                  currentPrice="0.0078"
                  pricePhase="exponential"
                  timeRemaining="4h 12m"
                  stadium="MetLife Stadium, NY"
                  matchDate="June 15, 2026 - 6:00 PM"
                  contractAddress="0x2345678901234567890123456789012345678901"
                  status="voting"
                />
              </div>
            </div>

            {/* Tomorrow's Matches */}
            <div>
              <div className="cm-panel rounded-sm overflow-hidden mb-3">
                <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center gap-3">
                  <Calendar className="w-4 lg:w-5 h-4 lg:h-5 text-accent" />
                  <h2 className="text-lg lg:text-xl font-bold cm-highlight">Tomorrow's Matches</h2>
                </div>
              </div>

              <div className="space-y-3">
                {/* Using UnifiedMatchCard with upcoming status */}
                <UnifiedMatchCard
                  id="3"
                  team1="England"
                  team2="France"
                  team1Flag="🏴󠁧󠁢󠁥󠁮󠁧󠁿"
                  team2Flag="🇫🇷"
                  team1Votes="0"
                  team2Votes="0"
                  currentPrice="0.004"
                  timeUntilStart="18h 30m"
                  stadium="SoFi Stadium, LA"
                  matchDate="June 16, 2026 - 1:00 PM"
                  contractAddress="0x3456789012345678901234567890123456789012"
                  status="upcoming"
                />
                <UnifiedMatchCard
                  id="4"
                  team1="Spain"
                  team2="Germany"
                  team1Flag="🇪🇸"
                  team2Flag="🇩🇪"
                  team1Votes="0"
                  team2Votes="0"
                  currentPrice="0.004"
                  timeUntilStart="22h 30m"
                  stadium="AT&T Stadium, Dallas"
                  matchDate="June 16, 2026 - 5:00 PM"
                  contractAddress="0x4567890123456789012345678901234567890123"
                  status="upcoming"
                />
              </div>
            </div>
          </div>
        )}

        {/* Standings Tab */}
        {activeTab === "standings" && (
          <div className="cm-panel rounded-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs lg:text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b-2 border-accent/30">
                    <th className="text-left p-2 lg:p-3 font-bold cm-highlight">Pos</th>
                    <th className="text-left p-2 lg:p-3 font-bold cm-highlight">Team</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight hidden lg:table-cell">Pld</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">W</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">D</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">L</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight hidden lg:table-cell">GF</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight hidden lg:table-cell">GA</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">GD</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStandings.slice(0, displayedStandings).map((team) => (
                    <tr key={team.pos} className="border-b border-border hover:bg-accent/5">
                      <td className="p-2 lg:p-3 cm-highlight font-bold">{team.pos}</td>
                      <td className="p-2 lg:p-3">
                        <Link
                          href={`/teams/${team.team.toLowerCase()}`}
                          className="flex items-center gap-2 hover:text-accent"
                        >
                          <span className="text-lg lg:text-2xl">{team.flag}</span>
                          <span className="font-bold">{team.team}</span>
                        </Link>
                      </td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70 hidden lg:table-cell">{team.played}</td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70">{team.won}</td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70">{team.drawn}</td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70">{team.lost}</td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70 hidden lg:table-cell">{team.gf}</td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70 hidden lg:table-cell">{team.ga}</td>
                      <td className="text-center p-2 lg:p-3 font-bold">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                      <td className="text-center p-2 lg:p-3 cm-highlight font-bold">{team.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayedStandings < mockStandings.length && (
                <div ref={standingsSentinel} className="p-4 text-center">
                  <div className="text-xs text-muted-foreground">Loading more...</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            {allSchedule.slice(0, displayedSchedule).map((day, dayIndex) => (
              <div key={dayIndex}>
                <div className="cm-panel rounded-sm overflow-hidden mb-3">
                  <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center gap-3">
                    <Calendar className="w-4 lg:w-5 h-4 lg:h-5 text-accent" />
                    <h2 className="text-lg lg:text-xl font-bold cm-highlight">{day.date}</h2>
                    <span className="text-xs text-muted-foreground ml-auto">{day.matches.length} Matches</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {day.matches.map((match, matchIndex) => (
                    <UnifiedMatchCard
                      key={matchIndex}
                      id={`${dayIndex + 10}-${matchIndex}`}
                      team1={match.team1}
                      team2={match.team2}
                      team1Flag={match.team1Flag}
                      team2Flag={match.team2Flag}
                      team1Votes="0"
                      team2Votes="0"
                      currentPrice="0.004"
                      timeUntilStart={`${12 + dayIndex * 24}h ${30 + matchIndex * 15}m`}
                      stadium={match.stadium}
                      matchDate={`${day.date} - ${match.time}`}
                      contractAddress={
                        `0x${(1000000 + dayIndex * 100 + matchIndex).toString(16).padStart(40, "0")}` as `0x${string}`
                      }
                      status="upcoming"
                    />
                  ))}
                </div>
              </div>
            ))}
            {displayedSchedule < allSchedule.length && (
              <div ref={scheduleSentinel} className="cm-panel rounded-sm p-4 text-center">
                <div className="text-xs text-muted-foreground">Loading more matches...</div>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="space-y-3">
            {results.slice(0, displayedResults).map((result) => (
              <UnifiedMatchCard
                key={result.id}
                id={result.id}
                team1={result.team1}
                team2={result.team2}
                team1Flag={result.team1Flag}
                team2Flag={result.team2Flag}
                team1Votes={result.votes1}
                team2Votes={result.votes2}
                score1={result.score1}
                score2={result.score2}
                winner={result.winner}
                stadium={result.stadium}
                matchDate={result.matchDate}
                contractAddress={result.contractAddress}
                status="completed"
              />
            ))}
            {displayedResults < results.length && (
              <div ref={resultsSentinel} className="cm-panel rounded-sm p-4 text-center">
                <div className="text-xs text-muted-foreground">Loading more results...</div>
              </div>
            )}
          </div>
        )}

        {/* Most Votes Tab */}
        {activeTab === "top-teams" && (
          <div className="cm-panel rounded-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs lg:text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b-2 border-accent/30">
                    <th className="text-left p-2 lg:p-3 font-bold cm-highlight">Rank</th>
                    <th className="text-left p-2 lg:p-3 font-bold cm-highlight">Team</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">Total Votes</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight hidden lg:table-cell">Total ETH</th>
                    <th className="text-center p-2 lg:p-3 font-bold cm-highlight">Voters</th>
                  </tr>
                </thead>
                <tbody>
                  {topTeamsByVotes.slice(0, displayedTopTeams).map((team) => (
                    <tr key={team.pos} className="border-b border-border hover:bg-accent/5">
                      <td className="p-2 lg:p-3">
                        <div className="flex items-center gap-2">
                          {team.pos === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                          <span className="cm-highlight font-bold">{team.pos}</span>
                        </div>
                      </td>
                      <td className="p-2 lg:p-3">
                        <Link
                          href={`/teams/${team.team.toLowerCase()}`}
                          className="flex items-center gap-2 hover:text-accent"
                        >
                          <span className="text-lg lg:text-2xl">{team.flag}</span>
                          <span className="font-bold">{team.team}</span>
                        </Link>
                      </td>
                      <td className="text-center p-2 lg:p-3 cm-highlight font-bold font-mono">{team.totalVotes}</td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70 font-mono hidden lg:table-cell">
                        {team.totalETH} ETH
                      </td>
                      <td className="text-center p-2 lg:p-3 text-foreground/70">{team.voters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayedTopTeams < topTeamsByVotes.length && (
                <div ref={topTeamsSentinel} className="p-4 text-center">
                  <div className="text-xs text-muted-foreground">Loading more teams...</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Vote Modal */}
      {selectedMatch && (
        <VoteModal
          isOpen={voteModalOpen}
          onClose={() => {
            setVoteModalOpen(false)
            setSelectedMatch(null)
          }}
          team={selectedMatch.team}
          teamFlag={selectedMatch.teamFlag}
          opponent={selectedMatch.opponent}
          opponentFlag={selectedMatch.opponentFlag}
          currentPrice={0.001}
          pricePhase="linear"
          matchId={selectedMatch.matchId.toString()}
          contractAddress="0x0000000000000000000000000000000000000000"
          teamIndex={selectedMatch.teamIndex}
        />
      )}
    </div>
  )
}
