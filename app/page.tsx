import { redirect } from "next/navigation"

export const metadata = {
  title: "Crypto World Cup 2026 | Vote on World Cup Matches with ETH",
  description:
    "Vote on World Cup 2026 matches with ETH. Real-time crypto betting on Base network with dynamic pricing.",
  openGraph: {
    title: "Crypto World Cup 2026 | Vote on World Cup Matches with ETH",
    description: "Vote on World Cup 2026 matches with ETH on Base network.",
  },
}

export default function HomePage() {
  redirect("/tournament")
}
