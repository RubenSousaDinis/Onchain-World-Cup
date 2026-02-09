"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Clock, Eye, Trophy } from "lucide-react"
import { useAccount, useChainId } from "wagmi"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { UserMilestones } from "@/components/user-milestones"
import { ShareModal } from "@/components/share-modal"
import { FarcasterUserInfo } from "@/components/farcaster-user-info"
import { useState, useEffect, useRef } from "react"
import { NoVotesEmpty, InlineLoader } from "@/components/states"
import { getCountryName, getCountryFlag } from "@/lib/countries"
import Link from "next/link"
import { base, baseSepolia } from "wagmi/chains"

type UserVote = {
  id: string
  country_code: string
  voter_address: string
  vote_count: number
  total_cost_eth: string
  tx_hash: string
  created_at: string
}

type UserStats = {
  qualification_votes: number
  qualification_spent_eth: string
  countries_voted_for: number
  total_votes: number
  total_spent_eth: string
  total_won_eth: string
}

export default function MyBetsPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<any | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userVotes, setUserVotes] = useState<UserVote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isFetchingRef = useRef(false)

  // Get block explorer URL based on chain
  const getExplorerUrl = (txHash: string) => {
    const baseUrl = chainId === baseSepolia.id
      ? 'https://sepolia.basescan.org'
      : 'https://basescan.org'
    return `${baseUrl}/tx/${txHash}`
  }

  // Fetch user data when wallet connects
  useEffect(() => {
    const fetchUserData = async () => {
      if (!address || isFetchingRef.current) return

      isFetchingRef.current = true
      setIsLoading(true)

      try {
        const res = await fetch(`/api/users/${address}`)
        if (res.ok) {
          const response = await res.json()
          setUserStats({
            qualification_votes: response.data.qualification_votes,
            qualification_spent_eth: response.data.qualification_spent_eth,
            countries_voted_for: response.data.countries_voted_for,
            total_votes: response.data.total_votes,
            total_spent_eth: response.data.total_spent_eth,
            total_won_eth: response.data.total_won_eth,
          })
          setUserVotes(response.data.votes || [])
        } else {
          console.error('Failed to fetch user data:', res.statusText)
          setUserStats(null)
          setUserVotes([])
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserStats(null)
        setUserVotes([])
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
      }
    }

    if (isConnected && address) {
      fetchUserData()
    } else {
      setUserStats(null)
      setUserVotes([])
    }
  }, [address, isConnected])

  const totalVotes = userStats?.qualification_votes || 0
  const totalSpent = parseFloat(userStats?.qualification_spent_eth || '0')
  const countriesVoted = userStats?.countries_voted_for || 0
  const totalEarnings = parseFloat(userStats?.total_won_eth || '0')

  const _handleShareWin = (bet: any) => {
    setSelectedBet(bet)
    setShareModalOpen(true)
  }

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 min-w-0">
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">My Votes</span>
            </h1>
            <p className="text-sm lg:text-base text-foreground/80">
              Track your votes, monitor active matches, and claim your earnings
            </p>
          </div>
        </div>

        {/* Farcaster User Info */}
        <FarcasterUserInfo className="mb-6 lg:mb-8" />

        {!isConnected && (
          <div className="cm-panel rounded-sm p-4 mb-6 border-2 border-accent bg-accent/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-bold text-accent">Connect Wallet</p>
                  <p className="text-xs lg:text-sm text-foreground/70">
                    Connect your wallet to view your voting history and statistics.
                  </p>
                </div>
              </div>
              <WalletConnectButton />
            </div>
          </div>
        )}

        {!isConnected ? (
          <NoVotesEmpty />
        ) : isLoading ? (
          <div className="cm-panel rounded-sm p-8 text-center">
            <InlineLoader text="Loading your votes..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Total Votes</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">{totalVotes}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">votes placed</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-purple-500">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">ETH Spent</div>
                <div className="text-lg lg:text-2xl font-bold text-purple-400 font-mono">{totalSpent.toFixed(4)}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">ETH total</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-accent">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Countries</div>
                <div className="text-lg lg:text-2xl font-bold text-accent font-mono">{countriesVoted}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">countries voted</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-green-500">
                <div className="text-xs lg:text-xs text-foreground/70 mb-1 uppercase font-bold">Avg. Cost</div>
                <div className="text-lg lg:text-2xl font-bold text-green-400 font-mono">
                  {totalVotes > 0 ? (totalSpent / totalVotes).toFixed(6) : '0.000000'}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">ETH per vote</div>
              </div>
            </div>

            {/* Milestones Section */}
            <div className="mb-6 lg:mb-8">
              <UserMilestones />
            </div>

            {/* Qualification Votes List */}
            <div className="cm-panel rounded-sm overflow-hidden">
              <div className="bg-secondary/40 px-4 py-3 border-b-2 border-border">
                <h3 className="text-base lg:text-lg font-bold cm-highlight uppercase">Qualification Votes</h3>
                <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                  Your voting history for country qualification
                </p>
              </div>

              {userVotes.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-base sm:text-lg font-bold mb-2">No Votes Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start voting for countries to help them qualify for the tournament!
                  </p>
                  <Link
                    href="/qualification"
                    className="inline-block cm-nav-tab px-6 py-3 rounded-sm font-bold uppercase text-sm"
                  >
                    Vote Now
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="lg:hidden divide-y divide-border">
                    {userVotes.map((vote) => {
                      const countryName = getCountryName(vote.country_code)
                      const countryFlag = getCountryFlag(vote.country_code)
                      const date = new Date(vote.created_at)
                      return (
                        <div
                          key={vote.id}
                          className="p-4 flex flex-col gap-2 bg-card/20 hover:bg-secondary/20 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xl shrink-0">{countryFlag}</span>
                              <span className="text-sm font-bold truncate">{countryName}</span>
                            </div>
                            <span className="text-sm font-mono font-bold cm-highlight shrink-0">
                              {vote.vote_count} vote{vote.vote_count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-mono text-accent font-bold">
                              {parseFloat(vote.total_cost_eth).toFixed(4)} ETH
                            </span>
                            <span>
                              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <a
                            href={getExplorerUrl(vote.tx_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:text-accent/80 font-mono truncate"
                          >
                            {vote.tx_hash.slice(0, 8)}...{vote.tx_hash.slice(-6)}
                          </a>
                        </div>
                      )
                    })}
                  </div>
                  {/* Desktop: table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary/30 border-b-2 border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs lg:text-sm font-bold cm-highlight uppercase">
                            Country
                          </th>
                          <th className="px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase">
                            Votes
                          </th>
                          <th className="px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase">
                            ETH Spent
                          </th>
                          <th className="px-4 py-3 text-right text-xs lg:text-sm font-bold cm-highlight uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-center text-xs lg:text-sm font-bold cm-highlight uppercase">
                            Transaction
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userVotes.map((vote, index) => {
                          const countryName = getCountryName(vote.country_code)
                          const countryFlag = getCountryFlag(vote.country_code)
                          const date = new Date(vote.created_at)

                          return (
                            <tr
                              key={vote.id}
                              className={`border-b border-border hover:bg-secondary/20 transition-colors ${
                                index % 2 === 0 ? "bg-card/30" : "bg-card/10"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{countryFlag}</span>
                                  <span className="text-sm lg:text-base font-bold">{countryName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm lg:text-base font-mono font-bold cm-highlight">
                                  {vote.vote_count}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm lg:text-base font-mono text-accent font-bold">
                                  {parseFloat(vote.total_cost_eth).toFixed(4)} ETH
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="text-sm lg:text-base text-muted-foreground">
                                  {date.toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {date.toLocaleTimeString()}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <a
                                  href={getExplorerUrl(vote.tx_hash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs lg:text-sm text-accent hover:text-accent/80 font-mono"
                                >
                                  {vote.tx_hash.slice(0, 6)}...{vote.tx_hash.slice(-4)}
                                </a>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
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
