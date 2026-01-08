import HomePageClient from "./HomePageClient"

export const metadata = {
  title: "Live Matches | Crypto World Cup 2026",
  description:
    "Vote on live World Cup 2026 matches with ETH. Real-time crypto betting on Base network with dynamic pricing.",
  openGraph: {
    title: "Live Matches | Crypto World Cup 2026",
    description: "Vote on live World Cup 2026 matches with ETH.",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
