import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Match Schedule | Onchain World Cup 2026",
  description: "View the full match schedule for the Onchain World Cup 2026 tournament on Base.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/schedule",
  },
  // noindex until real schedule data replaces mock data
  robots: { index: false, follow: true },
}

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
