import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/qualification/votes
 * Fetch qualification vote history
 *
 * Query params:
 *   - country: string (optional) - filter by country code
 *   - voter: string (optional) - filter by voter address
 *   - limit: number (default: 20, max: 100)
 *   - offset: number (default: 0)
 *   - sort: 'recent' | 'oldest' | 'votes' | 'cost' (default: 'recent')
 *
 * Returns array of votes with:
 * - id: string
 * - countryCode: string
 * - voterAddress: string
 * - voteCount: number
 * - totalCostEth: string
 * - txHash: string
 * - blockNumber: number
 * - createdAt: string
 *
 * Caching: 1 minute (votes update frequently)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const country = searchParams.get("country")?.toUpperCase() || undefined
    const voter = searchParams.get("voter")?.toLowerCase() || undefined
    const sort = searchParams.get("sort") || "recent"
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Validate sort field
    const validSortFields = ["recent", "oldest", "votes", "cost"]
    if (!validSortFields.includes(sort)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${validSortFields.join(", ")}` },
        { status: 400 }
      )
    }

    // Create cached function
    const getVotes = unstable_cache(
      async () => {
        // Build where clause
        const where: any = {}
        if (country) {
          where.countryCode = country
        }
        if (voter) {
          where.voterAddress = voter
        }

        // Build orderBy
        let orderBy: any
        if (sort === "recent") {
          orderBy = { createdAt: "desc" }
        } else if (sort === "oldest") {
          orderBy = { createdAt: "asc" }
        } else if (sort === "votes") {
          orderBy = { voteCount: "desc" }
        } else {
          orderBy = { totalCostEth: "desc" }
        }

        // Fetch votes with count
        const [votes, count] = await Promise.all([
          prisma.qualificationVote.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
          }),
          prisma.qualificationVote.count({ where }),
        ])

        // Transform for API response
        const formattedVotes = votes.map((vote) => ({
          id: vote.id,
          country_code: vote.countryCode,
          voter_address: vote.voterAddress,
          vote_count: vote.voteCount,
          total_cost_eth: vote.totalCostEth,
          tx_hash: vote.txHash,
          block_number: Number(vote.blockNumber), // Convert BigInt to number
          created_at: vote.createdAt.toISOString(),
        }))

        return {
          data: formattedVotes,
          count,
          limit,
          offset,
        }
      },
      [
        "qualification-votes",
        country || "all",
        voter || "all",
        sort,
        String(limit),
        String(offset),
      ],
      {
        revalidate: 60, // 1 minute
        tags: ["qualification-votes"],
      }
    )

    const result = await getVotes()

    const response = NextResponse.json(result)
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return response
  } catch (error) {
    console.error("Unexpected error in GET /api/qualification/votes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
