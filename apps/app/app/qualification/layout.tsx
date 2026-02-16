import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "World Cup 2026 Qualification Voting | Onchain World Cup",
  description:
    "Vote with ETH to qualify countries for the Onchain World Cup 2026. Top 48 of 64 nations advance. Dynamic pricing — early voters pay less.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/qualification",
  },
  openGraph: {
    title: "World Cup 2026 Qualification | Onchain World Cup",
    description: "Vote now with ETH on Base Network. Support your country in qualification voting. Top 48 qualify!",
    type: "website",
    url: "https://app.onchainworldcup.xyz/qualification",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Qualification Leaderboard",
    description: "Vote with ETH on Base. Top 48 countries qualify. Dynamic pricing — early voters get better rates.",
  },
}

export default function QualificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
