"use client"

import { useReadContract, useWatchContractEvent } from "wagmi"
import { formatEther, parseEther } from "viem"
import { WORLD_CUP_QUALIFICATION_ABI } from "../contracts/qualification-abi"
import { WORLD_CUP_MATCH_ABI } from "../contracts/match-abi"
import { countryCodeToBytes8 } from "../contracts/qualification"
import { useEffect, useState } from "react"

interface UseQualificationVotePriceOptions {
  contractAddress: `0x${string}`
  countryCode: string
  voteCount?: number
  enabled?: boolean
}

interface UseMatchVotePriceOptions {
  contractAddress: `0x${string}`
  voteCount?: number
  enabled?: boolean
}

/**
 * Hook for tracking real-time vote prices for qualification voting
 * Automatically updates when new votes are placed
 */
export function useQualificationVotePrice({
  contractAddress,
  countryCode,
  voteCount = 1,
  enabled = true,
}: UseQualificationVotePriceOptions) {
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Convert country code to bytes8 format
  const countryCodeBytes = countryCode ? countryCodeToBytes8(countryCode) : "0x0000000000000000"

  // Get current vote count for the country
  const { data: currentVotes, refetch: refetchVotes } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "countryVotes",
    args: [countryCodeBytes],
    query: {
      enabled: enabled && !!countryCode && contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  })

  // Calculate price for the specified number of votes
  // Cap at 100 votes to respect contract's MAX_VOTES_PER_TX limit
  const cappedVoteCount = Math.min(100, Math.max(1, voteCount))
  const { data: votePrice, refetch: refetchPrice } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "calculateVoteCost",
    args: [countryCodeBytes, BigInt(cappedVoteCount)],
    query: {
      enabled: enabled && !!countryCode && cappedVoteCount > 0 && contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  })

  // Get base price constant
  const { data: basePrice } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "BASE_PRICE",
    query: {
      enabled,
    },
  })

  // Watch for vote events on this country
  useWatchContractEvent({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    eventName: "VotePlaced",
    enabled: contractAddress !== "0x0000000000000000000000000000000000000000",
    onLogs: (logs) => {
      // Check if any vote was for this country
      const hasRelevantVote = logs.some((log) => {
        const args = log.args as { country?: string }
        // Compare bytes8 values
        return args.country === countryCodeBytes
      })

      if (hasRelevantVote) {
        setRefetchTrigger((prev) => prev + 1)
      }
    },
  })

  // Refetch on trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchVotes()
      refetchPrice()
    }
  }, [refetchTrigger, refetchVotes, refetchPrice])

  return {
    currentVotes: currentVotes ? Number(currentVotes) : 0,
    votePrice: votePrice ? formatEther(votePrice) : "0",
    votePriceRaw: votePrice,
    basePrice: basePrice ? formatEther(basePrice) : "0",
    basePriceRaw: basePrice,
    pricePerVote: votePrice && cappedVoteCount > 0 ? formatEther(votePrice / BigInt(cappedVoteCount)) : "0",
    isLoading: !votePrice && enabled && contractAddress !== "0x0000000000000000000000000000000000000000",
    refetch: () => {
      refetchVotes()
      refetchPrice()
    },
  }
}

/**
 * Hook for tracking real-time vote prices for match voting
 * Automatically updates when new votes are placed
 */
export function useMatchVotePrice({ contractAddress, voteCount = 1, enabled = true }: UseMatchVotePriceOptions) {
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Calculate price for the specified amount
  const { data: votePrice, refetch: refetchPrice } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "calculateVotePrice",
    args: [parseEther(voteCount.toString())],
    query: {
      enabled: enabled && voteCount > 0,
    },
  })

  // Get base price constant
  const { data: basePrice } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "BASE_PRICE",
    query: {
      enabled,
    },
  })

  // Watch for vote events
  useWatchContractEvent({
    address: contractAddress,
    abi: WORLD_CUP_MATCH_ABI,
    eventName: "VotePlaced",
    onLogs: () => {
      setRefetchTrigger((prev) => prev + 1)
    },
  })

  // Refetch on trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchPrice()
    }
  }, [refetchTrigger, refetchPrice])

  return {
    votePrice: votePrice ? formatEther(votePrice) : "0",
    votePriceRaw: votePrice,
    basePrice: basePrice ? formatEther(basePrice) : "0",
    basePriceRaw: basePrice,
    isLoading: !votePrice && enabled,
    refetch: refetchPrice,
  }
}

/**
 * Hook for tracking qualification details in real-time
 */
export function useQualificationDetails(contractAddress: `0x${string}`, enabled = true) {
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const { data: details, refetch } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "getQualificationDetails",
    query: {
      enabled,
    },
  })

  // Watch for vote events to update prize pool
  useWatchContractEvent({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    eventName: "VotePlaced",
    onLogs: () => {
      setRefetchTrigger((prev) => prev + 1)
    },
  })

  // Refetch on trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetch()
    }
  }, [refetchTrigger, refetch])

  if (!details) {
    return {
      totalPrizePool: "0",
      qualificationEndTime: 0,
      qualificationSpots: 48,
      isFinalized: false,
      totalVoters: 0,
      isLoading: true,
    }
  }

  const [totalPrizePool, qualificationEndTime, qualificationSpots, isFinalized, totalVoters] = details

  return {
    totalPrizePool: formatEther(totalPrizePool as bigint),
    totalPrizePoolRaw: totalPrizePool,
    qualificationEndTime: Number(qualificationEndTime),
    qualificationSpots: Number(qualificationSpots),
    isFinalized,
    totalVoters: Number(totalVoters),
    isLoading: false,
    refetch,
  }
}

/**
 * Hook for tracking top countries in qualification
 */
export function useTopCountries(contractAddress: `0x${string}`, enabled = true) {
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const { data: topCountries, refetch } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "getTopCountries",
    query: {
      enabled,
    },
  })

  // Watch for vote events to update rankings
  useWatchContractEvent({
    address: contractAddress,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    eventName: "VotePlaced",
    onLogs: () => {
      setRefetchTrigger((prev) => prev + 1)
    },
  })

  // Refetch on trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetch()
    }
  }, [refetchTrigger, refetch])

  if (!topCountries) {
    return {
      countries: [],
      isLoading: true,
      refetch,
    }
  }

  const [countryCodes, votes] = topCountries

  return {
    countries: (countryCodes as string[]).map((code, index) => ({
      code,
      votes: Number((votes as bigint[])[index]),
    })),
    isLoading: false,
    refetch,
  }
}
