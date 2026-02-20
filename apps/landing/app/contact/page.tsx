import type { Metadata } from "next"
import Link from "next/link"
import { Twitter, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact | Onchain World Cup",
  description: "Get in touch with the Onchain World Cup team. Reach us by email or on X, Farcaster, or Zora.",
  alternates: { canonical: "https://onchainworldcup.xyz/contact" },
  openGraph: {
    title: "Contact | Onchain World Cup",
    description: "Get in touch with the Onchain World Cup team.",
    type: "website",
    url: "https://onchainworldcup.xyz/contact",
  },
}

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "url": "https://onchainworldcup.xyz/contact",
    "name": "Contact Onchain World Cup",
    "description": "Get in touch with the Onchain World Cup team via email or social media.",
    "isPartOf": {
      "@type": "WebSite",
      "url": "https://onchainworldcup.xyz/",
      "name": "Onchain World Cup",
    },
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="mb-4 text-3xl font-bold text-primary">Contact</h1>
      <p className="mb-10 text-lg text-muted-foreground">
        Have a question, bug report, or partnership enquiry? Reach the Onchain World Cup team below.
      </p>

      <div className="space-y-4">
        <a
          href="mailto:onchainworldcup@gmail.com"
          className="flex items-center gap-4 rounded-sm border border-border p-5 hover:border-primary transition-colors"
        >
          <Mail className="h-6 w-6 text-primary shrink-0" />
          <div>
            <p className="font-bold">Email</p>
            <p className="text-sm text-muted-foreground">onchainworldcup@gmail.com</p>
          </div>
        </a>

        <a
          href="https://x.com/OnchainC29697"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-sm border border-border p-5 hover:border-primary transition-colors"
        >
          <Twitter className="h-6 w-6 text-primary shrink-0" />
          <div>
            <p className="font-bold">X (Twitter)</p>
            <p className="text-sm text-muted-foreground">@OnchainC29697</p>
          </div>
        </a>

        <a
          href="https://warpcast.com/onchainworldcup"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-sm border border-border p-5 hover:border-primary transition-colors"
        >
          <div className="h-6 w-6 text-primary shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 1000 1000" fill="currentColor" aria-hidden="true" className="h-5 w-5">
              <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/>
              <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
              <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
            </svg>
          </div>
          <div>
            <p className="font-bold">Farcaster</p>
            <p className="text-sm text-muted-foreground">@onchainworldcup on Warpcast</p>
          </div>
        </a>

        <a
          href="https://zora.co/@onchainworldcup"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-sm border border-border p-5 hover:border-primary transition-colors"
        >
          <div className="h-6 w-6 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 text-primary">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          </div>
          <div>
            <p className="font-bold">Zora</p>
            <p className="text-sm text-muted-foreground">@onchainworldcup on Zora</p>
          </div>
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
