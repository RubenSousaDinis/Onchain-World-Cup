import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How It Works | Onchain World Cup 2026",
  description:
    "How the Onchain World Cup works: 3 phases, dynamic ETH pricing, achievements, and how winners share the prize pool on Base.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/how-it-works",
  },
  openGraph: {
    title: "How It Works | Onchain World Cup 2026",
    description: "How the Onchain World Cup works: 3 phases, dynamic ETH pricing, achievements, and how winners share the prize pool on Base.",
    url: "https://app.onchainworldcup.xyz/how-it-works",
    siteName: "Onchain World Cup",
    locale: "en_US",
    type: "website",
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
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
              { "@type": "ListItem", "position": 2, "name": "How It Works", "item": "https://app.onchainworldcup.xyz/how-it-works" },
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
