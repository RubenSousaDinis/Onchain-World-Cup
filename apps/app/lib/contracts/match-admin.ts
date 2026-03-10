"use client"

import { useReadContract, useWaitForTransactionReceipt } from "wagmi"
import { useWriteContractAttributed } from "@/hooks/use-write-contract-attributed"
import { Address } from "viem"
import { WORLD_CUP_MATCH_ABI } from "@/lib/contracts/match-abi"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address

// ============================================================================
// READ HOOKS
// ============================================================================

export function useMatchDetails(contractAddress: Address | undefined) {
  return useReadContract({
    address: contractAddress ?? ZERO_ADDRESS,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "getMatchDetails",
    query: { enabled: !!contractAddress },
  })
}

export function useMatchPaused(contractAddress: Address | undefined) {
  return useReadContract({
    address: contractAddress ?? ZERO_ADDRESS,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "paused",
    query: { enabled: !!contractAddress },
  })
}

export function useMatchOwner(contractAddress: Address | undefined) {
  return useReadContract({
    address: contractAddress ?? ZERO_ADDRESS,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "owner",
    query: { enabled: !!contractAddress },
  })
}

export function useMatchPlatformFee(contractAddress: Address | undefined) {
  return useReadContract({
    address: contractAddress ?? ZERO_ADDRESS,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "platformFeePercent",
    query: { enabled: !!contractAddress },
  })
}

export function useMatchPlatformAddress(contractAddress: Address | undefined) {
  return useReadContract({
    address: contractAddress ?? ZERO_ADDRESS,
    abi: WORLD_CUP_MATCH_ABI,
    functionName: "platformAddress",
    query: { enabled: !!contractAddress },
  })
}

// ============================================================================
// WRITE HOOKS
// ============================================================================

export function useMatchPause(contractAddress: Address) {
  const { data: hash, isPending, writeContract, error } = useWriteContractAttributed()
  const receipt = useWaitForTransactionReceipt({ hash })

  const pause = () =>
    writeContract({
      address: contractAddress,
      abi: WORLD_CUP_MATCH_ABI,
      functionName: "pause",
    })

  const unpause = () =>
    writeContract({
      address: contractAddress,
      abi: WORLD_CUP_MATCH_ABI,
      functionName: "unpause",
    })

  return { pause, unpause, hash, isPending, error, receipt }
}

export function useMatchSetPlatformFee(contractAddress: Address) {
  const { data: hash, isPending, writeContract, error } = useWriteContractAttributed()
  const receipt = useWaitForTransactionReceipt({ hash })

  const setPlatformFee = (basisPoints: bigint) =>
    writeContract({
      address: contractAddress,
      abi: WORLD_CUP_MATCH_ABI,
      functionName: "setPlatformFee",
      args: [basisPoints],
    })

  return { setPlatformFee, hash, isPending, error, receipt }
}

export function useMatchSetPlatformAddress(contractAddress: Address) {
  const { data: hash, isPending, writeContract, error } = useWriteContractAttributed()
  const receipt = useWaitForTransactionReceipt({ hash })

  const setPlatformAddress = (newAddress: Address) =>
    writeContract({
      address: contractAddress,
      abi: WORLD_CUP_MATCH_ABI,
      functionName: "setPlatformAddress",
      args: [newAddress],
    })

  return { setPlatformAddress, hash, isPending, error, receipt }
}
