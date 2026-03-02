import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { formatEther } from "viem"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 })
  }

  const normalizedAddress = address.toLowerCase()

  try {
    const referrals = await prisma.referral.findMany({
      where: { referrerAddress: normalizedAddress },
      orderBy: { createdAt: "desc" },
    })

    // Sum total earnings
    let totalEarnedWei = BigInt(0)
    for (const r of referrals) {
      try {
        totalEarnedWei += BigInt(Math.round(parseFloat(r.referralAmountEth) * 1e18))
      } catch {
        // skip malformed rows
      }
    }

    return NextResponse.json({
      totalEarnedEth: formatEther(totalEarnedWei),
      totalReferrals: referrals.length,
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
