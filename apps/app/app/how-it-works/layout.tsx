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
              { "@type": "ListItem", "position": 2, "name": "How It Works", "item": "https://app.onchainworldcup.xyz/how-it-works" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does the Qualification Phase work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "64 countries compete simultaneously for 48 spots in the tournament. Users vote for their favourite countries using ETH on the Base blockchain. There are no match results — pure community voting determines which nations advance. The top 48 countries by total vote count qualify when the phase ends."
                }
              },
              {
                "@type": "Question",
                "name": "How does voting work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You vote by sending ETH to the smart contract on Base. Each vote for a country costs ETH, with prices starting at 0.001 ETH and increasing linearly by 0.0005 ETH per additional vote for that same country. Gas fees on Base are very low (typically under $0.01), so almost all of what you spend is the vote price itself. You can vote for multiple countries and vote as many times as you like."
                }
              },
              {
                "@type": "Question",
                "name": "What is the Early Bird Advantage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Voting costs increase over time through weekly boost fees. Participating early means you pay less per vote than later supporters. This rewards conviction — fans who back their country from the start get more votes for their ETH than those who join later. Vote early to lock in the best rates before fees rise."
                }
              },
              {
                "@type": "Question",
                "name": "What are Achievements and Levels?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Achievements are milestones you unlock by participating: cast your first vote (10 pts), vote for 10 countries (20 pts), become an Early Bird (75 pts), reach the top 10 on the leaderboard (200 pts), and more. Points are permanent and accumulate across all phases. Your level (1–6: Youth Player, Reserve, Regular, Key Player, Star Player, World Class) is determined by your total points and shown on the leaderboard and your public profile."
                }
              },
              {
                "@type": "Question",
                "name": "How does the Tournament Phase work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "After qualification, the 48 qualified nations are organised into groups mirroring the traditional World Cup format. Real head-to-head matches begin — you vote for either team (or both) in each match. The team with more votes wins and advances. Each match has its own prize pool: 90% goes to voters of the winning team proportionally to their votes, with a 10% platform fee."
                }
              },
              {
                "@type": "Question",
                "name": "How are match prizes distributed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Each match has an independent prize pool made up of all ETH voted in that match. When the match ends, 90% of the net pool is distributed among voters of the winning team, proportional to how many votes each supporter cast. If you voted 10 times for the winner out of 100 total winning votes, you receive 10% of the 90% payout. The 10% platform fee is deducted before distribution. All payouts are handled automatically by the smart contract."
                }
              },
              {
                "@type": "Question",
                "name": "Can the Onchain World Cup winner differ from the real FIFA World Cup winner?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes — that is entirely the point. The Onchain World Cup runs as a parallel, community-driven competition. Results are determined entirely by onchain votes, not real-world match outcomes. A smaller footballing nation with a passionate global fan base could defeat traditional powerhouses. The winner is whoever the community collectively backs with ETH."
                }
              }
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
