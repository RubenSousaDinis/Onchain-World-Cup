"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { Link2, Copy, Check, ExternalLink, Share2 } from "lucide-react"
import { useAccount, useChainId } from "wagmi"
import { useState, useEffect, useRef } from "react"
import { baseSepolia } from "wagmi/chains"
import { InlineLoader } from "@/components/states"

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

function formatEth(val: string | number) {
  const n = typeof val === "string" ? parseFloat(val) : val
  if (isNaN(n)) return "0"
  return parseFloat(n.toFixed(6)).toString()
}

export default function ReferralsPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [copied, setCopied] = useState(false)
  const [data, setData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isFetchingRef = useRef(false)

  const getExplorerUrl = (txHash: string) => {
    const base = chainId === baseSepolia.id ? "https://sepolia.basescan.org" : "https://basescan.org"
    return `${base}/tx/${txHash}`
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
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleShareFarcaster = () => {
    const text = `${shareText}\n\n${referralLink}`
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const loadMore = async () => {
    if (!address || !data?.hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const nextPage = data.page + 1
      const res = await fetch(`/api/referrals?address=${address}&page=${nextPage}`)
      if (res.ok) {
        const next: ReferralData = await res.json()
        setData((prev) =>
          prev
            ? { ...next, referrals: [...prev.referrals, ...next.referrals] }
            : next
        )
      }
    } catch (err) {
      console.error("[Referrals] load more error:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!address || isFetchingRef.current) return
      isFetchingRef.current = true
      setIsLoading(true)
      try {
        const res = await fetch(`/api/referrals?address=${address}&page=1`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch (err) {
        console.error("[Referrals] fetch error:", err)
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
      }
    }

    if (isConnected && address) {
      fetchData()
    } else {
      setData(null)
    }
  }, [address, isConnected])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RetroSidebar />
      <MobileNav />

      <main className="lg:ml-24 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
          {/* Header */}
          <div className="cm-panel p-4 lg:p-6 border-2 border-accent/30">
            <div className="flex items-center gap-3 mb-1">
              <Link2 className="w-6 h-6 text-accent" />
              <h1 className="text-xl lg:text-2xl font-bold cm-highlight">Referrals</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Share your link — earn 1% of every ETH vote made by people you refer. Comes from the platform fee, so voters and winners are unaffected.
            </p>
          </div>

          {!isConnected ? (
            <div className="cm-panel p-8 border border-border text-center space-y-4">
              <p className="text-muted-foreground">Connect your wallet to get your referral link and track earnings.</p>
              <WalletConnectButton />
            </div>
          ) : (
            <>
              {/* Referral Link */}
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
                    {/* X (Twitter) logo */}
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
                    {/* Farcaster logo */}
                    <svg width="12" height="12" viewBox="0 0 1000 1000" fill="currentColor">
                      <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
                      <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
                      <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.939 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
                    </svg>
                    Farcaster
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  When someone votes after following your link, you earn 1% of their vote cost automatically on-chain.
                </p>
              </div>

              {/* Stats */}
              {isLoading ? (
                <InlineLoader text="Loading referral stats..." />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="cm-panel p-4 border border-border text-center">
                    <div className="text-2xl lg:text-3xl font-bold cm-highlight">
                      {data ? formatEth(data.totalEarnedEth) : "0"} ETH
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Total Earned</div>
                  </div>
                  <div className="cm-panel p-4 border border-border text-center">
                    <div className="text-2xl lg:text-3xl font-bold cm-highlight">
                      {data?.totalReferrals ?? 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Votes Referred</div>
                  </div>
                </div>
              )}

              {/* Activity Table */}
              {!isLoading && data && data.referrals.length > 0 && (
                <div className="cm-panel border border-border overflow-hidden">
                  <div className="bg-secondary/40 px-4 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-bold cm-highlight uppercase tracking-wide">Activity</h2>
                    <span className="text-xs text-muted-foreground">{data.referrals.length} of {data.totalReferrals}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                          <th className="px-4 py-2 text-left">Referred</th>
                          <th className="px-4 py-2 text-right">Vote Cost</th>
                          <th className="px-4 py-2 text-right">Your Cut</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.referrals.map((r) => (
                          <tr key={r.txHash} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs">{truncateAddress(r.referredAddress)}</td>
                            <td className="px-4 py-3 text-right">{formatEth(r.voteAmountEth)} ETH</td>
                            <td className="px-4 py-3 text-right text-green-500 font-bold">+{formatEth(r.referralAmountEth)} ETH</td>
                            <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{r.contractType}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
                  {data.hasMore && (
                    <div className="px-4 py-3 border-t border-border text-center">
                      <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="text-sm text-accent hover:text-accent/80 font-bold transition-colors disabled:opacity-50"
                      >
                        {isLoadingMore ? "Loading..." : "Load more"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && data && data.referrals.length === 0 && (
                <div className="cm-panel p-8 border border-border text-center">
                  <p className="text-muted-foreground text-sm">No referrals yet. Share your link to start earning!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
