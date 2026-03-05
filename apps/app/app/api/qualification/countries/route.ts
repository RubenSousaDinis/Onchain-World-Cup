import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/qualification/countries
 * Fetch country statistics for qualification phase
 *
 * Query params:
 *   - qualified: 'true' | 'false' (optional) - filter by qualification status
 *   - sort: 'votes' | 'eth' | 'code' (default: 'votes') - sort by field
 *   - order: 'asc' | 'desc' (default: 'desc')
 *   - limit: number (default: 50, max: 100)
 *   - offset: number (default: 0)
 *
 * Returns array of country statistics with:
 * - countryCode: string
 * - totalVotes: number
 * - totalEth: string (formatted ETH amount)
 * - qualified: boolean
 *
 * Caching: 5 minutes (stats update frequently during voting)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const qualified = searchParams.get("qualified") || undefined
    const sort = searchParams.get("sort") || "votes"
    const order = searchParams.get("order") || "desc"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Validate sort field
    const validSortFields = ["votes", "eth", "code"]
    if (!validSortFields.includes(sort)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${validSortFields.join(", ")}` },
        { status: 400 }
      )
    }

    // Create cached function for fetching country stats
    const getCountryStats = unstable_cache(
      async () => {
        // Build orderBy based on sort parameter
        let orderBy: any
        if (sort === "votes") {
          orderBy = { totalVotes: order }
        } else if (sort === "eth") {
          orderBy = { totalEth: order }
        } else {
          orderBy = { countryCode: order }
        }

        // Build where clause
        const where: any = {}
        if (qualified === "true") {
          where.qualified = true
        } else if (qualified === "false") {
          where.qualified = false
        }

        // Fetch country stats with count
        const [stats, count] = await Promise.all([
          prisma.countryStats.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
          }),
          prisma.countryStats.count({ where }),
        ])

        // Transform for API response
        const formattedStats = stats.map((stat) => ({
          country_code: stat.countryCode,
          total_votes: stat.totalVotes,
          total_eth: stat.totalEth,
          qualified: stat.qualified,
          created_at: stat.createdAt.toISOString(),
          updated_at: stat.updatedAt.toISOString(),
        }))

        return {
          data: formattedStats,
          count,
          limit,
          offset,
        }
      },
      ["qualification-countries", qualified || "all", sort, order, String(limit), String(offset)],
      {
        revalidate: 300, // 5 minutes
        tags: ["qualification-countries"],
      }
    )

    const result = await getCountryStats()

    const response = NextResponse.json(result)
    response.headers.set("Cache-Control", "private, no-store")
    return response
  } catch (error) {
    console.error("Unexpected error in GET /api/qualification/countries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
