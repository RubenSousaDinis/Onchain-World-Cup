/**
 * Hook to calculate projected earnings based on current standings
 * This provides an estimate before qualification is finalized
 */

import { useState, useEffect } from 'react'

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
 *
 * @param userAddress - The user's wallet address
 * @param prefetchedVotes - Pre-fetched votes to avoid a redundant API call. When provided,
 *   the hook skips fetching /api/users/[address] and uses these instead. Pass all vote
 *   transactions (not just the display page) for accurate calculations.
 */
export function useProjectedEarnings(
  userAddress: string | undefined,
  prefetchedVotes?: UserVote[]
) {
  const [projectedEarnings, setProjectedEarnings] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Stable dependency: only re-run when address changes or votes first become available
  const votesLength = prefetchedVotes?.length

  useEffect(() => {
    async function calculateEarnings() {
      if (!userAddress) {
        setProjectedEarnings(0)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Fetch summary and top-48 countries in parallel — they're independent
        const [summaryRes, countriesRes] = await Promise.all([
          fetch('/api/qualification/summary'),
          fetch('/api/qualification/countries?limit=48'),
        ])

        if (!summaryRes.ok || !countriesRes.ok) {
          setProjectedEarnings(0)
          return
        }

        const [summaryData, countriesData] = await Promise.all([
          summaryRes.json(),
          countriesRes.json(),
        ])

        const prizePool = parseFloat(summaryData.data?.total_eth || '0')
        const top48Countries: CountryStats[] = countriesData.data || []

        // Use prefetched votes when available to avoid a redundant API round-trip
        let userVotes: UserVote[]
        if (prefetchedVotes !== undefined) {
          userVotes = prefetchedVotes
        } else {
          const userRes = await fetch(`/api/users/${userAddress}?limit=1000`)
          if (!userRes.ok) {
            setProjectedEarnings(0)
            return
          }
          userVotes = (await userRes.json()).data?.votes || []
        }

        // Create a Set of top-48 country codes for O(1) lookup
        const top48Codes = new Set(top48Countries.map(c => c.country_code.toLowerCase()))

        // Sum user's votes that land on qualifying countries
        let userQualifiedVotes = 0
        for (const vote of userVotes) {
          if (top48Codes.has(vote.country_code.toLowerCase())) {
            userQualifiedVotes += vote.vote_count
          }
        }

        // Sum total votes across top-48 countries
        const totalQualifiedVotes = top48Countries.reduce((sum, c) => sum + c.total_votes, 0)

        if (userQualifiedVotes > 0 && totalQualifiedVotes > 0 && prizePool > 0) {
          setProjectedEarnings((userQualifiedVotes / totalQualifiedVotes) * prizePool)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress, votesLength])

  return {
    projectedEarnings,
    isLoading,
  }
}
