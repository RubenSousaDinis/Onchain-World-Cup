import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/stats/daily-eth
 * Returns daily ETH spent aggregated from qualification votes
 */
export async function GET() {
  try {
    const rows = await prisma.$queryRaw<
      { day: string; total_eth: string; vote_count: number }[]
    >`
      SELECT
        DATE(created_at) as day,
        SUM(CAST(total_cost_eth AS DECIMAL(38,18)))::text as total_eth,
        SUM(vote_count)::int as vote_count
      FROM qualification_votes
      GROUP BY DATE(created_at)
      ORDER BY day DESC
      LIMIT 90
    `

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("Error in GET /api/admin/stats/daily-eth:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
