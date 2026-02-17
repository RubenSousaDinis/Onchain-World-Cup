import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Statistics | Onchain World Cup 2026",
  description:
    "Live stats for Onchain World Cup 2026: total ETH prize pool, votes cast, active voters, and qualifying countries on Base.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/stats",
  },
  openGraph: {
    title: "Live Statistics | Onchain World Cup 2026",
    description: "Live stats for Onchain World Cup 2026: total ETH prize pool, votes cast, active voters, and qualifying countries on Base.",
    url: "https://app.onchainworldcup.xyz/stats",
    siteName: "Onchain World Cup",
    locale: "en_US",
    type: "website",
  },
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
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
              { "@type": "ListItem", "position": 2, "name": "Statistics", "item": "https://app.onchainworldcup.xyz/stats" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "Onchain World Cup 2026 — Live Qualification Statistics",
            "description": "Real-time ETH voting statistics for the Onchain World Cup 2026 qualification phase on Base blockchain.",
            "url": "https://app.onchainworldcup.xyz/stats",
            "creator": { "@type": "Organization", "name": "Onchain World Cup", "url": "https://onchainworldcup.xyz/" },
            "dateModified": "2026-02-17",
            "inLanguage": "en",
          }),
        }}
      />
      {children}
    </>
  )
}
