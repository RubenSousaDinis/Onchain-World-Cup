import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | Onchain World Cup",
  description:
    "Privacy Policy for Onchain World Cup 2026. How we handle analytics, wallet data, and ETH transactions.",
  alternates: { canonical: "https://onchainworldcup.xyz/privacy-policy" },
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-primary">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: February 2026</p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">1. Overview</h2>
        <p className="text-muted-foreground">
          Onchain World Cup (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website{" "}
          <strong>onchainworldcup.xyz</strong> and the application at{" "}
          <strong>app.onchainworldcup.xyz</strong>. This Privacy Policy explains what information we collect,
          how we use it, and your rights. By using our services you agree to this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">2. Analytics (Google Tag Manager / GA4)</h2>
        <p className="mb-2 text-muted-foreground">
          We use Google Tag Manager (GTM) and Google Analytics 4 (GA4) to understand how visitors use our
          site. This may collect:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Pages visited and time spent</li>
          <li>Browser type, operating system, and device category</li>
          <li>Approximate geographic location (country/city level)</li>
          <li>Referral source (how you found the site)</li>
          <li>Anonymised IP address</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          We do not use analytics data to personally identify you. You can opt out via your browser&apos;s
          cookie settings or by using the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">3. Wallet Address Data</h2>
        <p className="text-muted-foreground">
          When you connect a wallet and vote, your Ethereum wallet address is used to associate votes with
          your account. Wallet addresses are <strong>public information on the Base blockchain</strong> —
          they are not secret. We do not store your wallet address in a private database beyond what is
          necessary to display your vote history and statistics. We never sell or share wallet addresses with
          third parties for marketing purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">4. ETH Transaction Data</h2>
        <p className="text-muted-foreground">
          All votes are recorded as transactions on the Base blockchain. Transaction data — including wallet
          addresses, vote amounts in ETH, and timestamps — is{" "}
          <strong>publicly visible on the blockchain</strong> and cannot be deleted or modified. We index
          this data in our database to display leaderboards and statistics. We do not have access to your
          private keys and cannot initiate transactions on your behalf.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">5. Cookies</h2>
        <p className="text-muted-foreground">
          We use cookies primarily for analytics (GA4) and to remember your wallet connection preferences.
          No cookies are used for advertising or sold to third parties. You can manage cookies through your
          browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">6. Data We Do Not Collect</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>We do not collect your name, email address, or phone number unless you contact us directly.</li>
          <li>We do not collect payment card information.</li>
          <li>We do not sell personal data to third parties.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">7. Data Retention</h2>
        <p className="text-muted-foreground">
          Analytics data is retained per Google&apos;s standard GA4 retention settings (up to 14 months).
          On-chain data is permanent by nature of the blockchain. Database records (vote stats, leaderboards)
          are retained for the duration of the tournament.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">8. Your Rights</h2>
        <p className="text-muted-foreground">
          Depending on your jurisdiction, you may have rights to access, correct, or delete personal data we
          hold about you (excluding on-chain data, which is immutable). To exercise these rights, contact us
          at the address below.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">9. Governing Law</h2>
        <p className="text-muted-foreground">
          This policy is governed by applicable law. Disputes shall be resolved in accordance with our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">10. Contact</h2>
        <p className="text-muted-foreground">
          Questions about this policy? Email us at{" "}
          <a
            href="mailto:onchainworldcup@gmail.com"
            className="underline hover:text-foreground"
          >
            onchainworldcup@gmail.com
          </a>
          .
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
