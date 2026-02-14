import { createPublicClient, http, toCoinType } from "viem"
import { mainnet, base } from "viem/chains"
import { NextResponse } from "next/server"

// Server-side public client for ENS resolution — never rate-limited by browser
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    process.env.ETH_MAINNET_RPC_URL ||
      process.env.NEXT_PUBLIC_ETH_MAINNET_RPC_URL ||
      "https://ethereum.publicnode.com"
  ),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ name: null }, { status: 400 })
  }

  try {
    // 1. Try Base L2 primary name first (e.g. "rubendinis.base.eth")
    const baseName = await publicClient
      .getEnsName({
        address: address as `0x${string}`,
        coinType: toCoinType(base.id),
      })
      .catch(() => null)

    if (baseName) {
      return NextResponse.json(
        { name: baseName },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      )
    }

    // 2. Fall back to L1 primary name (e.g. "rubendinis.eth")
    const l1Name = await publicClient
      .getEnsName({ address: address as `0x${string}` })
      .catch(() => null)

    return NextResponse.json(
      { name: l1Name },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    )
  } catch {
    return NextResponse.json({ name: null })
  }
}
