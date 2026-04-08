"use client"

import { Suspense } from "react"
import { formatEth } from "@/lib/utils"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Trophy, Copy, Check, ExternalLink, Share2, LogOut } from "lucide-react"
import { useAccount, useChainId, useDisconnect } from "wagmi"
import { useSearchParams, useRouter } from "next/navigation"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { UserMilestones } from "@/components/user-milestones"
import { ShareModal } from "@/components/share-modal"
import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { NoVotesEmpty, InlineLoader } from "@/components/states"
import { DisconnectConfirmModal } from "@/components/disconnect-confirm-modal"
import { ClaimSection } from "@/components/claim-section"
import { RetroNavTabs } from "@/components/retro-nav-tabs"
import { getCountryName, getCountryFlag } from "@/lib/countries"
import Link from "next/link"
import { base } from "wagmi/chains"
import { useClaimable, isQualificationContractAvailable } from "@/lib/contracts/qualification"
import { useProjectedEarnings } from "@/hooks/use-projected-earnings"
import { formatEther } from "viem"

type Tab = "votes" | "referrals"

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
  referral_count: number
}

type ReferralEntry = {
  referredAddress: string
  voteAmountEth: string
  referralAmountEth: string
  contractType: string
  txHash: string
  createdAt: string
}

type ReferralData = {
  totalEarnedEth: string
  totalReferrals: number
  hasMore: boolean
  page: number
  referrals: ReferralEntry[]
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}


function MyBetsContent() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = (searchParams.get("tab") as Tab) || "votes"

  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<any | null>(null)

  // Share the TanStack Query cache with useAchievements (UserMilestones) and
  // useOnboarding so all three resolve from a single HTTP request on mount.
  // staleTime: 0 ensures the profile page always sees fresh data on revisit.
  const { data: profileData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user-stats", address ?? ""] as const,
    queryFn: () => api.get<{ data: any }>(`/users/${address}`),
    enabled: isConnected && !!address,
    staleTime: 0,
    refetchOnMount: true,
  })
  const userStats: UserStats | null = profileData?.data ?? null
  const userVotes: UserVote[] = profileData?.data?.votes ?? []

  // Referrals state
  const [copied, setCopied] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const referralsFetchedRef = useRef(false)

  const setTab = (tab: Tab) => {
    router.replace(`/profile?tab=${tab}`, { scroll: false })
  }

  const getExplorerUrl = (txHash: string) => {
    return `https://basescan.org/tx/${txHash}`
  }

  // Fetch referrals when tab is active (lazy, once per session)
  useEffect(() => {
    const fetchReferrals = async () => {
      if (!address || referralsFetchedRef.current) return
      referralsFetchedRef.current = true
      setIsLoadingReferrals(true)
      try {
        const res = await fetch(`/api/referrals?address=${address}&page=1`)
        if (res.ok) setReferralData(await res.json())
      } catch (err) {
        console.error("[Referrals] fetch error:", err)
      } finally {
        setIsLoadingReferrals(false)
      }
    }
    if (isConnected && address && activeTab === "referrals") {
      fetchReferrals()
    }
  }, [address, isConnected, activeTab])

  const loadMoreReferrals = async () => {
    if (!address || !referralData?.hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/referrals?address=${address}&page=${referralData.page + 1}`)
      if (res.ok) {
        const next: ReferralData = await res.json()
        setReferralData((prev) =>
          prev ? { ...next, referrals: [...prev.referrals, ...next.referrals] } : next
        )
      }
    } catch (err) {
      console.error("[Referrals] load more error:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const referralLink =
    typeof window !== "undefined" && address
      ? `${window.location.origin}/r/${address}`
      : ""

  const handleCopy = async () => {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareText = "Join me on Onchain World Cup — back your country with ETH and share the prize pool! 🌍⚽"
  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }
  const handleShareFarcaster = () => {
    window.open(
      `https://farcaster.xyz/~/compose?text=${encodeURIComponent(`${shareText}\n\n${referralLink}`)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  // Earnings
  const totalVotes = userStats?.qualification_votes || 0
  const totalSpent = parseFloat(userStats?.qualification_spent_eth || "0")
  const countriesVoted = userStats?.countries_voted_for || 0
  const isContractAvailable = isQualificationContractAvailable(chainId)
  const { data: claimableWei, isLoading: isLoadingClaimable } = useClaimable(chainId, address)
  const { projectedEarnings, isLoading: isLoadingProjected } = useProjectedEarnings(address, userVotes)
  const actualEarnings = claimableWei ? parseFloat(formatEther(claimableWei)) : 0
  const currentEarnings = actualEarnings > 0 ? actualEarnings : projectedEarnings
  const isProjected = actualEarnings === 0 && projectedEarnings > 0

  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 min-w-0">

        {/* Header */}
        <div className="cm-panel rounded-sm overflow-hidden mb-6">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-1">
              <span className="cm-highlight">My Profile</span>
            </h1>
            <p className="text-sm text-foreground/80">
              Track your votes, referrals, and earnings
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="cm-panel rounded-sm p-8 text-center space-y-4 border-2 border-accent bg-accent/10">
            <p className="text-sm font-bold text-accent">Login to view your profile</p>
            <WalletConnectButton />
          </div>
        ) : isLoadingUser ? (
          <div className="cm-panel rounded-sm p-8 text-center">
            <InlineLoader text="Loading your profile..." />
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-primary">
                <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">Total Votes</div>
                <div className="text-lg lg:text-2xl font-bold cm-highlight font-mono">{totalVotes}</div>
                <div className="text-xs text-muted-foreground">votes placed</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-purple-500">
                <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">ETH Spent</div>
                <div className="text-lg lg:text-2xl font-bold text-purple-400 font-mono">{formatEth(totalSpent)}</div>
                <div className="text-xs text-muted-foreground">ETH total</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-accent">
                <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">Countries</div>
                <div className="text-lg lg:text-2xl font-bold text-accent font-mono">{countriesVoted}</div>
                <div className="text-xs text-muted-foreground">countries voted</div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-green-500">
                <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">
                  {isProjected ? "Projected" : "Earnings"}
                </div>
                <div className="text-lg lg:text-2xl font-bold text-green-400 font-mono">
                  {isLoadingClaimable || isLoadingProjected ? (
                    <span className="text-sm">...</span>
                  ) : currentEarnings > 0 ? (
                    formatEth(currentEarnings)
                  ) : !isContractAvailable ? (
                    <span className="text-sm">N/A</span>
                  ) : (
                    "0"
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLoadingClaimable || isLoadingProjected
                    ? "calculating..."
                    : currentEarnings > 0
                    ? isProjected
                      ? "top 48"
                      : "claimable"
                    : !isContractAvailable
                    ? "switch chain"
                    : "no earnings"}
                </div>
              </div>
              <div className="cm-panel rounded-sm p-3 lg:p-4 bg-secondary/20 border-l-4 border-orange-500">
                <div className="text-xs text-foreground/70 mb-1 uppercase font-bold">Referrals</div>
                <div className="text-lg lg:text-2xl font-bold text-orange-400 font-mono">
                  {userStats?.referral_count ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">votes referred</div>
              </div>
            </div>

            {/* Tabs */}
            <RetroNavTabs
              tabs={[
                { label: "Votes", value: "votes" },
                { label: "Referrals", value: "referrals" },
              ]}
              activeTab={activeTab}
              onTabChange={(tab) => setTab(tab as Tab)}
            />

            {/* ── VOTES TAB ── */}
            {activeTab === "votes" && (
              <>
                <ClaimSection address={address} totalVotes={totalVotes} />

                <div className="mb-6 lg:mb-8">
                  <UserMilestones address={address} />
                </div>

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
                                <Link
                                  href={`/qualification/${vote.country_code.toLowerCase()}`}
                                  className="flex items-center gap-2 min-w-0 hover:text-accent transition-colors"
                                >
                                  <span className="text-xl shrink-0">{countryFlag}</span>
                                  <span className="text-sm font-bold truncate">{countryName}</span>
                                </Link>
                                <span className="text-sm font-mono font-bold cm-highlight shrink-0">
                                  {vote.vote_count} vote{vote.vote_count !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="font-mono text-accent font-bold">
                                  {formatEth(vote.total_cost_eth)} ETH
                                </span>
                                <span>
                                  {date.toLocaleDateString()}{" "}
                                  {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                              <th className="px-4 py-3 text-left text-xs font-bold cm-highlight uppercase">Country</th>
                              <th className="px-4 py-3 text-right text-xs font-bold cm-highlight uppercase">Votes</th>
                              <th className="px-4 py-3 text-right text-xs font-bold cm-highlight uppercase">ETH Spent</th>
                              <th className="px-4 py-3 text-right text-xs font-bold cm-highlight uppercase">Date</th>
                              <th className="px-4 py-3 text-center text-xs font-bold cm-highlight uppercase">Tx</th>
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
                                    <Link
                                      href={`/qualification/${vote.country_code.toLowerCase()}`}
                                      className="flex items-center gap-2 hover:text-accent transition-colors"
                                    >
                                      <span className="text-2xl">{countryFlag}</span>
                                      <span className="text-sm font-bold">{countryName}</span>
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold cm-highlight text-sm">
                                    {vote.vote_count}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono text-accent font-bold text-sm">
                                    {formatEth(vote.total_cost_eth)} ETH
                                  </td>
                                  <td className="px-4 py-3 text-right text-muted-foreground text-sm">
                                    <div>{date.toLocaleDateString()}</div>
                                    <div className="text-xs">{date.toLocaleTimeString()}</div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <a
                                      href={getExplorerUrl(vote.tx_hash)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-accent hover:text-accent/80 font-mono"
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

            {/* ── REFERRALS TAB ── */}
            {activeTab === "referrals" && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Share your link — earn 1% of every ETH vote made by people you refer. Comes from the platform fee, so voters and winners are unaffected.
                </p>

                {/* Referral link */}
                <div className="cm-panel p-4 lg:p-6 border border-border space-y-3">
                  <h2 className="text-sm font-bold cm-highlight uppercase tracking-wide">Your Referral Link</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-input border border-border rounded-sm px-3 py-2 text-sm font-mono truncate text-muted-foreground">
                      {referralLink || "Loading..."}
                    </div>
                    <button
                      onClick={handleCopy}
                      disabled={!referralLink}
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-bold text-sm rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Share on:</span>
                    <button
                      onClick={handleShareTwitter}
                      disabled={!referralLink}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-black text-white rounded-sm hover:bg-black/80 transition-colors disabled:opacity-50"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X / Twitter
                    </button>
                    <button
                      onClick={handleShareFarcaster}
                      disabled={!referralLink}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#7c3aed] text-white rounded-sm hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
                    >
                      <svg width="12" height="12" viewBox="0 0 1000 1000" fill="currentColor">
                        <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
                        <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
                        <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.939 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
                      </svg>
                      Farcaster
                    </button>
                  </div>
                </div>

                {/* Referral stats */}
                {isLoadingReferrals ? (
                  <InlineLoader text="Loading referral stats..." />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="cm-panel p-4 border border-border text-center">
                      <div className="text-2xl lg:text-3xl font-bold cm-highlight">
                        {referralData ? formatEth(referralData.totalEarnedEth) : "0"} ETH
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Total Earned</div>
                    </div>
                    <div className="cm-panel p-4 border border-border text-center">
                      <div className="text-2xl lg:text-3xl font-bold cm-highlight">
                        {referralData?.totalReferrals ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Votes Referred</div>
                    </div>
                  </div>
                )}

                {/* Activity table */}
                {!isLoadingReferrals && referralData && referralData.referrals.length > 0 && (
                  <div className="cm-panel border border-border overflow-hidden">
                    <div className="bg-secondary/40 px-4 py-3 border-b border-border flex items-center justify-between">
                      <h2 className="text-sm font-bold cm-highlight uppercase tracking-wide">Activity</h2>
                      <span className="text-xs text-muted-foreground">
                        {referralData.referrals.length} of {referralData.totalReferrals}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                            <th className="px-4 py-2 text-left">Referred</th>
                            <th className="px-4 py-2 text-right">Vote Cost</th>
                            <th className="px-4 py-2 text-right">Your Cut</th>
                            <th className="px-4 py-2 text-left hidden sm:table-cell">Type</th>
                            <th className="px-4 py-2 text-left hidden sm:table-cell">Date</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralData.referrals.map((r) => (
                            <tr
                              key={r.txHash}
                              className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono text-xs">{truncateAddress(r.referredAddress)}</td>
                              <td className="px-4 py-3 text-right text-xs">{formatEth(r.voteAmountEth)} ETH</td>
                              <td className="px-4 py-3 text-right text-green-500 font-bold text-xs">
                                +{formatEth(r.referralAmountEth)} ETH
                              </td>
                              <td className="px-4 py-3 text-xs capitalize text-muted-foreground hidden sm:table-cell">
                                {r.contractType}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                                {new Date(r.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3">
                                <a
                                  href={getExplorerUrl(r.txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:text-accent/80 transition-colors"
                                  aria-label="View on Basescan"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {referralData.hasMore && (
                      <div className="px-4 py-3 border-t border-border text-center">
                        <button
                          onClick={loadMoreReferrals}
                          disabled={isLoadingMore}
                          className="text-sm text-accent hover:text-accent/80 font-bold transition-colors disabled:opacity-50"
                        >
                          {isLoadingMore ? "Loading..." : "Load more"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!isLoadingReferrals && referralData && referralData.referrals.length === 0 && (
                  <div className="cm-panel p-8 border border-border text-center">
                    <p className="text-muted-foreground text-sm">No referrals yet. Share your link to start earning!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Logout */}
        {isConnected && (
          <div className="mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setShowDisconnectConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        )}
      </main>

      <DisconnectConfirmModal
        isOpen={showDisconnectConfirm}
        onConfirm={() => { disconnect(); setShowDisconnectConfirm(false) }}
        onCancel={() => setShowDisconnectConfirm(false)}
      />

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

export default function MyBetsPage() {
  return (
    <Suspense fallback={null}>
      <MyBetsContent />
    </Suspense>
  )
}
