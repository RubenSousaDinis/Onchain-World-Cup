"use client"

import { useState, useEffect } from "react"
import { formatEth } from "@/lib/utils"
import { useChainId, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"
import { Clock, CheckCircle, Trophy, Loader2, AlertCircle } from "lucide-react"
import {
  useClaimable,
  useHasClaimed,
  useQualificationFinalized,
  useQualificationEndTime,
  useClaim,
  isQualificationContractAvailable,
} from "@/lib/contracts/qualification"
import { useNotifications } from "@/components/notifications"
import type { Address } from "viem"

interface ClaimSectionProps {
  address: Address | undefined
  totalVotes: number
}

function useCountdown(endTimestamp: bigint | undefined) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isEnded: boolean
  } | null>(null)

  useEffect(() => {
    if (!endTimestamp) return

    const endMs = Number(endTimestamp) * 1000

    const tick = () => {
      const now = Date.now()
      const diff = endMs - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true })
        return
      }
      const totalSecs = Math.floor(diff / 1000)
      setTimeLeft({
        days: Math.floor(totalSecs / 86400),
        hours: Math.floor((totalSecs % 86400) / 3600),
        minutes: Math.floor((totalSecs % 3600) / 60),
        seconds: totalSecs % 60,
        isEnded: false,
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endTimestamp])

  return timeLeft
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold font-mono cm-highlight tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs text-muted-foreground uppercase">{label}</div>
    </div>
  )
}

export function ClaimSection({ address, totalVotes }: ClaimSectionProps) {
  const chainId = useChainId()
  const { success, error: notifyError } = useNotifications()
  const [hasClaimed, setHasClaimed] = useState(false)

  const contractAvailable = isQualificationContractAvailable(chainId)

  const { data: claimableWei, isLoading: isLoadingClaimable, refetch: refetchClaimable } = useClaimable(chainId, address)
  const { data: hasClaimedOnChain, isLoading: isLoadingHasClaimed, refetch: refetchHasClaimed } = useHasClaimed(chainId, address)
  const { data: isFinalized, isLoading: isLoadingFinalized } = useQualificationFinalized(chainId)
  const { data: endTimeRaw, isLoading: isLoadingEndTime } = useQualificationEndTime(chainId)

  const countdown = useCountdown(endTimeRaw)
  const { claim, hash, isPending } = useClaim()

  const { isSuccess: isTxConfirmed, isError: isTxError } = useWaitForTransactionReceipt({
    hash,
    confirmations: 2,
  })

  // Sync on-chain hasClaimed state and handle local optimistic update
  useEffect(() => {
    if (hasClaimedOnChain) {
      setHasClaimed(true)
    }
  }, [hasClaimedOnChain])

  // Handle tx confirmation
  useEffect(() => {
    if (isTxConfirmed && hash) {
      success("Winnings Claimed!", "Your ETH has been sent to your wallet.")
      setHasClaimed(true)
      refetchClaimable()
      refetchHasClaimed()
    }
  }, [isTxConfirmed, hash]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isTxError && hash) {
      notifyError("Claim Failed", "Transaction failed. Please try again.")
    }
  }, [isTxError, hash]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClaim = async () => {
    try {
      await claim(chainId)
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || "Unknown error"
      notifyError("Claim Failed", msg)
    }
  }

  // Don't render if no votes or contract not available
  if (!contractAvailable || !address || totalVotes === 0) return null

  const isLoading = isLoadingClaimable || isLoadingHasClaimed || isLoadingFinalized || isLoadingEndTime

  if (isLoading) {
    return (
      <div className="cm-panel rounded-sm p-4 mb-6 lg:mb-8 flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>Loading claim status...</span>
      </div>
    )
  }

  const claimableEth = claimableWei ? parseFloat(formatEther(claimableWei)) : 0
  const qualificationEnded = countdown?.isEnded ?? false

  // ── Already claimed ──────────────────────────────────────────────────────
  if (hasClaimed) {
    return (
      <div className="cm-panel rounded-sm p-4 mb-6 lg:mb-8 border-l-4 border-green-500 bg-green-500/5">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-400">Winnings Claimed</p>
            <p className="text-xs text-muted-foreground">Your ETH has been sent to your wallet.</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Qualification still active — show countdown ───────────────────────────
  if (!qualificationEnded) {
    return (
      <div className="cm-panel rounded-sm p-4 lg:p-5 mb-6 lg:mb-8 border-l-4 border-muted">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase">Claim Earnings</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Claims open after qualification ends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {countdown && !countdown.isEnded && (
              <div className="flex items-center gap-3">
                <CountdownUnit value={countdown.days} label="days" />
                <span className="text-muted-foreground font-bold text-lg">:</span>
                <CountdownUnit value={countdown.hours} label="hrs" />
                <span className="text-muted-foreground font-bold text-lg">:</span>
                <CountdownUnit value={countdown.minutes} label="min" />
                <span className="text-muted-foreground font-bold text-lg">:</span>
                <CountdownUnit value={countdown.seconds} label="sec" />
              </div>
            )}
            <button
              disabled
              className="cm-nav-tab px-5 py-2.5 rounded-sm font-bold uppercase text-sm opacity-40 cursor-not-allowed whitespace-nowrap"
            >
              Claim ETH
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Qualification ended but not yet finalized ─────────────────────────────
  if (!isFinalized) {
    return (
      <div className="cm-panel rounded-sm p-4 lg:p-5 mb-6 lg:mb-8 border-l-4 border-accent/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent/70 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase">Awaiting Finalization</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Qualification has ended. Top 48 countries are being finalized on-chain.
              </p>
            </div>
          </div>
          <button
            disabled
            className="cm-nav-tab px-5 py-2.5 rounded-sm font-bold uppercase text-sm opacity-40 cursor-not-allowed whitespace-nowrap"
          >
            Claim ETH
          </button>
        </div>
      </div>
    )
  }

  // ── Finalized — no winnings ───────────────────────────────────────────────
  if (claimableEth === 0) {
    return (
      <div className="cm-panel rounded-sm p-4 mb-6 lg:mb-8 border-l-4 border-muted">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-bold uppercase">No Winnings</p>
            <p className="text-xs text-muted-foreground">
              None of your voted countries made the top 48.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Finalized — claimable ─────────────────────────────────────────────────
  const isBusy = isPending || (!!hash && !isTxConfirmed && !isTxError)

  return (
    <div className="cm-panel rounded-sm p-4 lg:p-5 mb-6 lg:mb-8 border-l-4 border-green-500 bg-green-500/5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-400 uppercase">You Have Winnings!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your voted countries qualified. Claim your share of the prize pool.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-green-400">
              {formatEth(claimableEth)} ETH
            </div>
            <div className="text-xs text-muted-foreground">claimable</div>
          </div>
          <button
            onClick={handleClaim}
            disabled={isBusy}
            className="cm-nav-tab px-5 py-2.5 rounded-sm font-bold uppercase text-sm disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isPending ? "Confirm in wallet..." : "Claiming..."}
              </>
            ) : (
              "Claim ETH"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
