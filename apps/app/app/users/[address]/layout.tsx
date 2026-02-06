import { Metadata } from 'next'

type Props = {
  params: Promise<{ address: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params

  // Shorten address for display
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return {
    title: `${shortAddress} - Player Stats | Onchain World Cup`,
    description: `View voting stats for ${shortAddress} on Onchain World Cup 2026. Track ETH spent, favorite country, total votes, and global ranking.`,
    openGraph: {
      title: `${shortAddress} Stats - Onchain World Cup 2026`,
      description: `Player statistics: ETH spent, favorite country, votes, and global rank. Vote with crypto on Base Network.`,
      type: 'profile',
      url: `https://app.onchainworldcup.xyz/users/${address}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${shortAddress} - Onchain World Cup Stats`,
      description: `View ${shortAddress}'s voting stats, favorite country, and global ranking.`,
    },
  }
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children
}
