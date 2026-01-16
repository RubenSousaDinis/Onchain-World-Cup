"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"

const _tabs = [
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

type Match = {
  id: string
  date: string
  team1: string
  team2: string
  team1Flag: string
  team2Flag: string
  score1?: number
  score2?: number
  votes1?: string
  votes2?: string
  winner?: number
  stadium: string
  matchDate: string
  contractAddress: string
}

export default function TournamentPage() {
  const [_activeTab, _setActiveTab] = useState("summary")
  const [_voteModalOpen, _setVoteModalOpen] = useState(false)
  const [_selectedMatch, _setSelectedMatch] = useState<Match | null>(null)

  const [displayedStandings, setDisplayedStandings] = useState(6)
  const [displayedResults, setDisplayedResults] = useState(3)
  const [displayedTopTeams, setDisplayedTopTeams] = useState(5)
  const [displayedSchedule, setDisplayedSchedule] = useState(2)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Infinite scroll for standings
  const { sentinelRef: _standingsSentinel, shouldLoadMore: shouldLoadStandings } = useInfiniteScroll({
    hasMore: displayedStandings < mockStandings.length,
    isLoading: isLoadingMore,
  })

  // Infinite scroll for results
  const { sentinelRef: _resultsSentinel, shouldLoadMore: shouldLoadResults } = useInfiniteScroll({
    hasMore: displayedResults < results.length,
    isLoading: isLoadingMore,
  })

  // Infinite scroll for top teams
  const { sentinelRef: _topTeamsSentinel, shouldLoadMore: shouldLoadTopTeams } = useInfiniteScroll({
    hasMore: displayedTopTeams < topTeamsByVotes.length,
    isLoading: isLoadingMore,
  })

  // Infinite scroll for schedule
  const { sentinelRef: _scheduleSentinel, shouldLoadMore: shouldLoadSchedule } = useInfiniteScroll({
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

  const _handleVoteClick = (_match: Match, _teamIndex: number) => {
    // Future implementation - tournament phase not active yet
  }

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        <div className="cm-panel rounded-sm overflow-hidden mb-6">
          <div className="soccer-field-bg p-8 lg:p-16 text-center">
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              <span className="cm-highlight">Tournament Coming Soon</span>
            </h1>
            <p className="text-base lg:text-xl text-white">
              We're currently in the <span className="cm-highlight font-bold">Qualification Phase</span>
            </p>
          </div>

          <div className="bg-secondary/30 p-6 lg:p-8">
            <p className="text-sm lg:text-base text-gray-300 mb-6 max-w-3xl mx-auto">
              The tournament brackets haven't been set yet. Right now, the global community is voting to decide which 48
              countries will qualify for the Onchain World Cup 2026. Help your nation secure their spot!
            </p>
            <div className="text-center">
              <Link
                href="/qualification"
                className="inline-block cm-nav-tab px-8 py-4 text-base lg:text-lg font-bold uppercase"
              >
                Go to Qualification →
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="cm-panel rounded-sm p-4 bg-secondary/20">
            <h3 className="text-lg font-bold cm-highlight mb-2">How It Works</h3>
            <p className="text-xs text-gray-300">
              Vote for countries during qualification. Top 48 by vote count advance to the tournament bracket.
            </p>
          </div>
          <div className="cm-panel rounded-sm p-4 bg-secondary/20">
            <h3 className="text-lg font-bold cm-highlight mb-2">Current Status</h3>
            <p className="text-xs text-gray-300">
              Qualification phase active. Tournament brackets will be revealed once all 48 teams are decided.
            </p>
          </div>
          <div className="cm-panel rounded-sm p-4 bg-secondary/20">
            <h3 className="text-lg font-bold cm-highlight mb-2">Get Involved</h3>
            <p className="text-xs text-gray-300">
              Every vote matters. Support your nation now and earn rewards when they qualify!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
