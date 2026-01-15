import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Is this a prediction market?",
      answer: "No. You are not predicting real match results. You are supporting teams in an onchain tournament.",
    },
    {
      question: "Can the onchain winner differ from the real World Cup winner?",
      answer:
        "Yes — and that's the point. The Onchain World Cup reflects community support, not real-world performance.",
    },
    {
      question: "Are there real matches during the qualification phase?",
      answer: "No. Qualification is purely about fan support.",
    },
    {
      question: "Why end Season 1 before the real World Cup?",
      answer: "To avoid confusion and keep narratives separate. Season 1 is its own event.",
    },
    {
      question: "Why does voting cost ETH?",
      answer: "ETH prevents spam, sybil attacks, and fake coordination. It ensures votes are meaningful.",
    },
    {
      question: "Can I vote more than once?",
      answer: "Yes. Multiple votes per wallet are allowed. Voting costs increase over time.",
    },
    {
      question: "Is this gambling?",
      answer: "No. There are no odds, no predictions, and no betting on real outcomes.",
    },
    {
      question: "What chain is this on?",
      answer: "Built on Base. All contracts are public and verifiable.",
    },
    {
      question: "Where can I follow updates?",
      answer:
        "X: https://x.com/OnchainC29697 | Farcaster: https://farcaster.xyz/onchainworldcup | Zora: https://zora.co/@onchainworldcup",
    },
  ]

  return (
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
  )
}
