import type { Metadata } from "next"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"

export const metadata: Metadata = {
  title: "About | Onchain World Cup",
  description: "Onchain World Cup is a community-driven football tournament on the Base blockchain. Vote with ETH to qualify 48 nations for the tournament before FIFA World Cup 2026.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Onchain World Cup",
    "url": "https://app.onchainworldcup.xyz/about",
    "description": "Onchain World Cup is a community-driven football tournament on the Base blockchain. Vote with ETH to qualify 48 nations for World Cup 2026.",
    "isPartOf": {
      "@type": "WebSite",
      "url": "https://app.onchainworldcup.xyz/",
    },
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
            <h1 className="text-2xl lg:text-4xl font-bold mb-2 cm-highlight">About Onchain World Cup</h1>
            <p className="text-sm text-foreground/60">Community-driven football on Base</p>
          </div>

          <section aria-labelledby="what-heading" className="cm-panel rounded-sm overflow-hidden mb-4 p-6 lg:p-8">
            <h2 id="what-heading" className="text-xl font-bold mb-3 cm-highlight">What Is It?</h2>
            <p className="text-sm lg:text-base text-foreground/80 leading-relaxed">
              Onchain World Cup is a community-driven football tournament that runs entirely on the Base blockchain.
              Fans from around the world vote with ETH to decide which 48 national teams qualify for the tournament —
              no match results needed, just pure community support. The earlier you vote, the cheaper each vote
              costs thanks to a dynamic bonding-curve pricing mechanism. Once qualification ends, the top 48
              countries advance through group stages and knockout rounds, all decided by the community,
              culminating in a champion crowned before the real FIFA World Cup 2026 kicks off on June 11.
              90% of the entire prize pool is shared proportionally among voters who backed the winning country.
            </p>
          </section>

          <section aria-labelledby="tech-heading" className="cm-panel rounded-sm overflow-hidden mb-4 p-6 lg:p-8">
            <h2 id="tech-heading" className="text-xl font-bold mb-3 cm-highlight">Technology</h2>
            <ul className="space-y-3 text-sm lg:text-base text-foreground/80">
              <li>
                <strong>Base blockchain</strong> — All voting and prize distribution runs on Base, an Ethereum Layer 2
                network with low fees and fast confirmations.
              </li>
              <li>
                <strong>Open-source smart contracts</strong> — All voting logic, prize pools, and payouts are governed
                by auditable Solidity contracts. No central authority controls the outcome.
              </li>
              <li>
                <strong>Farcaster Mini App</strong> — Onchain World Cup is available as a native Mini App inside
                Farcaster, letting you vote directly from your social feed without leaving the app.
              </li>
              <li>
                <strong>Dynamic bonding-curve pricing</strong> — Two-phase pricing rewards early voters. Phase 1
                (first 2 hours) uses linear pricing with a 5% platform fee. Phase 2 (hours 2–24) uses exponential
                pricing with a 15% fee.
              </li>
            </ul>
          </section>

          <section aria-labelledby="social-heading" className="cm-panel rounded-sm overflow-hidden mb-4 p-6 lg:p-8">
            <h2 id="social-heading" className="text-xl font-bold mb-3 cm-highlight">Find Us</h2>
            <ul className="space-y-3 text-sm lg:text-base">
              <li>
                <a
                  href="https://x.com/OnchainC29697"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span>@OnchainC29697 on X</span>
                </a>
              </li>
              <li>
                <a
                  href="https://warpcast.com/onchainworldcup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 1000 1000" fill="currentColor" aria-hidden="true"><path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/><path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/><path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/></svg>
                  <span>@onchainworldcup on Farcaster</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:onchainworldcup@gmail.com"
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span>onchainworldcup@gmail.com</span>
                </a>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}
