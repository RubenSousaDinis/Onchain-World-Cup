import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qualification Leaderboard | Onchain World Cup 2026',
  description: 'Vote for your country in World Cup 2026 qualification with ETH on Base Network. Top 48 countries qualify. Early voters get better rates with dynamic pricing.',
  openGraph: {
    title: 'World Cup 2026 Qualification - Top 3 Countries',
    description: 'Vote now with ETH on Base Network. Support your country in qualification voting. Top 48 qualify!',
    type: 'website',
    url: 'https://app.onchainworldcup.xyz/qualification',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Cup 2026 Qualification Leaderboard',
    description: 'Vote with ETH on Base. Top 48 countries qualify. Dynamic pricing - early voters get better rates.',
  },
}

export default function QualificationLayout({ children }: { children: React.ReactNode }) {
  return children
}
