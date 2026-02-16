import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leaderboard | Top Voters — Onchain World Cup 2026",
  description:
    "Top supporters ranked by ETH spent, votes cast, and early bird status in the Onchain World Cup 2026 on Base.",
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
  return <>{children}</>
}
