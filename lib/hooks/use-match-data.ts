"use client"

import { useReadContract, useWatchContractEvent } from "wagmi"
import { formatEther } from "viem"
import { WORLD_CUP_MATCH_ABI } from "../contracts/match-abi"
import { useEffect, useState } from "react"

export function useMatchData(contractAddress: `0x${string}`) {
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const { data: matchDetails, refetch } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "getMatchDetails",
  })

  const { data: voterCount } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "getVoterCount",
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
      refetch()
    }
  }, [refetchTrigger, refetch])

  if (!matchDetails) {
    return {
      team1Name: "",
      team2Name: "",
      team1Votes: "0",
      team2Votes: "0",
      totalPrizePool: "0",
      currentPhase: 0,
      isFinalized: false,
      winningTeam: 0,
      voterCount: 0,
      isLoading: true,
    }
  }

  const [team1Name, team2Name, team1Votes, team2Votes, totalPrizePool, currentPhase, isFinalized, winningTeam] =
    matchDetails

  return {
    team1Name,
    team2Name,
    team1Votes: formatEther(team1Votes as bigint),
    team2Votes: formatEther(team2Votes as bigint),
    totalPrizePool: formatEther(totalPrizePool as bigint),
    currentPhase: Number(currentPhase),
    isFinalized,
    winningTeam: Number(winningTeam),
    voterCount: Number(voterCount || 0),
    isLoading: false,
  }
}
