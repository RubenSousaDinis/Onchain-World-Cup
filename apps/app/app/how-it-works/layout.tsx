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
  return <>{children}</>
}
