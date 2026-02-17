import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tournament | Onchain World Cup 2026",
  description: "Follow the Onchain World Cup 2026 tournament bracket. Group stage and knockout rounds decided by community ETH voting on Base.",
  alternates: {
    canonical: "https://app.onchainworldcup.xyz/tournament",
  },
  openGraph: {
    title: "Tournament | Onchain World Cup 2026",
    description: "Follow the Onchain World Cup 2026 tournament bracket. Group stage and knockout rounds decided by community ETH voting on Base.",
    url: "https://app.onchainworldcup.xyz/tournament",
    siteName: "Onchain World Cup",
    locale: "en_US",
    type: "website",
  },
}

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://app.onchainworldcup.xyz/" },
              { "@type": "ListItem", "position": 2, "name": "Tournament", "item": "https://app.onchainworldcup.xyz/tournament" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": "Onchain World Cup 2026 — Tournament",
            "description": "The 48 qualified nations compete in group stage and knockout rounds. Match outcomes decided by community ETH voting on Base blockchain.",
            "startDate": "2026-06-05",
            "endDate": "2026-06-11",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
              "@type": "VirtualLocation",
              "url": "https://app.onchainworldcup.xyz/tournament",
            },
            "organizer": {
              "@type": "Organization",
              "name": "Onchain World Cup",
              "url": "https://onchainworldcup.xyz/",
            },
            "sport": "Association Football",
            "url": "https://app.onchainworldcup.xyz/tournament",
          }),
        }}
      />
      {children}
    </>
  )
}
