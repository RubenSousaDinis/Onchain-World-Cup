"use client"

import { useState } from "react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { RetroNavTabs } from "@/components/retro-nav-tabs"
import { MatchCard } from "@/components/match-card"
import { PrizePoolDisplay } from "@/components/prize-pool-display"
import { RetroSearch } from "@/components/retro-search"

const tabs = [
  { label: "Live Matches", value: "live" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Results", value: "results" },
  { label: "Prize Pools", value: "pools" },
]

const mockMatches = [
  {
    id: "1",
    team1: "Brazil",
    team2: "Argentina",
    team1Flag: "🇧🇷",
    team2Flag: "🇦🇷",
    team1Votes: "12.5", // ETH amount in pool
    team2Votes: "18.2", // ETH amount in pool
    currentPrice: "0.0045",
    pricePhase: "linear" as const,
    timeRemaining: "1h 23m",
    stadium: "MetLife Stadium, NY",
    matchDate: "June 15, 2026 - 8:00 PM",
    contractAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  },
  {
    id: "2",
    team1: "Germany",
    team2: "France",
    team1Flag: "🇩🇪",
    team2Flag: "🇫🇷",
    team1Votes: "8.7",
    team2Votes: "9.1",
    currentPrice: "0.0078",
    pricePhase: "exponential" as const,
    timeRemaining: "4h 12m",
    stadium: "SoFi Stadium, LA",
    matchDate: "June 16, 2026 - 5:00 PM",
    contractAddress: "0x2345678901234567890123456789012345678901" as `0x${string}`,
  },
]

export default function HomePageClient() {
  const [activeTab, setActiveTab] = useState("live")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMatches = mockMatches.filter(
    (match) =>
      match.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.team2.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-6 lg:mb-8 max-w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
            <h1 className="text-2xl lg:text-4xl font-bold truncate">
              <span className="cm-highlight">Crypto World Cup 2026</span>
            </h1>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <div className="cm-panel px-3 lg:px-4 py-2 rounded-sm flex-shrink-0">
                <div className="text-[10px] lg:text-xs text-muted-foreground">Total Prize Pool</div>
                <div className="text-lg lg:text-xl font-bold cm-highlight font-mono">245.8 ETH</div>
              </div>
              <div className="cm-panel px-3 lg:px-4 py-2 rounded-sm flex-shrink-0">
                <div className="text-[10px] lg:text-xs text-muted-foreground">Active Bets</div>
                <div className="text-lg lg:text-xl font-bold text-accent font-mono">1,247</div>
              </div>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-muted-foreground mb-4">
            Vote with ETH on World Cup matches. Winners take 90% of the prize pool. Powered by Base Network.
          </p>

          <div className="max-w-md">
            <RetroSearch placeholder="Search teams..." onSearch={setSearchQuery} value={searchQuery} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <RetroNavTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Matches Grid */}
        <div className="grid gap-4 lg:gap-6">
          {filteredMatches.length === 0 ? (
            <div className="cm-panel p-8 rounded-sm text-center">
              <p className="text-muted-foreground">No matches found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} {...match} />
              ))}

              <PrizePoolDisplay
                totalPool={30.7}
                team1Name="Brazil"
                team2Name="Argentina"
                team1Pool={12.5}
                team2Pool={18.2}
                team1Voters={87}
                team2Voters={142}
              />
            </>
          )}
        </div>

        {/* Info Bar (like CM 01/02 bottom bar) */}
        <div className="hidden lg:block fixed bottom-0 left-24 right-0 cm-panel border-t border-border">
          <div className="px-8 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground">Network:</span>
                <span className="ml-2 text-accent font-bold">Base Mainnet</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gas Price:</span>
                <span className="ml-2 text-foreground font-mono">12 gwei</span>
              </div>
            </div>
            <div className="cm-highlight font-mono text-xs">Ready to Vote</div>
          </div>
        </div>
      </main>
    </div>
  )
}
