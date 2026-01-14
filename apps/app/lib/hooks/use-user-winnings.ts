"use client"

import { useReadContract, useAccount } from "wagmi"
import { formatEther } from "viem"
import { WORLD_CUP_MATCH_ABI } from "../contracts/match-abi"

export function useUserWinnings(contractAddress: `0x${string}`) {
  const { address } = useAccount()

  const { data: winnings } = useReadContract({
    address: contractAddress,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "calculateWinnings",
    args: address ? [address] : undefined,
  })

  if (!winnings || !address) {
    return {
      winnings: "0",
      hasWinnings: false,
    }
  }

  const winningsEth = formatEther(winnings as bigint)

  return {
    winnings: winningsEth,
    hasWinnings: Number.parseFloat(winningsEth) > 0,
  }
}
