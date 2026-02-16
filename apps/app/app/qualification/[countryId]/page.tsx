import type { Metadata } from "next"
import Link from "next/link"
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
  const idLower = countryId.toLowerCase()

  const country = countriesData.find(
    (c) =>
      c.code.toLowerCase() === idLower ||
      c.name.toLowerCase().replace(/\s+/g, "-") === idLower,
  )

  const countryName = country?.name ?? countryId

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
              { "@type": "ListItem", "position": 3, "name": countryName },
            ],
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="px-4 pt-4 text-xs text-muted-foreground flex items-center gap-1">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/qualification" className="hover:text-foreground transition-colors">Qualification</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="text-foreground">{countryName}</span>
      </nav>
      <CountryDetailPageClient countryId={countryId} />
    </>
  )
}
