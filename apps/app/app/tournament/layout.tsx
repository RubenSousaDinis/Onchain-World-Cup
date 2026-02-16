import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tournament | Onchain World Cup 2026",
  description: "Follow the Onchain World Cup 2026 tournament bracket. Group stage and knockout rounds decided by community ETH voting on Base.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/tournament",
  },
}

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
