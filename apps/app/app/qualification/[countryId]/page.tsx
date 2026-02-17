import type { Metadata } from "next"
import { CountryDetailPageClient } from "./country-detail-page-client"
import countriesData from "@/data/countries.json"

export const revalidate = 300

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
  const idLower = countryId.toLowerCase()

  const country = countriesData.find(
    (c) =>
      c.code.toLowerCase() === idLower ||
      c.name.toLowerCase().replace(/\s+/g, "-") === idLower,
  )

  const countryName = country?.name ?? countryId

  // Fetch country stats server-side for SEO-visible content
  let stats: { total_votes?: number; total_eth?: string; rank?: number; qualified?: boolean } | null = null
  if (country) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz"
    try {
      const statsRes = await fetch(`${baseUrl}/api/qualification/countries/${country.code}`, { next: { revalidate: 300 } })
      const statsJson = statsRes.ok ? await statsRes.json() : null
      stats = statsJson?.data ?? null
    } catch {
      // stats are optional — silently fail
    }
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
              { "@type": "ListItem", "position": 2, "name": "Qualification", "item": "https://app.onchainworldcup.xyz/qualification" },
              {
                "@type": "ListItem",
                "position": 3,
                "name": countryName,
                ...(country ? { "item": `https://app.onchainworldcup.xyz/qualification/${country.code.toLowerCase()}` } : {}),
              },
            ],
          }),
        }}
      />
      {stats && (
        <div className="px-4 pt-4 pb-2 text-sm text-muted-foreground">
          {countryName} is currently ranked #{stats.rank ?? "—"} with {stats.total_votes?.toLocaleString() ?? 0} votes
          and {parseFloat(stats.total_eth || "0").toFixed(4)} ETH in the Onchain World Cup 2026 qualification on Base.
          {stats.qualified && " ✓ Qualified."}
        </div>
      )}
      <CountryDetailPageClient countryId={countryId} countryName={countryName} />
    </>
  )
}
