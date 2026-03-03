import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { formatEther } from "viem"

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 })
  }

  const normalizedAddress = address.toLowerCase()

  try {
    const [allReferrals, referrals] = await Promise.all([
      // Fetch all for totals (only the amount field needed)
      prisma.referral.findMany({
        where: { referrerAddress: normalizedAddress },
        select: { referralAmountEth: true },
      }),
      // Fetch paginated activity
      prisma.referral.findMany({
        where: { referrerAddress: normalizedAddress },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ])

    let totalEarnedWei = BigInt(0)
    for (const r of allReferrals) {
      try {
        totalEarnedWei += BigInt(Math.round(parseFloat(r.referralAmountEth) * 1e18))
      } catch {
        // skip malformed rows
      }
    }

    const totalReferrals = allReferrals.length
    const hasMore = page * PAGE_SIZE < totalReferrals

    return NextResponse.json({
      totalEarnedEth: formatEther(totalEarnedWei),
      totalReferrals,
      hasMore,
      page,
      referrals: referrals.map((r) => ({
        referredAddress: r.referredAddress,
        voteAmountEth: r.voteAmountEth,
        referralAmountEth: r.referralAmountEth,
        contractType: r.contractType,
        txHash: r.txHash,
        createdAt: r.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error("[referrals] GET error:", err)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
  }
}
