import type { Metadata } from "next"
import Link from "next/link"
import { TeamDetailPageClient } from "./team-detail-page-client"
import countriesData from "@/data/countries.json"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>
}): Promise<Metadata> {
  const { teamId } = await params
  const idLower = teamId.toLowerCase()

  const country = countriesData.find(
    (c) =>
      c.code.toLowerCase() === idLower ||
      c.name.toLowerCase().replace(/\s+/g, "-") === idLower,
  )

  if (!country) {
    return {
      title: "Team | Onchain World Cup 2026",
      description: "View team stats and standings in the Onchain World Cup 2026 on Base.",
    }
  }

  return {
    title: `${country.name} ${country.flagEmoji} | Onchain World Cup 2026`,
    description: `View ${country.name}'s stats, standings, and votes in the Onchain World Cup 2026. Follow their journey to qualify for the tournament on Base.`,
    alternates: {
      canonical: `https://app.onchainworldcup.xyz/teams/${teamId}`,
    },
  }
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params
  const idLower = teamId.toLowerCase()

  const country = countriesData.find(
    (c) =>
      c.code.toLowerCase() === idLower ||
      c.name.toLowerCase().replace(/\s+/g, "-") === idLower,
  )

  const teamName = country?.name ?? teamId

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
              { "@type": "ListItem", "position": 2, "name": "Teams", "item": "https://app.onchainworldcup.xyz/teams" },
              { "@type": "ListItem", "position": 3, "name": teamName },
            ],
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="px-4 pt-4 text-xs text-muted-foreground flex items-center gap-1">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/teams" className="hover:text-foreground transition-colors">Teams</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="text-foreground">{teamName}</span>
      </nav>
      <TeamDetailPageClient teamId={teamId} />
    </>
  )
}
