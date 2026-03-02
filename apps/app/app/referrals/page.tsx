"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { Link2, Copy, Check, ExternalLink } from "lucide-react"
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
  const isFetchingRef = useRef(false)

  const getExplorerUrl = (txHash: string) => {
    const base = chainId === baseSepolia.id ? "https://sepolia.basescan.org" : "https://basescan.org"
    return `${base}/tx/${txHash}`
  }

  const referralLink =
    typeof window !== "undefined" && address
      ? `${window.location.origin}?ref=${address}`
      : ""

  const handleCopy = async () => {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!address || isFetchingRef.current) return
      isFetchingRef.current = true
      setIsLoading(true)
      try {
        const res = await fetch(`/api/referrals?address=${address}`)
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
                <p className="text-xs text-muted-foreground">
                  Share this link. When someone votes after following it, you earn 1% of their vote cost automatically on-chain.
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
                  <div className="bg-secondary/40 px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-bold cm-highlight uppercase tracking-wide">Activity</h2>
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
