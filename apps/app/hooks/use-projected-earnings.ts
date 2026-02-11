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
 */
export function useProjectedEarnings(userAddress: string | undefined) {
  const [projectedEarnings, setProjectedEarnings] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function calculateEarnings() {
      if (!userAddress) {
        setProjectedEarnings(0)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Fetch summary data to get prize pool
        const summaryRes = await fetch('/api/qualification/summary')
        if (!summaryRes.ok) {
          console.error('[ProjectedEarnings] Failed to fetch summary:', summaryRes.status)
          setProjectedEarnings(0)
          return
        }
        const summaryData = await summaryRes.json()
        console.log('[ProjectedEarnings] Summary API response:', summaryData)
        const prizePool = parseFloat(summaryData.data?.total_eth || '0')
        console.log('[ProjectedEarnings] Prize pool from API:', prizePool, 'ETH', 'Raw value:', summaryData.data?.total_eth)

        // Fetch top 48 countries
        const countriesRes = await fetch('/api/qualification/countries?limit=48')
        if (!countriesRes.ok) {
          console.error('[ProjectedEarnings] Failed to fetch countries:', countriesRes.status)
          setProjectedEarnings(0)
          return
        }
        const countriesData = await countriesRes.json()
        const top48Countries: CountryStats[] = countriesData.data || []
        console.log('[ProjectedEarnings] Fetched top 48 countries:', top48Countries.length)

        // Fetch ALL user's votes (not just 20 most recent)
        const userRes = await fetch(`/api/users/${userAddress}?limit=1000`)
        if (!userRes.ok) {
          console.error('[ProjectedEarnings] Failed to fetch user data:', userRes.status)
          setProjectedEarnings(0)
          return
        }
        const userData = await userRes.json()
        const userVotes: UserVote[] = userData.data?.votes || []
        console.log('[ProjectedEarnings] User has', userVotes.length, 'vote transactions')

        // Calculate total votes across all transactions
        const totalUserVotes = userVotes.reduce((sum, vote) => sum + vote.vote_count, 0)
        console.log('[ProjectedEarnings] Total vote count:', totalUserVotes)

        // Create a Set of top 48 country codes for fast lookup
        const top48Codes = new Set(top48Countries.map(c => c.country_code.toLowerCase()))
        console.log('[ProjectedEarnings] Top 48 country codes:', Array.from(top48Codes))

        // Calculate user's votes on top 48 countries
        let userQualifiedVotes = 0
        const matchedVotes: string[] = []
        const unmatchedVotes: string[] = []

        for (const vote of userVotes) {
          const countryCode = vote.country_code.toLowerCase()
          if (top48Codes.has(countryCode)) {
            userQualifiedVotes += vote.vote_count
            matchedVotes.push(`${vote.country_code}: ${vote.vote_count}`)
          } else {
            unmatchedVotes.push(`${vote.country_code}: ${vote.vote_count}`)
          }
        }

        console.log('[ProjectedEarnings] Matched votes (counted):', matchedVotes)
        console.log('[ProjectedEarnings] Unmatched votes (NOT counted):', unmatchedVotes)

        // Calculate total votes on top 48 countries
        let totalQualifiedVotes = 0
        for (const country of top48Countries) {
          totalQualifiedVotes += country.total_votes
        }

        console.log('[ProjectedEarnings] Calculation:', {
          userQualifiedVotes,
          totalQualifiedVotes,
          prizePoolETH: prizePool,
        })

        // Calculate projected earnings
        if (userQualifiedVotes > 0 && totalQualifiedVotes > 0 && prizePool > 0) {
          const projected = (userQualifiedVotes / totalQualifiedVotes) * prizePool
          console.log('[ProjectedEarnings] Projected earnings:', projected, 'ETH')
          setProjectedEarnings(projected)
        } else {
          console.log('[ProjectedEarnings] No earnings - missing data or no qualified votes')
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
  }, [userAddress])

  return {
    projectedEarnings,
    isLoading,
  }
}
