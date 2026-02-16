import type { Metadata } from "next"
import { CountryDetailPageClient } from "./country-detail-page-client"
import countriesData from "@/data/countries.json"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryId: string }>
}): Promise<Metadata> {
  const { countryId } = await params
  const idLower = countryId.toLowerCase()

  const country = countriesData.find(
    (c) =>
      c.code.toLowerCase() === idLower ||
      c.name.toLowerCase().replace(/\s+/g, "-") === idLower,
  )

  if (!country) {
    return {
      title: "Country | Onchain World Cup 2026 Qualification",
      description: "Vote for this country in World Cup 2026 qualification on Base.",
    }
  }

  return {
    title: `Vote for ${country.name} ${country.flagEmoji} | Onchain World Cup 2026`,
    description: `Support ${country.name} in World Cup 2026 qualification. Vote with ETH on Base. Only the top 48 countries qualify for the Onchain World Cup.`,
    alternates: {
      canonical: `https://app.onchainworldcup.xyz/qualification/${countryId}`,
    },
  }
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ countryId: string }>
}) {
  const { countryId } = await params
  return <CountryDetailPageClient countryId={countryId} />
}
