import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Teams Overview | Onchain World Cup 2026",
  description:
    "Browse all national teams competing in the Onchain World Cup 2026 on Base. Stats, standings, and upcoming matches.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/teams",
  },
}

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
