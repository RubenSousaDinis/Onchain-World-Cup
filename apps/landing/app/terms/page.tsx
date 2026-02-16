import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | Onchain World Cup",
  description:
    "Terms of Service for Onchain World Cup 2026. Important information about ETH voting, smart contract risks, and platform rules.",
  alternates: { canonical: "https://onchainworldcup.xyz/terms" },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-primary">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: February 2026</p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By accessing or using Onchain World Cup (&ldquo;Service&rdquo;) at{" "}
          <strong>onchainworldcup.xyz</strong> or <strong>app.onchainworldcup.xyz</strong>, you agree to be
          bound by these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">2. Nature of ETH Voting — No Refunds</h2>
        <p className="mb-2 text-muted-foreground">
          Voting on Onchain World Cup requires submitting ETH transactions to smart contracts deployed on
          the Base blockchain. By voting you acknowledge:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>All transactions are irreversible.</strong> Once submitted to the blockchain, votes
            cannot be cancelled, modified, or refunded.
          </li>
          <li>
            You are interacting directly with smart contracts. We cannot reverse or override blockchain
            transactions on your behalf.
          </li>
          <li>
            Vote prices increase as more people vote. The price you pay is determined at the time your
            transaction is confirmed on-chain.
          </li>
          <li>Only vote with ETH you can afford to lose entirely.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">3. Platform Fee Disclosure</h2>
        <p className="text-muted-foreground">
          A platform fee is deducted from the total vote pool to fund development and operations:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
          <li>Phase 1 (0–2 hours): 5% platform fee</li>
          <li>Phase 2 (2–24 hours): 15% platform fee</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          The remaining pool (approximately 90%) is distributed to winners proportionally based on vote
          count. Exact amounts depend on total participation and are determined by the smart contract.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">4. No Guarantee of Winnings</h2>
        <p className="text-muted-foreground">
          Participation does not guarantee any return. Payouts depend on the outcome of community voting and
          the total ETH in the prize pool. We make no representations about expected returns. Past
          performance of any country or phase is not indicative of future results.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">5. Smart Contract Risk Disclosure</h2>
        <p className="text-muted-foreground">
          Smart contracts may contain bugs or vulnerabilities despite our best efforts to audit them. By
          using the Service you acknowledge:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
          <li>Smart contract code is open source and publicly verifiable on Basescan.</li>
          <li>
            Blockchain networks (including Base) may experience congestion, downtime, or protocol changes
            that affect transaction processing.
          </li>
          <li>
            We are not liable for losses resulting from smart contract exploits, network issues, or user
            error (e.g., sending to the wrong address).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">6. User Eligibility and Prohibited Jurisdictions</h2>
        <p className="text-muted-foreground">
          You must be of legal age in your jurisdiction to use the Service. You represent that your use of
          the Service does not violate any applicable laws. The Service is not available to residents of
          jurisdictions where ETH-based voting or prize pools are prohibited. It is your responsibility to
          ensure compliance with local laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">7. Intellectual Property</h2>
        <p className="text-muted-foreground">
          All website content, branding, and smart contract code (except third-party libraries) is owned by
          or licensed to Onchain World Cup. Smart contracts deployed on Base are open source under MIT
          license. You may not reproduce our branding without permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">8. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          To the fullest extent permitted by law, Onchain World Cup and its operators shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages, including loss of ETH
          or other digital assets, arising from your use of the Service. Our total liability for any claim
          shall not exceed the platform fees paid by you in the 30 days preceding the claim.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">9. Modifications</h2>
        <p className="text-muted-foreground">
          We reserve the right to modify these Terms at any time. Continued use of the Service after
          changes constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">10. Contact and Disputes</h2>
        <p className="text-muted-foreground">
          For questions or disputes, contact us at{" "}
          <a
            href="mailto:onchainworldcup@gmail.com"
            className="underline hover:text-foreground"
          >
            onchainworldcup@gmail.com
          </a>
          . We will attempt to resolve disputes informally within 30 days.
        </p>
      </section>

      <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
