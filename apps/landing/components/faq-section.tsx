import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Is this a prediction market?",
      answer:
        "No. Onchain World Cup is a community voting tournament, not a prediction market. You are not betting on the outcome of real FIFA matches or trying to predict which country will win the actual World Cup. Instead, you are directly supporting national teams with ETH — your votes determine which countries qualify for and advance through the Onchain World Cup's own independent bracket. Think of it as backing your favourite team, not forecasting a sports result.",
    },
    {
      question: "Can the onchain winner differ from the real World Cup winner?",
      answer:
        "Yes — and that's entirely the point. The Onchain World Cup is a separate, community-driven competition running parallel to the real FIFA World Cup 2026. The winner is determined by collective fan support expressed through ETH voting, not by on-pitch performance. A smaller footballing nation with a passionate global fanbase could easily defeat a traditional football powerhouse. The results reflect which communities show up, engage early, and back their team with conviction.",
    },
    {
      question: "Are there real matches during the qualification phase?",
      answer:
        "No. The qualification phase is purely about fan support — there are no simulated or real match results involved. All 211 eligible nations compete simultaneously, and the top 48 countries by total vote count advance to the tournament bracket. Votes are cast at any time during the qualification window. There are no head-to-head matchups in this phase; every country is simply accumulating community support. The cutoff is determined when qualification ends, and the 48 countries with the most votes move forward.",
    },
    {
      question: "How does pricing work in qualification?",
      answer:
        "Qualification uses linear pricing. The first vote for any country costs 0.001 ETH, and each subsequent vote for that same country increases by 0.0005 ETH. So the second vote costs 0.0015 ETH, the third costs 0.002 ETH, and so on. Importantly, each country maintains its own independent vote count — voting for Brazil does not affect the price of voting for Argentina. Voting early for your chosen country is always cheaper, which rewards conviction over bandwagoning. Prices are set by the smart contract and cannot be changed retroactively.",
    },
    {
      question: "How are prizes distributed in qualification?",
      answer:
        "All ETH collected across all 211 countries forms one unified qualification prize pool. When qualification ends, supporters of the 48 qualified countries share that pool proportionally based on vote count: your payout = (your votes cast for qualified countries ÷ total votes across all qualified countries) × net prize pool. The platform fee (currently up to 10%) is deducted before distribution. You can vote for multiple countries to spread your support — votes for countries that do not qualify do not earn a payout. All payouts are handled automatically by the smart contract with no manual intervention.",
    },
    {
      question: "Can the platform fee change?",
      answer:
        "Yes. The platform fee is set by the smart contract owner and can be adjusted within a hard cap of 20%. Fee changes are transparent — they are recorded on-chain and only apply to new votes submitted after the change takes effect. All existing votes are unaffected. The current fee structure is: up to 10% during qualification. Any fee change will be announced on our X and Farcaster channels in advance. We may offer promotional zero-fee windows during early phases to encourage participation.",
    },
    {
      question: "Why end Season 1 before the real World Cup?",
      answer:
        "To keep the Onchain World Cup a self-contained, community-driven event with its own narrative and clear endpoints. Running Season 1 on its own timeline — rather than in lockstep with FIFA — means results are not influenced by real-world match outcomes, and it avoids confusion between the two competitions. It also lets us iterate, improve the platform, and launch Season 2 with better mechanics and broader community reach before the real tournament concludes.",
    },
    {
      question: "Why does voting cost ETH?",
      answer:
        "ETH-based voting solves several problems that plague free voting systems. First, it eliminates spam and sybil attacks — creating thousands of fake wallets is expensive when each vote costs real money. Second, it creates genuine skin-in-the-game: supporters who back a country early and at lower prices are rewarded proportionally if that country qualifies. Third, the accumulated ETH forms a real prize pool that is distributed back to the community, making participation financially meaningful. Gas fees on Base are very low (typically under $0.01), so the ETH you spend is almost entirely the vote price itself.",
    },
    {
      question: "Can I vote more than once?",
      answer:
        "Yes. There is no limit on the number of votes per wallet. You can vote multiple times for the same country — each additional vote will cost progressively more ETH due to linear pricing — or you can spread votes across multiple countries. Voting for several countries that you believe will qualify is a valid strategy to increase your share of the prize pool. Keep in mind that each vote is an irreversible on-chain transaction; there are no refunds if a country you voted for does not qualify.",
    },
    {
      question: "Is this gambling?",
      answer:
        "No. There are no odds, no house edge based on predicted outcomes, and no betting on real-world sports results. The Onchain World Cup is a community support mechanism where you back national teams with ETH, and prizes are redistributed among supporters of the teams that the community collectively chose to qualify. The outcome depends entirely on aggregate fan participation, not on any real-world event or random number generator. That said, there is financial risk: ETH spent on countries that do not qualify is not refunded. Only commit ETH you are comfortable losing entirely.",
    },
    {
      question: "What chain is this on?",
      answer:
        "Onchain World Cup is built on Base, an Ethereum Layer 2 network developed by Coinbase. Base offers very low transaction fees (typically under $0.01 per vote), fast confirmations, and the full security guarantees of Ethereum. The platform is currently live on Base Sepolia testnet, with mainnet launching mid-March 2026. All smart contracts are open source and publicly verifiable on Basescan. You will need ETH on the Base network to vote — you can bridge ETH from Ethereum mainnet or buy directly on Base via Coinbase or other supported exchanges.",
    },
    {
      question: "Where can I follow updates?",
      answer:
        "Follow us on X (Twitter) at @OnchainC29697 for real-time announcements, phase updates, and leaderboard highlights. We are also active on Farcaster at /onchainworldcup for onchain-native discussions and Farcaster Mini App updates. Find our NFT drops and collectibles on Zora at @onchainworldcup. For direct enquiries or partnership proposals, email onchainworldcup@gmail.com. All major announcements (phase transitions, fee changes, new features) will be posted across all channels simultaneously.",
    },
  ]

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer,
            },
          })),
        }),
      }}
    />
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-primary">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
    </>
  )
}
