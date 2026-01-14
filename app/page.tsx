import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Onchain World Cup | The World Cup, decided onchain",
  description:
    "Support your country. Coordinate with fans worldwide. Crown the onchain champion — before the real World Cup even starts.",
  openGraph: {
    title: "Onchain World Cup | The World Cup, decided onchain",
    description:
      "Support your country. Coordinate with fans worldwide. Crown the onchain champion — before the real World Cup even starts.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 800,
        alt: "Onchain World Cup",
      },
    ],
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border sticky top-0 z-50 bg-[var(--sidebar-bg)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[var(--highlight-yellow)] tracking-tight">
            ONCHAIN WORLD CUP
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-sm text-foreground hover:text-[var(--highlight-yellow)] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#phases"
              className="text-sm text-foreground hover:text-[var(--highlight-yellow)] transition-colors"
            >
              Phases
            </Link>
            <Link
              href="#faq"
              className="text-sm text-foreground hover:text-[var(--highlight-yellow)] transition-colors"
            >
              FAQ
            </Link>
            <Link href="/qualification">
              <Button
                variant="outline"
                size="sm"
                className="border-foreground text-foreground hover:bg-[var(--nav-purple)] bg-transparent"
              >
                App
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://x.com/OnchainC29697"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-[var(--highlight-yellow)] transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://farcaster.xyz/onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-[var(--highlight-yellow)] transition-colors"
              aria-label="Farcaster"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.24 5.18l-2.1-2.1c-.6-.6-1.56-.6-2.16 0L12 5.06 10.02 3.08c-.6-.6-1.56-.6-2.16 0l-2.1 2.1c-.6.6-.6 1.56 0 2.16L7.74 9.3 5.76 11.28c-.6.6-.6 1.56 0 2.16l2.1 2.1c.6.6 1.56.6 2.16 0L12 13.56l1.98 1.98c.6.6 1.56.6 2.16 0l2.1-2.1c.6-.6.6-1.56 0-2.16l-1.98-1.98 1.98-1.98c.6-.6.6-1.56 0-2.16zM12 12l-1.98-1.98L12 8.04l1.98 1.98L12 12z" />
              </svg>
            </a>
            <a
              href="https://zora.co/@onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-[var(--highlight-yellow)] transition-colors"
              aria-label="Zora"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" fill="var(--background)" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">Onchain World Cup</h1>
          <p className="text-2xl md:text-3xl text-[var(--highlight-yellow)] mb-8 font-semibold">
            The World Cup, decided onchain.
          </p>
          <div className="text-lg md:text-xl text-foreground/90 mb-10 leading-relaxed space-y-2">
            <p>Support your country.</p>
            <p>Coordinate with fans worldwide.</p>
            <p>Crown the onchain champion — before the real World Cup even starts.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/qualification">
              <Button
                size="lg"
                className="bg-[var(--highlight-yellow)] text-black hover:bg-[var(--highlight-lime)] text-lg px-8 py-6"
              >
                Join Qualification Phase
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-foreground text-foreground hover:bg-[var(--nav-purple)] text-lg px-8 py-6 bg-transparent"
              >
                How it works
              </Button>
            </Link>
          </div>

          <Card className="bg-[var(--nav-purple)] border-2 border-[var(--highlight-yellow)] p-6">
            <p className="text-[var(--highlight-yellow)] text-lg font-semibold flex items-start gap-2">
              <span className="text-2xl">⚠️</span>
              <span>
                This is NOT a prediction market.
                <br />
                You&apos;re not betting on real match results.
              </span>
            </p>
          </Card>
        </div>
      </section>

      {/* What Is Section */}
      <section id="how-it-works" className="py-16 bg-[var(--sidebar-bg)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[var(--highlight-yellow)] mb-8 text-center">
              What Is Onchain World Cup
            </h2>
            <div className="space-y-6 text-foreground/90 text-lg leading-relaxed">
              <p>Onchain World Cup is a community-driven football tournament where fans decide the winner — onchain.</p>
              <div className="cm-panel p-8 space-y-4">
                <p className="font-semibold text-foreground">There are:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>No odds</li>
                  <li>No predictions</li>
                  <li>No bookmakers</li>
                </ul>

                <p className="font-semibold text-foreground pt-4">Instead:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Fans vote for the national teams they support</li>
                  <li>Teams advance based on community backing</li>
                  <li>
                    The most supported team becomes the{" "}
                    <span className="text-[var(--highlight-yellow)] font-bold">Onchain World Cup Champion</span>
                  </li>
                </ul>
              </div>
              <p className="text-center text-xl font-semibold text-[var(--highlight-lime)] pt-4">
                A country can win the Onchain World Cup and still get eliminated early in the real one.
              </p>
              <p className="text-center text-lg text-foreground">That&apos;s intentional.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Exists */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-[var(--highlight-yellow)] mb-8">Why This Exists</h2>
            <div className="space-y-6 text-lg leading-relaxed">
              <p className="text-2xl font-semibold text-foreground">
                Football is emotional.
                <br />
                Crypto is coordination.
              </p>
              <p className="text-xl text-[var(--highlight-lime)] font-semibold">Onchain World Cup combines both.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                <Card className="cm-panel p-6">
                  <p className="text-foreground font-semibold">National pride</p>
                </Card>
                <Card className="cm-panel p-6">
                  <p className="text-foreground font-semibold">Social coordination</p>
                </Card>
                <Card className="cm-panel p-6">
                  <p className="text-foreground font-semibold">Transparent rules</p>
                </Card>
                <Card className="cm-panel p-6">
                  <p className="text-foreground font-semibold">Global participation</p>
                </Card>
              </div>
              <p className="text-2xl text-[var(--highlight-yellow)] font-bold pt-8">
                If enough people support your team — it wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Phases */}
      <section id="phases" className="py-16 bg-[var(--sidebar-bg)]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-[var(--highlight-yellow)] mb-12 text-center">Tournament Phases</h2>

            {/* Season 1 */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-[var(--highlight-lime)] mb-8">
                Season 1 — Onchain World Cup (Current)
              </h3>

              <div className="space-y-6">
                <Card className="cm-panel p-8">
                  <h4 className="text-2xl font-bold text-[var(--highlight-yellow)] mb-4">
                    Phase 1: Qualification Phase
                  </h4>
                  <ul className="space-y-2 text-foreground/90 text-lg list-disc list-inside pl-4">
                    <li>Launch: mid-February</li>
                    <li>Fans vote for national teams</li>
                    <li>No matches yet</li>
                    <li className="text-[var(--highlight-yellow)] font-semibold">The top 48 teams qualify</li>
                  </ul>
                </Card>

                <Card className="cm-panel p-8">
                  <h4 className="text-2xl font-bold text-[var(--highlight-yellow)] mb-4">
                    Phase 2: Onchain World Cup Tournament
                  </h4>
                  <ul className="space-y-2 text-foreground/90 text-lg list-disc list-inside pl-4">
                    <li>Group stage + knockout rounds</li>
                    <li>Matches exist only onchain</li>
                    <li>Community voting decides winners</li>
                  </ul>
                </Card>

                <Card className="cm-panel p-8">
                  <h4 className="text-2xl font-bold text-[var(--highlight-yellow)] mb-4">Final</h4>
                  <ul className="space-y-2 text-foreground/90 text-lg list-disc list-inside pl-4">
                    <li>Onchain World Cup Final</li>
                    <li className="text-[var(--highlight-yellow)] font-semibold">
                      Ends 1 week before the real World Cup
                    </li>
                  </ul>
                  <p className="mt-6 text-center text-xl font-semibold text-[var(--highlight-lime)]">
                    The champion is crowned before the first real kick-off.
                  </p>
                </Card>
              </div>
            </div>

            {/* Season 2 */}
            <div>
              <h3 className="text-3xl font-bold text-[var(--highlight-lime)] mb-8">
                Season 2 — Real World Cup (Coming Next)
              </h3>

              <Card className="cm-panel p-8">
                <p className="text-foreground/90 text-lg mb-6">After Season 1 concludes:</p>
                <ul className="space-y-3 text-foreground/90 text-lg list-disc list-inside pl-4">
                  <li>The same mechanics are reused</li>
                  <li>
                    Teams now match the <span className="font-semibold">real World Cup tournament</span>
                  </li>
                  <li>Fans vote as real matches happen</li>
                  <li>Season 2 starts once the real World Cup begins</li>
                </ul>
                <div className="mt-8 pt-8 border-t border-border space-y-2 text-center">
                  <p className="text-xl font-semibold text-[var(--highlight-yellow)]">Season 1 builds the community.</p>
                  <p className="text-xl font-semibold text-[var(--highlight-lime)]">
                    Season 2 brings it into the real tournament.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How Voting Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[var(--highlight-yellow)] mb-8 text-center">How Voting Works</h2>
            <Card className="cm-panel p-8">
              <ul className="space-y-4 text-foreground/90 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--highlight-yellow)] font-bold text-xl">→</span>
                  <span>Votes are made using ETH</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--highlight-yellow)] font-bold text-xl">→</span>
                  <span>Multiple votes per wallet are allowed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--highlight-yellow)] font-bold text-xl">→</span>
                  <span>Voting fees increase over time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--highlight-yellow)] font-bold text-xl">→</span>
                  <span>Early participation matters more</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--highlight-yellow)] font-bold text-xl">→</span>
                  <span>Anti-sybil protections are enforced</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--highlight-yellow)] font-bold text-xl">→</span>
                  <span>All logic lives in smart contracts</span>
                </li>
              </ul>
              <div className="mt-8 pt-8 border-t border-border text-center space-y-2">
                <p className="text-xl font-semibold text-[var(--highlight-lime)]">No admin control.</p>
                <p className="text-xl font-semibold text-[var(--highlight-lime)]">No hidden rules.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Onchain */}
      <section className="py-16 bg-[var(--sidebar-bg)]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-[var(--highlight-yellow)] mb-12 text-center">Why Onchain</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cm-panel p-8 text-center">
                <h3 className="text-xl font-bold text-[var(--highlight-yellow)] mb-3">Open & permissionless</h3>
                <p className="text-foreground/80">Anyone can participate</p>
              </Card>
              <Card className="cm-panel p-8 text-center">
                <h3 className="text-xl font-bold text-[var(--highlight-yellow)] mb-3">Global by default</h3>
                <p className="text-foreground/80">No borders, no restrictions</p>
              </Card>
              <Card className="cm-panel p-8 text-center">
                <h3 className="text-xl font-bold text-[var(--highlight-yellow)] mb-3">Verifiable outcomes</h3>
                <p className="text-foreground/80">All votes tracked onchain</p>
              </Card>
              <Card className="cm-panel p-8 text-center">
                <h3 className="text-xl font-bold text-[var(--highlight-yellow)] mb-3">Social coordination</h3>
                <p className="text-foreground/80">Beats prediction</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Crypto-Native Socials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-[var(--highlight-yellow)] mb-8">Built for Crypto-Native Socials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cm-panel p-8">
                <p className="text-lg font-semibold text-foreground mb-2">Built on Base</p>
                <p className="text-foreground/80">Fast, cheap, and reliable</p>
              </Card>
              <Card className="cm-panel p-8">
                <p className="text-lg font-semibold text-foreground mb-2">Designed for Farcaster</p>
                <p className="text-foreground/80">Native social integration</p>
              </Card>
              <Card className="cm-panel p-8">
                <p className="text-lg font-semibold text-foreground mb-2">Easy to share</p>
                <p className="text-foreground/80">Coordinate with your community</p>
              </Card>
              <Card className="cm-panel p-8">
                <p className="text-lg font-semibold text-foreground mb-2">Social momentum</p>
                <p className="text-foreground/80">Part of the game</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-[var(--sidebar-bg)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[var(--highlight-yellow)] mb-12 text-center">FAQ</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Is this a prediction market?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  No. You are not predicting real match results. You are supporting teams in an onchain tournament.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Can the onchain winner differ from the real World Cup winner?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  Yes — and that&apos;s the point. The Onchain World Cup reflects community support, not real-world
                  performance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Are there real matches during the qualification phase?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  No. Qualification is purely about fan support.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Why end Season 1 before the real World Cup?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  To avoid confusion and keep narratives separate. Season 1 is its own event.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Why does voting cost ETH?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  ETH prevents spam, sybil attacks, and fake coordination. It ensures votes are meaningful.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Can I vote more than once?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  Yes. Multiple votes per wallet are allowed. Voting costs increase over time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Is this gambling?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  No. There are no odds, no predictions, and no betting on real outcomes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  What chain is this on?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  Built on Base. All contracts are public and verifiable.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="cm-panel border-border">
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-[var(--highlight-yellow)]">
                  Where can I follow updates?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-foreground/90 text-base leading-relaxed">
                  <div className="space-y-2">
                    <p>
                      X:{" "}
                      <a
                        href="https://x.com/OnchainC29697"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--highlight-yellow)] hover:underline"
                      >
                        https://x.com/OnchainC29697
                      </a>
                    </p>
                    <p>
                      Farcaster:{" "}
                      <a
                        href="https://farcaster.xyz/onchainworldcup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--highlight-yellow)] hover:underline"
                      >
                        https://farcaster.xyz/onchainworldcup
                      </a>
                    </p>
                    <p>
                      Zora:{" "}
                      <a
                        href="https://zora.co/@onchainworldcup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--highlight-yellow)] hover:underline"
                      >
                        https://zora.co/@onchainworldcup
                      </a>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Support Your Team.
              <br />
              Coordinate Onchain.
              <br />
              Make History Before the World Cup Starts.
            </h2>
            <Link href="/qualification">
              <Button
                size="lg"
                className="bg-[var(--highlight-yellow)] text-black hover:bg-[var(--highlight-lime)] text-xl px-12 py-8 mt-8"
              >
                Enter the Onchain World Cup
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8 bg-[var(--sidebar-bg)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-foreground/70 text-sm">© 2026 Onchain World Cup. Built on Base.</p>
            <div className="flex items-center gap-6">
              <a
                href="https://x.com/OnchainC29697"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-[var(--highlight-yellow)] transition-colors text-sm"
              >
                X (Twitter)
              </a>
              <a
                href="https://farcaster.xyz/onchainworldcup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-[var(--highlight-yellow)] transition-colors text-sm"
              >
                Farcaster
              </a>
              <a
                href="https://zora.co/@onchainworldcup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-[var(--highlight-yellow)] transition-colors text-sm"
              >
                Zora
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
