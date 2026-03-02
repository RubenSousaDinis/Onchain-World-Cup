"use client"

import { useState, useEffect, useMemo, useRef } from "react"

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
}
import { X, TrendingUp, Zap, AlertTriangle, Minus, Plus, Info, Wallet } from "lucide-react"
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi"
import { parseEther, formatEther } from "viem"
import { useQualificationVotePrice } from "@/lib/hooks/use-vote-price"
import { useNotifications } from "@/components/notifications"
import { useSIWEAuth } from "@/lib/hooks/use-siwe-auth"
import { useFarcaster } from "@/lib/farcaster-provider"
import { modal } from "@/lib/reown-config"
import { countryCodeToBytes8 } from "@/lib/contracts/qualification"
import { WORLD_CUP_QUALIFICATION_ABI } from "@/lib/contracts/qualification-abi"
import { useReferral } from "@/hooks/use-referral"
import { zeroAddress } from "viem"
import { ShareModal } from "@/components/share-modal"
import { AchievementUnlockedModal } from "@/components/achievement-unlocked-modal"
import { type ComputedAchievement } from "@/lib/achievements"

interface QualificationVoteModalProps {
  isOpen: boolean
  onClose: () => void
  country: {
    name: string
    flag: string
    code: string
    rank: number
    votes: number
  } | null
  contractAddress?: `0x${string}`
}

export function QualificationVoteModal({ isOpen, onClose, country, contractAddress }: QualificationVoteModalProps) {
  const [voteCount, setVoteCount] = useState(1)
  const [isIndexing, setIsIndexing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // Track if we're processing a vote (confirmed but not indexed yet)
  const [isWaitingForWallet, setIsWaitingForWallet] = useState(false) // Waiting for sign/chain-switch approval in wallet app
  const processedTxRef = useRef<string | null>(null) // Track which tx we're currently processing
  const indexedTxRef = useRef<string | null>(null)
  const hasVotedRef = useRef(false) // Track if user has voted during this modal session
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareData, setShareData] = useState<{votes: number, amount: string, countryCode: string} | null>(null)
  const shareModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [newAchievements, setNewAchievements] = useState<ComputedAchievement[]>([])
  const [votedSuccessfully, setVotedSuccessfully] = useState(false)
  const lastVoteDataRef = useRef<{votes: number, amount: string, countryCode: string} | null>(null)

  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { success, error, info } = useNotifications()
  const { isAuthenticated, login, defaultChainId, defaultChain, switchChain } = useSIWEAuth()
  const { isFrameContext, isAutoConnecting } = useFarcaster()
  const { referrerAddress } = useReferral()

  // Contract interaction hooks
  const { writeContract, data: hash, isPending, isError: isWriteError, error: writeError, reset: resetWrite } = useWriteContract()
  const { isSuccess: isConfirmed, isError: isReceiptError, error: receiptError } = useWaitForTransactionReceipt({
    hash: hash,
    confirmations: 2, // Wait for 2 block confirmations to ensure transaction is propagated
  })

  // Get wallet balance - explicitly query on the current chain
  // Refetch when modal opens to ensure we have fresh balance data
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: chain?.id,
    query: {
      enabled: !!address && !!chain?.id && isOpen, // Only query when modal is open
      refetchInterval: false, // Don't auto-refetch
      staleTime: 0, // Always consider stale to force refetch on modal open
    },
  })

  // Refetch balance when modal opens or chain changes
  useEffect(() => {
    if (isOpen && address && chain?.id) {
      console.log("[Vote Modal] Modal opened - refetching balance for fresh data")
      refetchBalance()
    }
  }, [isOpen, address, chain?.id, refetchBalance])

  // Real-time vote price from contract (if contract address is provided)
  const {
    currentVotes: contractVotes,
    votePrice,
    pricePerVote,
    isLoading: isPriceLoading,
    refetch: refetchVotePrice,
  } = useQualificationVotePrice({
    contractAddress: contractAddress || "0x0000000000000000000000000000000000000000",
    countryCode: country?.code || "",
    voteCount,
    enabled: !!contractAddress && !!country?.code && isOpen,
  })

  // Use mock pricing if no contract address is provided
  const useMockPricing = !contractAddress
  const mockBasePrice = 0.001 // Starting price in ETH
  const mockCurrentPrice = mockBasePrice * (1 + (country?.votes || 0) * 0.0001)
  const mockTotalCost = mockCurrentPrice * voteCount

  // Use real or mock data based on contract availability
  const currentPrice = useMockPricing ? mockCurrentPrice : parseFloat(pricePerVote)
  const totalCost = useMockPricing ? mockTotalCost : parseFloat(votePrice)
  const displayVotes = useMockPricing ? country?.votes || 0 : contractVotes


  // Calculate max votes based on wallet balance with dynamic pricing
  // Price increases with each vote, so we need to calculate iteratively
  const walletBalance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0
  const maxVotesPossible = useMemo(() => {
    if (walletBalance === 0 || useMockPricing) {
      return useMockPricing ? Math.floor(walletBalance / mockCurrentPrice) : 0
    }

    // For real contract pricing, calculate iteratively since price increases per vote
    // BASE_PRICE = 0.001 ETH, PRICE_INCREMENT = 0.0005 ETH
    const BASE_PRICE = 0.001
    const PRICE_INCREMENT = 0.0005
    const currentVotesCount = contractVotes || 0

    let totalCostAccumulated = 0
    let votesAffordable = 0

    // Calculate up to 100 votes (contract limit) or until we run out of balance
    for (let i = 0; i < 100; i++) {
      const votePriceForThisVote = BASE_PRICE + ((currentVotesCount + i) * PRICE_INCREMENT)

      if (totalCostAccumulated + votePriceForThisVote <= walletBalance) {
        totalCostAccumulated += votePriceForThisVote
        votesAffordable++
      } else {
        break
      }
    }

    return votesAffordable
  }, [walletBalance, contractVotes, useMockPricing, mockCurrentPrice])

  // Ensure vote count doesn't exceed max possible
  useEffect(() => {
    if (maxVotesPossible > 0 && voteCount > maxVotesPossible) {
      setVoteCount(maxVotesPossible)
    }
  }, [maxVotesPossible, voteCount])

  // Helper to format ETH values without trailing zeros
  const formatETH = (value: number): string => {
    return parseFloat(value.toFixed(6)).toString()
  }

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setVoteCount(1)
      setIsIndexing(false)
      setIsProcessing(false)
      setIsWaitingForWallet(false)
      // Do NOT null-out processedTxRef / indexedTxRef here.
      // wagmi's hash is still set to the previous tx on the first render after open.
      // Keeping refs pointed at the old hash ensures the dedup guards in the
      // hash-processing and confirmation effects fire correctly and return early,
      // preventing re-indexing and a stale share modal appearing for the new country.
      // The refs will naturally diverge once resetWrite() clears hash and a new
      // transaction is submitted.
      hasVotedRef.current = false
      setNewAchievements([])
      setShareData(null)
      setShowShareModal(false)
      setVotedSuccessfully(false)
      lastVoteDataRef.current = null
      resetWrite()
    } else {
      // Clear any pending share modal timer so it can't fire into the next session
      if (shareModalTimerRef.current) {
        clearTimeout(shareModalTimerRef.current)
        shareModalTimerRef.current = null
      }
      setShareData(null)
      setShowShareModal(false)
      setVotedSuccessfully(false)
    }
  }, [isOpen, resetWrite])

  // Refresh leaderboard when modal closes IF user voted
  useEffect(() => {
    if (!isOpen && hasVotedRef.current) {
      const eventTime = Date.now()
      console.log(`[Vote Modal] ⏱️ Modal closed after voting at ${new Date().toISOString()} - dispatching refresh event`)
      window.dispatchEvent(new CustomEvent("vote-recorded", { detail: { modalClosed: true, timestamp: eventTime } }))
      hasVotedRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending && !isProcessing) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape as any)
    return () => window.removeEventListener("keydown", handleEscape as any)
  }, [isOpen, isPending, isProcessing, onClose])

  // Debug: Log state changes
  useEffect(() => {
    console.log("[Vote Modal] State changed:", {
      isPending,
      isProcessing,
      isIndexing,
      isConfirmed,
      hasHash: !!hash,
      processedTx: processedTxRef.current?.slice(0, 10),
      buttonDisabled: isPending || isProcessing,
    })
  }, [isPending, isProcessing, isIndexing, isConfirmed, hash])

  // Process new transaction hash from writeContract
  // Set isProcessing immediately to keep button disabled
  useEffect(() => {
    if (hash && hash !== processedTxRef.current) {
      console.log("[Vote Modal] New transaction hash:", hash)
      processedTxRef.current = hash
      setIsProcessing(true) // Immediately disable button while waiting for confirmations
      console.log("[Vote Modal] Set isProcessing = true - waiting for confirmations")
    }
  }, [hash])

  // Handle immediate indexing when transaction is confirmed
  useEffect(() => {
    if (!isConfirmed || !hash || !country || !contractAddress || !address || !chain) {
      return
    }

    // Prevent duplicate indexing of the same transaction
    if (indexedTxRef.current === hash) {
      return
    }

    const startTime = Date.now()
    console.log(`[Vote Modal] ⏱️ TIMING START - Transaction confirmed at ${new Date().toISOString()}`)

    indexedTxRef.current = hash
    hasVotedRef.current = true // Mark that user has voted this session
    // isProcessing already set to true when hash was received, no need to set again

    const countryName = country.name
    const votes = voteCount
    const cost = totalCost.toString()

    // Show success notification
    success(
      "Vote Recorded!",
      `Your ${votes} vote${votes !== 1 ? "s" : ""} for ${countryName} ${votes !== 1 ? "have" : "has"} been recorded on-chain`
    )

    // Reset vote count for next vote
    setVoteCount(1)

    // Capture vote data for share modal / achievement modal before resetting state
    lastVoteDataRef.current = { votes, amount: formatETH(parseFloat(cost)), countryCode: country.code }

    // Index in background (don't block UI)
    // Transaction has 2 confirmations at this point, should be visible on RPC nodes
    setIsIndexing(true)
    console.log("[Vote Modal] Transaction confirmed with 2 blocks - starting indexing...")

    const indexingStartTime = Date.now()
    console.log(`[Vote Modal] ⏱️ Starting indexing API call (${indexingStartTime - startTime}ms since confirmation)`)

    fetch("/api/votes/immediate-index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash: hash,
        contractAddress: contractAddress,
        walletAddress: address,
        chainId: chain.id,
        countryCode: country.code,
        voteCount: votes,
        totalCostEth: cost,
        referrerAddress: referrerAddress && referrerAddress !== address ? referrerAddress : null,
        isFarcasterContext: isFrameContext, // Pass Farcaster context to skip session wallet check
      }),
    })
      .then((res) => {
        const fetchEndTime = Date.now()
        console.log(`[Vote Modal] ⏱️ Indexing API responded (took ${fetchEndTime - indexingStartTime}ms)`)
        return res.json()
      })
      .then((data) => {
        const parseEndTime = Date.now()
        console.log(`[Vote Modal] ⏱️ Response parsed (took ${parseEndTime - indexingStartTime}ms total)`)

        if (data.success) {
          console.log("[Vote Modal] Vote indexed successfully")
          console.log(`[Vote Modal] ⏱️ TOTAL TIME: ${Date.now() - startTime}ms from confirmation to indexing complete`)

          // Refetch vote prices and balance to get updated data for next vote
          console.log("[Vote Modal] Refetching vote prices and balance with updated counts...")

          // Wait for both refetches to complete before re-enabling button
          Promise.all([
            refetchVotePrice(),
            refetchBalance(),
          ]).then(() => {
            // Re-enable button for next vote ONLY after balance is updated
            console.log("[Vote Modal] Setting isIndexing = false, isProcessing = false")
            setIsIndexing(false)
            setIsProcessing(false)
            // Note: We DON'T clear processedTxRef here - wagmi will clear hash on next transaction

            console.log("[Vote Modal] Ready for next vote - button should be enabled now")
            setVotedSuccessfully(true)

            // Show achievement modal if any new achievements were unlocked, then share modal
            const unlocked: ComputedAchievement[] = data.newAchievements ?? []
            if (unlocked.length > 0) {
              setNewAchievements(unlocked)
            } else {
              setShareData(lastVoteDataRef.current)
              shareModalTimerRef.current = setTimeout(() => setShowShareModal(true), 300)
            }
          }).catch((err) => {
            console.error("[Vote Modal] Error refetching data:", err)
            // Re-enable anyway even if refetch fails
            setIsIndexing(false)
            setIsProcessing(false)
          })
        } else {
          console.error("[Vote Modal] Indexing failed:", data.error)
          error("Indexing Failed", data.error || "Failed to index vote. It will be indexed by the daily cron job.")
          console.log("[Vote Modal] Indexing failed - resetting state")
          setIsIndexing(false)
          setIsProcessing(false)
          console.log("[Vote Modal] State reset after indexing failure")
        }
      })
      .catch((err) => {
        console.error("Failed to index vote:", err)
        error("Indexing Failed", "Failed to index vote. It will be indexed by the daily cron job.")
        console.log("[Vote Modal] Indexing error - resetting state")
        setIsIndexing(false)
        setIsProcessing(false)
        console.log("[Vote Modal] State reset after indexing error")
      })
  }, [isConfirmed, hash, country, contractAddress, address, chain, voteCount, totalCost, success, error, refetchVotePrice, refetchBalance])  // Include all dependencies

  // Handle write errors
  useEffect(() => {
    if (isWriteError && writeError) {
      console.error("[Vote Modal] Write error:", writeError)
      const errorMessage = writeError.message || "Failed to submit vote transaction"

      // Check for user rejection
      if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
        info("Transaction Cancelled", "You cancelled the transaction")
      } else {
        error("Transaction Failed", errorMessage)
      }

      setIsProcessing(false)
    }
  }, [isWriteError, writeError, error, info])

  // Handle receipt errors (transaction failed on-chain)
  useEffect(() => {
    if (isReceiptError && receiptError && hash) {
      console.error("[Vote Modal] Receipt error:", receiptError)
      error("Transaction Failed", "Transaction failed on blockchain. Please try again.")
      setIsProcessing(false)
      setIsIndexing(false)
    }
  }, [isReceiptError, receiptError, hash, error])

  const handleVote = async () => {
    console.log("[Vote Modal] handleVote called", { isConnected, isAuthenticated, address, chainId: chain?.id, defaultChainId })

    if (voteCount < 1) return

    // Step 1: Check wallet connection
    if (!isConnected) {
      // In Farcaster, wallet should auto-connect. If still connecting, wait.
      if (isFrameContext) {
        if (isAutoConnecting) {
          info("Connecting Wallet", "Wallet is connecting automatically...")
          return
        }
        // Farcaster: use the Farcaster wagmi connector (wraps sdk.wallet.ethProvider)
        const farcasterConnector = connectors.find((c) => c.id === "farcaster")
        if (farcasterConnector) {
          try {
            info("Connecting Wallet", "Connecting via Farcaster wallet...")
            await connect({ connector: farcasterConnector })
            info("Wallet Connected", "Authentication prompt will appear shortly...")
          } catch (err) {
            console.error("Failed to connect Farcaster wallet:", err)
            error("Connection Failed", "Unable to connect wallet. Please try again.")
          }
        }
        return
      }

      // Desktop: open wallet connection modal (supports all wallets)
      try {
        await modal.open()
      } catch (err) {
        console.error("Failed to open wallet modal:", err)
      }
      return
    }

    // Step 2: Check authentication.
    // If not yet authenticated, trigger sign-in. On success we fall through to
    // the chain check immediately — one fewer tap for the user.
    if (!isAuthenticated) {
      console.log("[Vote Modal] Not authenticated — triggering sign-in")
      const mobile = isMobileBrowser()
      if (mobile) {
        info("Signature Required", "Check your wallet app for the sign request, then return here")
      }
      setIsWaitingForWallet(true)
      try {
        await login()
        // login() succeeded — fall through to chain check below
        console.log("[Vote Modal] Sign-in successful, continuing to chain check")
      } catch (err) {
        console.error("[Vote Modal] Sign-in failed:", err)
        const msg = err instanceof Error ? err.message : String(err)
        if (!msg.includes("rejected") && !msg.includes("denied")) {
          error("Sign In Failed", "Please try again")
        } else {
          info("Sign In Cancelled", "Approve the sign request in your wallet to vote")
        }
        return
      } finally {
        setIsWaitingForWallet(false)
      }
    }

    // Step 2.5: Check if user is on the correct chain.
    // This runs whether the user was already authenticated or just signed in above.
    if (chain?.id !== defaultChainId) {
      console.log(`[Vote Modal] Wrong chain (${chain?.id}), switching to ${defaultChainId}`)
      setIsWaitingForWallet(true)
      try {
        info("Switching Network", `Switching to ${defaultChain.name}...`)
        await switchChain({ chainId: defaultChainId })
        success("Network Switched", `Now on ${defaultChain.name}. Click Vote to continue.`)
        // Return so React re-renders with the new chain before the transaction
        return
      } catch (err) {
        console.error("[Vote Modal] Failed to switch chain:", err)
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)
        if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
          error("Network Switch Required", `Please switch your wallet to ${defaultChain.name} to continue`)
        } else {
          error("Network Switch Failed", `Unable to switch to ${defaultChain.name}. ${errorMessage}`)
        }
        return
      } finally {
        setIsWaitingForWallet(false)
      }
    }

    // Step 3: Validate contract address
    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      error(
        "Contract Not Available",
        `The qualification contract is not deployed on ${chain?.name || "this network"} yet. Please try again later or switch to Base Sepolia testnet.`
      )
      return
    }

    // Step 4: Check wallet balance
    if (walletBalance < totalCost) {
      error(
        "Insufficient Balance",
        `You need ${formatETH(totalCost)} ETH but only have ${formatETH(walletBalance)} ETH`
      )
      return
    }

    // Step 5: Double-check balance with a small buffer for gas (safety check)
    const balanceBuffer = 0.0001 // Small buffer for gas costs
    if (walletBalance < totalCost + balanceBuffer) {
      error(
        "Insufficient Balance (including gas)",
        `You need at least ${formatETH(totalCost + balanceBuffer)} ETH (including gas) but only have ${formatETH(walletBalance)} ETH`
      )
      return
    }

    // Step 6: Submit transaction to blockchain
    try {
      console.log("[Vote Modal] Submitting vote transaction")
      console.log("[Vote Modal] Total cost:", totalCost, "ETH, Wallet balance:", walletBalance, "ETH")
      info("Submitting Vote", `Voting for ${country?.name} with ${voteCount} vote${voteCount !== 1 ? "s" : ""}...`)

      writeContract({
        address: contractAddress,
        abi: WORLD_CUP_QUALIFICATION_ABI,
        functionName: "vote",
        args: [countryCodeToBytes8(country?.code || ""), BigInt(voteCount), referrerAddress && referrerAddress !== address ? referrerAddress : zeroAddress],
        value: parseEther(totalCost.toString()),
      })
    } catch (err) {
      console.error("Failed to submit vote:", err)
      error("Vote Failed", "Failed to submit your vote. Please try again.")
    }
  }

  const handleMaxVotes = () => {
    if (maxVotesPossible > 0) {
      setVoteCount(maxVotesPossible)
    }
  }

  const handleShareClose = () => {
    setShowShareModal(false)
    setShareData(null)
    // Keep vote modal open so user can see Vote Again option
  }

  if (!isOpen || !country) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={() => { if (!isPending && !isProcessing) onClose() }}
      >
      <div
        className="relative w-full max-w-lg cm-panel rounded-sm border-2 border-accent/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-secondary/40 p-4 border-b-2 border-accent/30 flex items-center justify-between">
          <h2 className="text-lg font-bold cm-highlight">Vote for Qualification</h2>
          <button
            onClick={onClose}
            disabled={isPending || isProcessing}
            className="p-1 hover:bg-accent/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Close"
            title={isPending || isProcessing ? "Please wait until your transaction is processed" : undefined}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Country Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-sm border border-border">
            <span className="text-5xl">{country.flag}</span>
            <div>
              <h3 className="text-2xl font-bold cm-highlight">{country.name}</h3>
              <p className="text-sm text-muted-foreground">
                Current Rank: <span className="cm-highlight font-bold">#{country.rank}</span>
              </p>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                Total Votes: <span className="text-foreground font-bold">{displayVotes.toLocaleString("en-US")}</span>
                {!useMockPricing && !isPriceLoading && <span className="text-accent ml-1">●</span>}
              </p>
            </div>
          </div>

          {/* Wallet Balance & Network */}
          {isConnected && balanceData && (
            <div className="bg-secondary/20 border border-border rounded-sm p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Wallet Balance:</span>
                </div>
                <span className="font-bold cm-highlight">{formatETH(walletBalance)} ETH</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Network: <span className="text-accent font-semibold">{chain?.name || "Unknown"}</span>
              </div>
            </div>
          )}

          {/* Vote Count Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold cm-highlight">Number of Votes</label>
              {isConnected && maxVotesPossible > 0 && (
                <span className={`text-xs ${voteCount >= maxVotesPossible ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                  Max: {maxVotesPossible.toLocaleString("en-US")} votes
                  {voteCount >= maxVotesPossible && ' (reached)'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
                className="cm-nav-tab w-10 h-10 flex items-center justify-center font-bold"
                disabled={voteCount <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={voteCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  const capped = maxVotesPossible > 0 ? Math.min(maxVotesPossible, Math.max(1, value)) : Math.max(1, value)
                  setVoteCount(capped)
                }}
                className="flex-1 bg-input border border-border rounded-sm px-4 py-2 text-center text-lg font-bold cm-highlight"
                min="1"
                max={maxVotesPossible > 0 ? maxVotesPossible : undefined}
              />
              <button
                onClick={() => setVoteCount(voteCount + 1)}
                className="cm-nav-tab w-10 h-10 flex items-center justify-center font-bold"
                disabled={maxVotesPossible > 0 && voteCount >= maxVotesPossible}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              {[1, 5, 10, 25].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setVoteCount(Math.min(maxVotesPossible || amount, amount))}
                  className="flex-1 cm-nav-tab py-1.5 text-xs lg:text-sm font-bold"
                  disabled={maxVotesPossible > 0 && amount > maxVotesPossible}
                >
                  {amount}
                </button>
              ))}
              {isConnected && maxVotesPossible > 0 && (
                <button
                  onClick={handleMaxVotes}
                  className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 py-1.5 text-xs lg:text-sm font-bold rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={voteCount >= maxVotesPossible}
                  title={`Maximum affordable votes: ${maxVotesPossible}`}
                >
                  MAX ({maxVotesPossible})
                </button>
              )}
            </div>
          </div>

          {/* Price Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="cm-highlight">Total Cost:</span>
              <span className="text-accent">
                {isPriceLoading && !useMockPricing ? "..." : `${formatETH(totalCost)} ETH`}
              </span>
            </div>
            {useMockPricing && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-sm p-2">
                <p className="text-xs text-yellow-500">
                  ⚠️ Contract not deployed on {chain?.name || "this network"}. Prices are estimates only.
                </p>
              </div>
            )}
            {isConnected && maxVotesPossible > 0 && totalCost > walletBalance && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-2">
                <p className="text-xs text-destructive">
                  ⚠️ Insufficient balance. You can afford up to {maxVotesPossible} vote{maxVotesPossible !== 1 ? 's' : ''} ({formatETH(walletBalance)} ETH available).
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-secondary/20 border border-accent/30 rounded-sm p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="text-xs lg:text-sm text-muted-foreground space-y-1">
                <p><Zap className="w-3 h-3 inline text-accent" /> <strong>Early voters get better prices</strong> - Price increases with each vote</p>
                <p><TrendingUp className="w-3 h-3 inline text-green-500" /> Help {country.name} qualify for the tournament!</p>
                <p><AlertTriangle className="w-3 h-3 inline text-yellow-500" /> Top 48 countries qualify</p>
              </div>
            </div>
          </div>

          {/* Wallet & Auth Status */}
          {!isConnected && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 text-center">
              <p className="text-sm text-destructive-foreground">
                Connect your wallet to vote
              </p>
            </div>
          )}

          {isConnected && !isAuthenticated && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-sm p-3 text-center">
              <p className="text-sm text-yellow-500">
                Tap &ldquo;Vote&rdquo; below to sign in and vote — you&apos;ll be prompted in your wallet app
              </p>
            </div>
          )}

          {/* Wrong network warning — shown as soon as the wallet is connected on the wrong chain */}
          {isConnected && chain?.id !== defaultChainId && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-sm p-3">
              <p className="text-sm font-bold text-orange-500">Wrong Network</p>
              <p className="text-xs text-orange-400 mt-1">
                Your wallet is on <strong>{chain?.name || "an unsupported network"}</strong>.
                You need <strong>{defaultChain.name}</strong> to vote.
              </p>
              <button
                onClick={async () => {
                  setIsWaitingForWallet(true)
                  try {
                    info("Switching Network", `Switching to ${defaultChain.name}...`)
                    await switchChain({ chainId: defaultChainId })
                    success("Network Switched", `Now on ${defaultChain.name}. Click Vote to continue.`)
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err)
                    if (!msg.includes("rejected") && !msg.includes("denied")) {
                      error("Switch Failed", `Unable to switch to ${defaultChain.name}`)
                    }
                  } finally {
                    setIsWaitingForWallet(false)
                  }
                }}
                disabled={isWaitingForWallet}
                className="mt-2 px-3 py-1.5 text-xs font-bold bg-orange-500 text-white rounded-sm disabled:opacity-50 hover:bg-orange-600 transition-colors"
              >
                {isWaitingForWallet ? "Switching..." : `Switch to ${defaultChain.name}`}
              </button>
            </div>
          )}

          {address && isAuthenticated && chain?.id === defaultChainId && (
            <div className="text-xs lg:text-sm text-muted-foreground text-center">
              Voting from: {address.slice(0, 6)}...{address.slice(-4)} <span className="text-green-500">✓ Authenticated</span>
            </div>
          )}

          {/* Action Buttons */}
          {votedSuccessfully ? (
            <div className="space-y-3 pt-2">
              <div className="bg-green-500/10 border border-green-500/30 rounded-sm p-3 text-center">
                <p className="text-sm font-bold text-green-500">✓ Vote for {country.name} recorded!</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 cm-nav-tab py-3 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setVotedSuccessfully(false)
                    setVoteCount(1)
                    resetWrite()
                  }}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-3 rounded-sm transition-all"
                >
                  Vote Again
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 cm-nav-tab py-3 font-bold"
                disabled={isPending || isProcessing}
              >
                Close
              </button>
              <button
                onClick={handleVote}
                disabled={isPending || isProcessing || isWaitingForWallet || isAutoConnecting || voteCount < 1 || (!useMockPricing && totalCost <= 0) || (isConnected && maxVotesPossible > 0 && totalCost > walletBalance)}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-3 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending
                  ? "Confirming..."
                  : isProcessing
                  ? isIndexing ? "Indexing..." : "Processing..."
                  : isWaitingForWallet
                  ? "Open wallet app..."
                  : isAutoConnecting
                  ? "Connecting Wallet..."
                  : !isConnected
                  ? "Connect Wallet"
                  : !isAuthenticated
                  ? "Sign In to Vote"
                  : chain?.id !== defaultChainId
                  ? `Switch to ${defaultChain.name}`
                  : (isConnected && maxVotesPossible > 0 && totalCost > walletBalance)
                  ? "Insufficient Balance"
                  : (!useMockPricing && totalCost <= 0)
                  ? "Loading price..."
                  : `Vote ${formatETH(totalCost)} ETH`}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Achievement Unlocked Modal - shows when new achievements are earned */}
      {newAchievements.length > 0 && (
        <AchievementUnlockedModal
          achievements={newAchievements}
          onClose={() => {
            setNewAchievements([])
            // After dismissing achievements, show share modal with captured vote data
            setShareData(lastVoteDataRef.current)
            shareModalTimerRef.current = setTimeout(() => setShowShareModal(true), 200)
          }}
        />
      )}

      {/* Share Modal - shows after successful vote */}
      {shareData && shareData.countryCode === country?.code && (
        <ShareModal
          isOpen={showShareModal}
          onClose={handleShareClose}
          type="country"
          data={{
            country: country.name,
            countryCode: country.code.toLowerCase(),
            countryFlag: country.flag,
            votes: shareData.votes,
            amount: shareData.amount,
          }}
        />
      )}
    </>
  )
}
