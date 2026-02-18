/**
 * WORLDCUPQUALIFICATION CONTRACT UTILITIES
 *
 * Type-safe utilities for interacting with the WorldCupQualification contract.
 * Provides both read and write functions with proper error handling.
 *
 * CONTRACT ADDRESSES (from environment variables):
 * - Base Sepolia (testnet): NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA
 * - Base Mainnet (production): NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Address, parseEther, formatEther } from "viem"
import { WORLD_CUP_QUALIFICATION_ABI } from "@/lib/contracts/qualification-abi"

/**
 * Get the qualification contract address for the current chain
 * Reads from environment variables based on chain ID
 */
export function getQualificationAddress(chainId: number): Address {
  // Get address from environment variables
  const address = chainId === 84532
    ? process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA // Base Sepolia
    : chainId === 8453
    ? process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET // Base Mainnet
    : null

  if (!address) {
    throw new Error(
      `WorldCupQualification contract address not configured for chain ${chainId}. ` +
      `Please set ${chainId === 84532 ? 'NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA' : 'NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET'} in your .env file.`
    )
  }

  return address as Address
}

/**
 * Check if contract is deployed on the current chain
 */
export function isQualificationContractAvailable(chainId: number): boolean {
  const address = chainId === 84532
    ? process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA
    : chainId === 8453
    ? process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET
    : null

  return !!address
}

/**
 * Helper to convert country code string to bytes8
 * Supports both 2-character (e.g., "US") and longer codes (e.g., "GB-ENG")
 */
export function countryCodeToBytes8(code: string): `0x${string}` {
  if (code.length > 8) {
    throw new Error(`Country code "${code}" is too long (max 8 characters)`)
  }
  const hex = Buffer.from(code, "utf8").toString("hex")
  return `0x${hex.padEnd(16, "0")}` as `0x${string}`
}

/**
 * Helper to convert bytes8 back to country code string
 */
export function bytes8ToCountryCode(bytes: string): string {
  // Remove 0x prefix and trailing zeros
  const hex = bytes.replace("0x", "").replace(/0+$/, "")
  return Buffer.from(hex, "hex").toString("utf8")
}

// ============================================================================
// READ FUNCTIONS
// ============================================================================

/**
 * Get the current vote price for a country
 */
export function useVotePrice(chainId: number, countryCode: string) {
  const address = getQualificationAddress(chainId)
  const countryBytes = countryCodeToBytes8(countryCode)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "votePrice",
    args: [countryBytes],
    query: {
      enabled: !!countryCode,
    },
  })
}

/**
 * Calculate the total cost for multiple votes
 */
export function useCalculateVoteCost(chainId: number, countryCode: string, votes: number) {
  const address = getQualificationAddress(chainId)
  const countryBytes = countryCodeToBytes8(countryCode)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "calculateVoteCost",
    args: [countryBytes, BigInt(votes)],
    query: {
      enabled: !!countryCode && votes > 0,
    },
  })
}

/**
 * Get the current vote count for a country
 */
export function useCountryVotes(chainId: number, countryCode: string) {
  const address = getQualificationAddress(chainId)
  const countryBytes = countryCodeToBytes8(countryCode)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "countryVotes",
    args: [countryBytes],
    query: {
      enabled: !!countryCode,
    },
  })
}

/**
 * Get the total ETH collected for a country
 */
export function useCountryETH(chainId: number, countryCode: string) {
  const address = getQualificationAddress(chainId)
  const countryBytes = countryCodeToBytes8(countryCode)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "getETHPerCountry",
    args: [countryBytes],
    query: {
      enabled: !!countryCode,
    },
  })
}

/**
 * Get user's votes for a specific country
 */
export function useUserVotes(chainId: number, userAddress: Address | undefined, countryCode: string) {
  const address = getQualificationAddress(chainId)
  const countryBytes = countryCodeToBytes8(countryCode)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "userVotes",
    args: [userAddress!, countryBytes],
    query: {
      enabled: !!userAddress && !!countryCode,
    },
  })
}

/**
 * Get user's votes across all countries
 */
export function useGetUserVotes(chainId: number, userAddress: Address | undefined) {
  const address = getQualificationAddress(chainId)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "getUserVotes",
    args: [userAddress!],
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Check if a country is qualified
 */
export function useIsQualified(chainId: number, countryCode: string) {
  const address = getQualificationAddress(chainId)
  const countryBytes = countryCodeToBytes8(countryCode)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "isQualified",
    args: [countryBytes],
    query: {
      enabled: !!countryCode,
    },
  })
}

/**
 * Check if qualification is finalized
 */
export function useQualificationFinalized(chainId: number) {
  const address = getQualificationAddress(chainId)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "qualificationFinalized",
  })
}

/**
 * Get qualification start time
 */
export function useQualificationStartTime(chainId: number) {
  const address = getQualificationAddress(chainId)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "qualificationStartTime",
  })
}

/**
 * Get qualification end time
 */
export function useQualificationEndTime(chainId: number) {
  const address = getQualificationAddress(chainId)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "qualificationEndTime",
  })
}

/**
 * Get total prize pool
 */
export function useTotalPrizePool(chainId: number) {
  let address: Address | null = null

  try {
    address = getQualificationAddress(chainId)
  } catch (error) {
    // Contract not deployed - return disabled query
    return useReadContract({
      address: '0x0000000000000000000000000000000000000000' as Address,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: "getTotalPrizePool",
      query: {
        enabled: false,
      },
    })
  }

  return useReadContract({
    address: address!,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "getTotalPrizePool",
  })
}

/**
 * Calculate claimable winnings for a user
 */
export function useClaimable(chainId: number, userAddress: Address | undefined) {
  let address: Address | null = null

  try {
    address = getQualificationAddress(chainId)
  } catch (error) {
    // Contract not deployed on this chain - return disabled query
    return useReadContract({
      address: '0x0000000000000000000000000000000000000000' as Address,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: "claimable",
      args: [userAddress!],
      query: {
        enabled: false, // Disable query if contract not available
      },
    })
  }

  return useReadContract({
    address: address!,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "claimable",
    args: [userAddress!],
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Check if contract is paused
 */
export function usePaused(chainId: number) {
  const address = getQualificationAddress(chainId)

  return useReadContract({
    address,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "paused",
  })
}

// ============================================================================
// WRITE FUNCTIONS
// ============================================================================

/**
 * Vote for a country
 * @param countryCode - 2 or more character country code (e.g., "US", "GB-ENG")
 * @param votes - Number of votes (1-100)
 * @param value - ETH value to send (must match or exceed calculated cost)
 */
export function useVote() {
  const { data: hash, isPending, writeContract } = useWriteContract()

  const vote = async (
    chainId: number,
    countryCode: string,
    votes: number,
    value: bigint
  ) => {
    const address = getQualificationAddress(chainId)
    const countryBytes = countryCodeToBytes8(countryCode)

    return writeContract({
      address,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: "vote",
      args: [countryBytes, BigInt(votes)],
      value,
    })
  }

  return {
    vote,
    hash,
    isPending,
  }
}

/**
 * Check if user has already claimed their winnings
 */
export function useHasClaimed(chainId: number, userAddress: Address | undefined) {
  let address: Address | null = null

  try {
    address = getQualificationAddress(chainId)
  } catch (error) {
    return useReadContract({
      address: '0x0000000000000000000000000000000000000000' as Address,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: "hasClaimed",
      args: [userAddress!],
      query: {
        enabled: false,
      },
    })
  }

  return useReadContract({
    address: address!,
    abi: WORLD_CUP_QUALIFICATION_ABI,
    functionName: "hasClaimed",
    args: [userAddress!],
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Claim winnings after qualification is finalized
 */
export function useClaim() {
  const { data: hash, isPending, writeContract } = useWriteContract()

  const claim = async (chainId: number) => {
    const address = getQualificationAddress(chainId)

    return writeContract({
      address,
      abi: WORLD_CUP_QUALIFICATION_ABI,
      functionName: "claim",
    })
  }

  return {
    claim,
    hash,
    isPending,
  }
}

/**
 * Hook to wait for transaction confirmation
 */
export function useWaitForVote(hash: `0x${string}` | undefined) {
  return useWaitForTransactionReceipt({
    hash,
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format vote price for display
 */
export function formatVotePrice(priceInWei: bigint | undefined): string {
  if (!priceInWei) return "0"
  return formatEther(priceInWei)
}

/**
 * Parse ETH amount to wei
 */
export function parseETHAmount(eth: string): bigint {
  return parseEther(eth)
}

/**
 * Calculate vote cost in ETH (formatted)
 */
export function calculateVoteCostETH(basePrice: bigint, priceIncrement: bigint, currentVotes: bigint, votesToBuy: number): string {
  let totalCost = BigInt(0)
  for (let i = 0; i < votesToBuy; i++) {
    totalCost += basePrice + (currentVotes + BigInt(i)) * priceIncrement
  }
  return formatEther(totalCost)
}

console.log("[Qualification Contract] Utilities loaded")
