import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leaderboard | Top Voters — Onchain World Cup 2026",
  description:
    "Explore the Onchain World Cup 2026 leaderboard. Top supporters ranked by ETH spent, votes cast, and early bird status. Base network, live rankings.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/leaderboard",
  },
  openGraph: {
    title: "Leaderboard | Top Voters — Onchain World Cup 2026",
    description: "Top supporters ranked by ETH spent, votes cast, and early bird status in the Onchain World Cup 2026 on Base.",
    url: "https://app.onchainworldcup.xyz/leaderboard",
    siteName: "Onchain World Cup",
    locale: "en_US",
    type: "website",
  },
}

export default async function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz"

  let itemListElement: Array<{ "@type": string; position: number; name: string; url: string }> = []
  try {
    const res = await fetch(`${baseUrl}/api/qualification/leaderboard?limit=3`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const json = await res.json()
      itemListElement = (json.data ?? []).map(
        (u: { wallet_address: string; farcaster_name?: string | null; ens_name?: string | null }, i: number) => {
          const addr = u.wallet_address
          const name = u.farcaster_name || u.ens_name || `${addr.slice(0, 6)}...${addr.slice(-4)}`
          return {
            "@type": "ListItem",
            position: i + 1,
            name,
            url: `${baseUrl}/users/${addr}`,
          }
        },
      )
    }
  } catch {
    // silently fail — schema still renders without items
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://app.onchainworldcup.xyz/" },
              { "@type": "ListItem", "position": 2, "name": "Leaderboard", "item": "https://app.onchainworldcup.xyz/leaderboard" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Top Onchain World Cup 2026 Voters",
            "description": "Live leaderboard of the top ETH voters in the Onchain World Cup 2026 qualification phase on Base blockchain.",
            "url": "https://app.onchainworldcup.xyz/leaderboard",
            ...(itemListElement.length > 0 ? { itemListElement } : {}),
          }),
        }}
      />
      {children}
    </>
  )
}
