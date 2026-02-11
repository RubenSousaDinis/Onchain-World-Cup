/**
 * Hook to calculate projected earnings based on current standings
 * This provides an estimate before qualification is finalized
 */

import { useState, useEffect } from 'react'
import { useTotalPrizePool, isQualificationContractAvailable } from '@/lib/contracts/qualification'
import { useChainId } from 'wagmi'
import { formatEther } from 'viem'

type CountryStats = {
  country_code: string
  total_votes: number
  total_eth: string
  rank: number
}

type UserVote = {
  country_code: string
  vote_count: number
}

/**
 * Calculate projected earnings for a user based on current standings
 * Formula: (userVotesOnTop48 * totalPrizePool) / totalVotesOnTop48
 */
export function useProjectedEarnings(userAddress: string | undefined) {
  const chainId = useChainId()
  const isContractAvailable = isQualificationContractAvailable(chainId)

  const { data: prizePoolWei } = useTotalPrizePool(chainId)
  const [projectedEarnings, setProjectedEarnings] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function calculateEarnings() {
      if (!userAddress || !isContractAvailable) {
        setProjectedEarnings(0)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Fetch top 48 countries
        const countriesRes = await fetch('/api/qualification/countries?limit=48')
        if (!countriesRes.ok) {
          console.error('Failed to fetch countries')
          setProjectedEarnings(0)
          return
        }
        const countriesData = await countriesRes.json()
        const top48Countries: CountryStats[] = countriesData.data || []

        // Fetch user's votes
        const userRes = await fetch(`/api/users/${userAddress}`)
        if (!userRes.ok) {
          console.error('Failed to fetch user data')
          setProjectedEarnings(0)
          return
        }
        const userData = await userRes.json()
        const userVotes: UserVote[] = userData.data?.votes || []

        // Create a Set of top 48 country codes for fast lookup
        const top48Codes = new Set(top48Countries.map(c => c.country_code.toLowerCase()))

        // Calculate user's votes on top 48 countries
        let userQualifiedVotes = 0
        for (const vote of userVotes) {
          if (top48Codes.has(vote.country_code.toLowerCase())) {
            userQualifiedVotes += vote.vote_count
          }
        }

        // Calculate total votes on top 48 countries
        let totalQualifiedVotes = 0
        for (const country of top48Countries) {
          totalQualifiedVotes += country.total_votes
        }

        // Calculate projected earnings
        if (userQualifiedVotes > 0 && totalQualifiedVotes > 0 && prizePoolWei) {
          const prizePool = parseFloat(formatEther(prizePoolWei))
          const projected = (userQualifiedVotes / totalQualifiedVotes) * prizePool
          setProjectedEarnings(projected)
        } else {
          setProjectedEarnings(0)
        }
      } catch (error) {
        console.error('Error calculating projected earnings:', error)
        setProjectedEarnings(0)
      } finally {
        setIsLoading(false)
      }
    }

    calculateEarnings()
  }, [userAddress, prizePoolWei, chainId, isContractAvailable])

  return {
    projectedEarnings,
    isLoading,
    isContractAvailable,
  }
}
