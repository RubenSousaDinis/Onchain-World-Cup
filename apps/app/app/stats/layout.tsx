import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Statistics | Onchain World Cup 2026",
  description:
    "Live stats for Onchain World Cup 2026: total ETH prize pool, votes cast, active voters, and qualifying countries on Base.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/stats",
  },
  openGraph: {
    title: "Statistics | Onchain World Cup 2026",
    description: "Live stats for Onchain World Cup 2026: total ETH prize pool, votes cast, active voters, and qualifying countries on Base.",
    url: "https://app.onchainworldcup.xyz/stats",
    siteName: "Onchain World Cup",
    locale: "en_US",
    type: "website",
  },
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
