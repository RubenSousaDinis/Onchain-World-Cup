import type { Metadata } from "next"
import { MatchDetailPageClient } from "./match-detail-page-client"

export const metadata: Metadata = {
  title: "Match | Onchain World Cup 2026",
  description: "Vote with ETH on this match in the Onchain World Cup 2026 tournament on Base.",
  robots: { index: false, follow: true },
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params

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
              { "@type": "ListItem", "position": 2, "name": "Tournament", "item": "https://app.onchainworldcup.xyz/tournament" },
              { "@type": "ListItem", "position": 3, "name": "Match" },
            ],
          }),
        }}
      />
      <MatchDetailPageClient matchId={matchId} />
    </>
  )
}
