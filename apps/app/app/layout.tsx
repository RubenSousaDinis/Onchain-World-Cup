import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { headers } from "next/headers"
import "./globals.css"
import { Web3Provider } from "@/components/providers/web3-provider"
import { SessionProvider } from "@/providers/session-provider"
import { SkipToContent } from "@/components/accessibility/skip-to-content"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { OnboardingProvider } from "@/providers/onboarding-provider"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ReferralCapture } from "@/components/referral-capture"
import { generateMiniAppMetadata } from "@/lib/utils/miniapp-metadata"
import { Barlow_Condensed } from "next/font/google"

// Barlow Condensed - geometric condensed sans-serif, very similar to Handel Gothic
// Professional and readable, perfect for Championship Manager-style sports interfaces
const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  // "optional" tells the browser to use the font only if it's already cached
  // or loads within a very short window (~100ms). No font-swap re-paint means
  // the LCP element is measured at FCP time instead of at ~4s on slow 4G.
  display: "optional",
})

// Generate Farcaster Mini App metadata using utility
const miniAppMetadata = generateMiniAppMetadata({
  title: "Onchain World Cup 2026 | Vote with ETH on Base Network",
  description: "Onchain World Cup — vote on World Cup 2026 qualification with ETH on Base. Back your country, earn rewards. Dynamic pricing rewards early voters. Top 48 of 192 nations qualify.",
  buttonTitle: "⚽ Vote Now",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz"),
  ...miniAppMetadata,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...miniAppMetadata.openGraph,
    type: "website",
    url: "https://app.onchainworldcup.xyz",
    siteName: "Onchain World Cup",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@OnchainC29697",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookies = headersObj.get("cookie")

  return (
    <html lang="en">
      <head>
        <meta name="talentapp:project_verification" content="2e581704055118519a0958d4f165995663863c847f0648cbdda67a0e480b243c221dd024dd1aac7561dc60ae62ca8c36fa9c866d4a3e8aee46afc7e481d3ae71" />
        <meta name="base:app_id" content="69af4603e5ff39234477b321" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* fonts.gstatic.com preconnect removed — next/font self-hosts Barlow Condensed */}
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PSTDFCLL');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Onchain World Cup",
              "url": "https://app.onchainworldcup.xyz/",
              "inLanguage": "en",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://app.onchainworldcup.xyz/qualification?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Onchain World Cup",
              "url": "https://onchainworldcup.xyz/",
              "logo": "https://onchainworldcup.xyz/logo.jpg",
              "description": "Community-driven football tournament on the Base blockchain. Vote with ETH to qualify countries for World Cup 2026.",
              "foundingDate": "2025",
              "email": "onchainworldcup@gmail.com",
              "sameAs": [
                "https://x.com/OnchainC29697",
                "https://farcaster.xyz/onchainworldcup",
              ],
            }),
          }}
        />
      </head>
      <body className={barlowCondensed.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PSTDFCLL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ReferralCapture />
        <SkipToContent />
        <SessionProvider>
          <Web3Provider cookies={cookies}>
            <NotificationProvider>
              <TooltipProvider delayDuration={300}>
                <OnboardingProvider>{children}</OnboardingProvider>
              </TooltipProvider>
            </NotificationProvider>
          </Web3Provider>
        </SessionProvider>
        <footer className="hidden lg:block border-t border-border/30 mt-auto py-3 px-6 lg:ml-24 lg:px-8 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>ETH voting is irreversible. Smart contract transactions cannot be undone. Only vote with ETH you can afford to lose.</p>
            <div className="flex items-center gap-4">
              {/* Social links */}
              <nav aria-label="Social" className="flex items-center gap-3">
                <a href="https://x.com/OnchainC29697" target="_blank" rel="noopener noreferrer" aria-label="Follow on X" className="hover:text-foreground transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://farcaster.xyz/onchainworldcup" target="_blank" rel="noopener noreferrer" aria-label="Follow on Farcaster" className="hover:text-foreground transition-colors">
                  <svg width="14" height="14" viewBox="0 0 1000 1000" fill="currentColor" aria-hidden="true"><path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/><path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/><path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/></svg>
                </a>
                <a href="mailto:onchainworldcup@gmail.com" aria-label="Send us an email" className="hover:text-foreground transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </a>
              </nav>
              {/* Legal links */}
              <nav aria-label="Legal" className="flex gap-4">
                <a href="https://onchainworldcup.xyz/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="https://onchainworldcup.xyz/terms" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Terms</a>
                <a href="/about" className="hover:text-foreground transition-colors">About</a>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
