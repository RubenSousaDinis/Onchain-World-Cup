import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { computeAchievementStats, computeAchievements, computeTotalPoints } from "@/lib/achievements"

/**
 * GET /api/qualification/countries/[code]
 * Fetch statistics for a specific country
 *
 * Returns:
 * - countryCode: string
 * - totalVotes: number
 * - totalEth: string
 * - qualified: boolean
 * - rank: number (1-based ranking by votes)
 * - topVoters: array of top 5 voters for this country
 *
 * Caching: 5 minutes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const countryCode = code.toUpperCase()

    // Create cached function
    const getCountryDetails = unstable_cache(
      async () => {
        // Fetch country stats
        const stats = await prisma.countryStats.findUnique({
          where: { countryCode },
        })

        if (!stats) {
          return null
        }

        // Calculate rank (1-based)
        const higherRankedCount = await prisma.countryStats.count({
          where: {
            totalVotes: {
              gt: stats.totalVotes,
            },
          },
        })
        const rank = higherRankedCount + 1

        // Fetch top voters for this country by vote count
        const topVotes = await prisma.qualificationVote.groupBy({
          by: ["voterAddress"],
          where: { countryCode },
          _sum: {
            voteCount: true,
          },
          orderBy: {
            _sum: {
              voteCount: "desc",
            },
          },
          take: 5,
        })

        // Get voter addresses
        const voterAddresses = topVotes.map((v) => v.voterAddress)

        // Fetch all votes for these top voters to calculate ETH spent
        const voterVotes = await prisma.qualificationVote.findMany({
          where: {
            countryCode,
            voterAddress: {
              in: voterAddresses,
            },
          },
          select: {
            voterAddress: true,
            totalCostEth: true,
          },
        })

        // Calculate total ETH spent per voter
        const ethSpentMap = new Map<string, number>()
        voterVotes.forEach((vote) => {
          const current = ethSpentMap.get(vote.voterAddress) || 0
          ethSpentMap.set(vote.voterAddress, current + parseFloat(vote.totalCostEth))
        })

        // Fetch Farcaster data for top voters
        const userStats = await prisma.userStat.findMany({
          where: {
            walletAddress: {
              in: voterAddresses,
            },
          },
          include: {
            user: true,
          },
        })

        const userStatsMap = new Map(
          userStats.map((stat) => [stat.walletAddress.toLowerCase(), stat])
        )

        const topVoters = topVotes.map((vote) => {
          const userStat = userStatsMap.get(vote.voterAddress.toLowerCase())
          const totalEth = ethSpentMap.get(vote.voterAddress) || 0
          const achievementPoints = userStat
            ? computeTotalPoints(computeAchievements(computeAchievementStats({
                qualificationVotes: userStat.qualificationVotes,
                qualificationSpentEth: userStat.qualificationSpentEth,
                countriesVotedFor: userStat.countriesVotedFor,
                rank: userStat.rank,
                createdAt: userStat.createdAt,
              })))
            : 0
          return {
            voter_address: vote.voterAddress,
            total_votes: vote._sum.voteCount || 0,
            total_eth: totalEth.toString(),
            farcaster_fid: userStat?.user?.farcasterFid,
            farcaster_username: userStat?.user?.farcasterUsername,
            farcaster_pfp_url: userStat?.user?.farcasterPfpUrl,
            achievement_points: achievementPoints,
          }
        })

        // Format response
        return {
          country_code: stats.countryCode,
          total_votes: stats.totalVotes,
          total_eth: stats.totalEth,
          qualified: stats.qualified,
          rank,
          top_voters: topVoters,
          created_at: stats.createdAt.toISOString(),
          updated_at: stats.updatedAt.toISOString(),
        }
      },
      ["qualification-country", countryCode],
      {
        revalidate: 300, // 5 minutes
        tags: ["qualification-countries", `qualification-country-${countryCode}`],
      }
    )

    const result = await getCountryDetails()

    if (!result) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 })
    }

    const response = NextResponse.json({ data: result })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("Unexpected error in GET /api/qualification/countries/[code]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
