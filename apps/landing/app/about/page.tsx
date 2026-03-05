import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Onchain World Cup 2026 — ETH Voting on Base",
  description:
    "Learn about Onchain World Cup 2026 — a community-driven ETH voting tournament on the Base blockchain, aligned with the FIFA World Cup 2026.",
  alternates: { canonical: "https://onchainworldcup.xyz/about" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "About Onchain World Cup 2026 — ETH Voting on Base",
    description: "Learn about Onchain World Cup 2026 — a community-driven ETH voting tournament on the Base blockchain, aligned with the FIFA World Cup 2026.",
    type: "website",
    url: "https://onchainworldcup.xyz/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Onchain World Cup 2026 — ETH Voting on Base",
    description: "Learn about Onchain World Cup 2026 — a community-driven ETH voting tournament on the Base blockchain, aligned with the FIFA World Cup 2026.",
  },
}

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "url": "https://onchainworldcup.xyz/about",
    "name": "About Onchain World Cup 2026",
    "description": "Learn about Onchain World Cup 2026 — a community-driven ETH voting tournament on the Base blockchain, aligned with the FIFA World Cup 2026.",
    "isPartOf": {
      "@type": "WebSite",
      "url": "https://onchainworldcup.xyz/",
      "name": "Onchain World Cup",
    },
  }
  const contractAddress = process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mb-4 text-3xl font-bold text-primary">About Onchain World Cup</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        The World Cup, decided onchain. Community-driven football tournament where fans back their country
        with ETH on the Base blockchain.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">What Is It?</h2>
        <p className="text-muted-foreground">
          Onchain World Cup is a community prediction and voting game aligned with FIFA World Cup 2026.
          Instead of traditional bracket picks, fans vote for national teams by staking ETH — making their
          support count both emotionally and financially. Early supporters get more votes for less ETH,
          rewarding conviction over bandwagoning.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">Technology</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            <strong>Base Network:</strong> All transactions run on Base, an Ethereum L2 with low fees and
            fast confirmations.
          </li>
          <li>
            <strong>Smart Contracts:</strong> Voting logic and prize pool management are handled entirely
            on-chain. The contracts are open source and publicly verifiable.
            {contractAddress && (
              <>
                {" "}View on{" "}
                <a
                  href={`https://basescan.org/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Basescan
                </a>
                .
              </>
            )}
          </li>
          <li>
            <strong>Farcaster Mini App:</strong> Accessible directly inside the Farcaster social network as
            a native Mini App.
          </li>
          <li>
            <strong>Next.js + Supabase:</strong> A fast, indexed frontend built on Next.js reads on-chain
            events from a Supabase database for instant leaderboard updates.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">Tournament Phases</h2>
        <div className="space-y-4">
          <div className="rounded-sm border border-border p-4">
            <h3 className="font-bold text-primary mb-1">Phase 1 — Qualification</h3>
            <p className="text-sm text-muted-foreground">
              All 211 FIFA nations compete for 48 spots. The community votes with ETH to determine who
              qualifies. Vote prices start at 0.001 ETH and increase linearly by 0.0005 ETH per vote.
            </p>
          </div>
          <div className="rounded-sm border border-border p-4">
            <h3 className="font-bold text-primary mb-1">Phase 2 — Tournament</h3>
            <p className="text-sm text-muted-foreground">
              The top 48 qualified nations enter a group stage and knockout bracket. Community voting
              continues on match outcomes, with two-phase pricing and prize pools per match.
            </p>
          </div>
          <div className="rounded-sm border border-border p-4">
            <h3 className="font-bold text-primary mb-1">Phase 3 — Final</h3>
            <p className="text-sm text-muted-foreground">
              The Onchain World Cup champion is crowned. Prize pools are distributed to supporters of
              winning teams proportionally based on their vote count.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">Follow Along</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            X (Twitter):{" "}
            <a
              href="https://x.com/OnchainC29697"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              @OnchainC29697
            </a>
          </li>
          <li>
            Farcaster:{" "}
            <a
              href="https://farcaster.xyz/onchainworldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              /onchainworldcup
            </a>
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">Contact</h2>
        <p className="text-muted-foreground">
          Questions or partnership enquiries? Email us at{" "}
          <a
            href="mailto:onchainworldcup@gmail.com"
            className="underline hover:text-foreground"
          >
            onchainworldcup@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">Team &amp; Mission</h2>
        <p className="text-muted-foreground">
          Onchain World Cup is built by a small team of football fans and Base blockchain developers who
          believe community ownership should shape the beautiful game. Our mission is to prove that
          on-chain governance can create a more transparent, global, and participatory tournament
          experience — where every supporter, regardless of geography, has a real stake in the outcome.
          We are fully transparent: all contracts are open-source, all prize flows are verifiable
          on-chain, and we take only a small fee to fund ongoing development.
        </p>
      </section>

      <div className="mb-10 rounded-sm border border-primary/40 bg-primary/5 p-6 text-center">
        <p className="mb-3 text-lg font-bold">Ready to vote?</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Back your country with ETH. Qualification is live — early supporters get more votes for less.
        </p>
        <a
          href="https://app.onchainworldcup.xyz"
          className="inline-block rounded-sm bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Vote Now →
        </a>
      </div>

      <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
