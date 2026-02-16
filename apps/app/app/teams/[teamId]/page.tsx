import type { Metadata } from "next"
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
  return <TeamDetailPageClient teamId={teamId} />
}
