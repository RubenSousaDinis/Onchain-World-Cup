import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/qualification/summary
 * Fetch overall qualification statistics and summary
 *
 * Returns:
 * - totalVotes: number - Total votes across all countries
 * - totalEth: string - Total ETH spent
 * - totalCountries: number - Number of countries with votes
 * - totalVoters: number - Number of unique voters
 * - qualifiedCount: number - Number of qualified countries
 * - topCountries: array - Top 5 countries by votes
 * - recentVotes: array - 5 most recent votes
 * - leaderboard: array - Top 5 voters
 *
 * Caching: 5 minutes
 */
export async function GET(request: NextRequest) {
  try {
    // Create cached function
    const getSummary = unstable_cache(
      async () => {
        // Fetch aggregated statistics in parallel
        const [
          countryStats,
          voterCount,
          qualifiedCount,
          topCountries,
          recentVotes,
          topVoters,
        ] = await Promise.all([
          // Total votes and countries
          prisma.countryStats.aggregate({
            _sum: {
              totalVotes: true,
            },
            _count: {
              countryCode: true,
            },
          }),

          // Total unique voters
          prisma.userStat.count({
            where: {
              qualificationVotes: {
                gt: 0,
              },
            },
          }),

          // Qualified countries count
          prisma.countryStats.count({
            where: {
              qualified: true,
            },
          }),

          // Top 5 countries by votes
          prisma.countryStats.findMany({
            orderBy: {
              totalVotes: "desc",
            },
            take: 5,
          }),

          // 5 most recent votes
          prisma.qualificationVote.findMany({
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          }),

          // Top 5 voters
          prisma.userStat.findMany({
            where: {
              qualificationVotes: {
                gt: 0,
              },
            },
            orderBy: {
              qualificationVotes: "desc",
            },
            take: 5,
          }),
        ])

        // Calculate total ETH across all countries
        const allCountries = await prisma.countryStats.findMany({
          select: {
            totalEth: true,
          },
        })
        const totalEth = allCountries
          .reduce((sum, country) => sum + parseFloat(country.totalEth), 0)
          .toFixed(6)

        // Format top countries
        const formattedTopCountries = topCountries.map((country) => ({
          country_code: country.countryCode,
          total_votes: country.totalVotes,
          total_eth: country.totalEth,
          qualified: country.qualified,
        }))

        // Format recent votes
        const formattedRecentVotes = recentVotes.map((vote) => ({
          id: vote.id,
          country_code: vote.countryCode,
          voter_address: vote.voterAddress,
          vote_count: vote.voteCount,
          total_cost_eth: vote.totalCostEth,
          tx_hash: vote.txHash,
          created_at: vote.createdAt.toISOString(),
        }))

        // Format top voters
        const formattedTopVoters = topVoters.map((user, index) => ({
          rank: index + 1,
          wallet_address: user.walletAddress,
          qualification_votes: user.qualificationVotes,
          qualification_spent_eth: user.qualificationSpentEth,
          countries_voted_for: user.countriesVotedFor,
        }))

        return {
          total_votes: countryStats._sum.totalVotes || 0,
          total_eth: totalEth,
          total_countries: countryStats._count.countryCode,
          total_voters: voterCount,
          qualified_count: qualifiedCount,
          top_countries: formattedTopCountries,
          recent_votes: formattedRecentVotes,
          top_voters: formattedTopVoters,
        }
      },
      ["qualification-summary"],
      {
        revalidate: 300, // 5 minutes
        tags: ["qualification-summary", "qualification-countries", "qualification-votes"],
      }
    )

    const result = await getSummary()

    const response = NextResponse.json({ data: result })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("Unexpected error in GET /api/qualification/summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
