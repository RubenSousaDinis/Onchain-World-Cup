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

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </>
  )
}
