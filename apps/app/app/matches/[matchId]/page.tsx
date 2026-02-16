import type { Metadata } from "next"
import Link from "next/link"
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
      <nav aria-label="Breadcrumb" className="px-4 pt-4 text-xs text-muted-foreground flex items-center gap-1">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/tournament" className="hover:text-foreground transition-colors">Tournament</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="text-foreground">Match</span>
      </nav>
      <MatchDetailPageClient matchId={matchId} />
    </>
  )
}
