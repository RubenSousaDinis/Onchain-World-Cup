import type { Metadata } from "next"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"

export const metadata: Metadata = {
  title: "FAQ | Onchain World Cup",
  description: "Frequently asked questions about Onchain World Cup — ETH voting, Base blockchain, prize distribution, and how the tournament works.",
  alternates: { canonical: "/faq" },
}

const faqs = [
  {
    question: "What is Onchain World Cup?",
    answer: "Onchain World Cup is a community-driven football tournament that runs entirely on the Base blockchain. Fans vote with ETH to decide which 48 of 192 national teams qualify for the tournament. All voting logic and prize distribution are governed by open-source smart contracts — no central authority controls the outcome.",
  },
  {
    question: "How does pricing work?",
    answer: "Qualification uses linear pricing. The first vote for any country costs 0.001 ETH, and each subsequent vote for that same country increases by 0.0005 ETH. Each country maintains its own independent price — voting for one country does not affect the price of another. Voting early is always cheaper, rewarding conviction over bandwagoning.",
  },
  {
    question: "How many countries compete and how many qualify?",
    answer: "192 nations are eligible to compete in the Onchain World Cup qualification phase. The top 48 countries by total vote count advance to the group stage and knockout bracket. Any country that does not reach the top 48 does not qualify, and supporters of those countries do not receive a payout.",
  },
  {
    question: "How are prizes distributed?",
    answer: "All ETH collected across all countries forms one unified prize pool. When qualification ends, supporters of the 48 qualified countries share 90% of that pool proportionally: your payout equals (your votes for qualified countries ÷ total votes across all qualified countries) × 90% of the prize pool. The remaining 10% is a platform fee. All payouts are handled automatically by the smart contract.",
  },
  {
    question: "What blockchain is this on?",
    answer: "Onchain World Cup is built on Base, an Ethereum Layer 2 network developed by Coinbase. Base offers very low transaction fees — typically under $0.01 per vote — fast confirmations, and full Ethereum security. You need ETH on the Base network to vote. You can bridge ETH from Ethereum mainnet or buy directly on Base via Coinbase or other supported exchanges.",
  },
  {
    question: "Is this gambling?",
    answer: "No. There are no odds, no house edge based on predicted outcomes, and no betting on real-world sports results. The Onchain World Cup is a community support mechanism where prizes are redistributed among supporters of the teams the community collectively chose to qualify. The outcome depends entirely on aggregate fan participation. That said, ETH spent on countries that do not qualify is not refunded — only commit ETH you are comfortable losing.",
  },
  {
    question: "Can I vote more than once?",
    answer: "Yes. There is no limit on the number of votes per wallet. You can vote multiple times for the same country — each additional vote costs progressively more ETH — or spread votes across multiple countries to increase your share of the prize pool if several qualify.",
  },
  {
    question: "Is this related to the real FIFA World Cup?",
    answer: "Onchain World Cup is an independent, community-driven tournament running parallel to FIFA World Cup 2026. Results are determined by ETH voting, not real match outcomes. A smaller nation with a passionate global fanbase can defeat any traditional football powerhouse. The Onchain World Cup champion is crowned before the real tournament concludes.",
  },
]

export default function FAQPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Onchain World Cup — Frequently Asked Questions",
    "url": "https://app.onchainworldcup.xyz/faq",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="flex flex-1">
        <RetroSidebar />
        <MobileNav />

        <main id="main-content" className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-3xl">
          <div className="cm-panel rounded-sm overflow-hidden mb-4 lg:mb-6 p-6 lg:p-8">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2 cm-highlight">FAQ</h1>
            <p className="text-sm text-foreground/60">Frequently asked questions about Onchain World Cup</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <section key={i} className="cm-panel rounded-sm overflow-hidden p-5 lg:p-6">
                <h2 className="font-bold text-sm lg:text-base mb-2">{faq.question}</h2>
                <p className="text-sm text-foreground/70 leading-relaxed">{faq.answer}</p>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
