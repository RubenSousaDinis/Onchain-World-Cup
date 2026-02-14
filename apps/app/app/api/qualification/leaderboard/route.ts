import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/qualification/leaderboard
 * Fetch top users by qualification votes
 *
 * Query params:
 *   - metric: 'votes' | 'spent' | 'countries' (default: 'votes')
 *     - 'votes': Sort by total qualification votes
 *     - 'spent': Sort by total ETH spent on qualification
 *     - 'countries': Sort by number of countries voted for
 *   - limit: number (default: 10, max: 100)
 *   - offset: number (default: 0)
 *
 * Returns array of user statistics with:
 * - walletAddress: string
 * - qualificationVotes: number
 * - qualificationSpentEth: string
 * - countriesVotedFor: number
 * - rank: number (1-based)
 *
 * Caching: 5 minutes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const metric = searchParams.get("metric") || "votes"
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Validate metric
    const validMetrics = ["votes", "spent", "countries"]
    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        { error: `Invalid metric. Must be one of: ${validMetrics.join(", ")}` },
        { status: 400 }
      )
    }

    // Create cached function
    const getLeaderboard = unstable_cache(
      async () => {
        // Build orderBy based on metric
        let orderBy: any
        if (metric === "votes") {
          orderBy = { qualificationVotes: "desc" }
        } else if (metric === "spent") {
          orderBy = { qualificationSpentEth: "desc" }
        } else {
          orderBy = { countriesVotedFor: "desc" }
        }

        // Fetch top users with count
        const [users, count] = await Promise.all([
          prisma.userStat.findMany({
            where: {
              qualificationVotes: {
                gt: 0, // Only users who have voted
              },
            },
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy,
            take: limit,
            skip: offset,
          }),
          prisma.userStat.count({
            where: {
              qualificationVotes: {
                gt: 0,
              },
            },
          }),
        ])

        // Transform for API response with rank
        const formattedUsers = users.map((user, index) => ({
          rank: offset + index + 1,
          wallet_address: user.walletAddress,
          qualification_votes: user.qualificationVotes,
          qualification_spent_eth: user.qualificationSpentEth,
          qualification_won_eth: user.qualificationWonEth,
          countries_voted_for: user.countriesVotedFor,
          farcaster_name: user.user?.name || null,
          farcaster_avatar: user.user?.image || null,
          ens_name: user.ensName || null,
          created_at: user.createdAt.toISOString(),
          updated_at: user.updatedAt.toISOString(),
        }))

        return {
          data: formattedUsers,
          count,
          limit,
          offset,
          metric,
        }
      },
      ["qualification-leaderboard", metric, String(limit), String(offset)],
      {
        revalidate: 300, // 5 minutes
        tags: ["qualification-leaderboard"],
      }
    )

    const result = await getLeaderboard()

    const response = NextResponse.json(result)
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("Unexpected error in GET /api/qualification/leaderboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
