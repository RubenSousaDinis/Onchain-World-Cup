import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Teams Overview | Onchain World Cup 2026",
  description:
    "Browse all national teams competing in the Onchain World Cup 2026 on Base. Stats, standings, and upcoming matches.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/teams",
  },
  // noindex until real team data replaces mock data
  robots: { index: false, follow: true },
  openGraph: {
    title: "Teams Overview | Onchain World Cup 2026",
    description: "Browse all national teams competing in the Onchain World Cup 2026 on Base.",
    url: "https://app.onchainworldcup.xyz/teams",
    siteName: "Onchain World Cup",
    locale: "en_US",
    type: "website",
  },
}

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
