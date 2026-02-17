import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { Web3Provider } from "@/components/providers/web3-provider"
import { FarcasterProvider } from "@/lib/farcaster-provider"
import { FarcasterReady } from "@/components/farcaster-ready"
import { QueryProvider } from "@/providers/query-provider"
import { SessionProvider } from "@/providers/session-provider"
import { AutoAuthProvider } from "@/providers/auto-auth-provider"
import { SkipToContent } from "@/components/accessibility/skip-to-content"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { OnboardingProvider } from "@/providers/onboarding-provider"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { generateMiniAppMetadata } from "@/lib/utils/miniapp-metadata"
import { Barlow_Condensed } from "next/font/google"

// Barlow Condensed - geometric condensed sans-serif, very similar to Handel Gothic
// Professional and readable, perfect for Championship Manager-style sports interfaces
const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

// Generate Farcaster Mini App metadata using utility
const miniAppMetadata = generateMiniAppMetadata({
  title: "Onchain World Cup 2026 | Vote with ETH on Base Network",
  description: "Vote on World Cup 2026 qualification with ETH. Support your country, earn rewards. Dynamic pricing, real-time voting on Base blockchain. Top 48 qualify!",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
              "logo": "https://onchainworldcup.xyz/logo.svg",
              "description": "Community-driven football tournament on the Base blockchain. Vote with ETH to qualify countries for World Cup 2026.",
              "foundingDate": "2025",
              "sameAs": [
                "https://x.com/OnchainC29697",
                "https://zora.co/@onchainworldcup",
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
        <FarcasterReady />
        <SkipToContent />
        <QueryProvider>
          <SessionProvider>
            <Web3Provider>
              <FarcasterProvider>
                <NotificationProvider>
                  <AutoAuthProvider>
                    <TooltipProvider delayDuration={300}>
                      <OnboardingProvider>{children}</OnboardingProvider>
                    </TooltipProvider>
                  </AutoAuthProvider>
                </NotificationProvider>
              </FarcasterProvider>
            </Web3Provider>
          </SessionProvider>
        </QueryProvider>
        <footer className="hidden lg:block border-t border-border/30 mt-auto py-3 px-6 lg:ml-24 lg:px-8 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>ETH voting is irreversible. Smart contract transactions cannot be undone. Only vote with ETH you can afford to lose.</p>
            <nav aria-label="Legal" className="flex gap-4">
              <a href="https://onchainworldcup.xyz/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="https://onchainworldcup.xyz/terms" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Terms</a>
              <a href="https://onchainworldcup.xyz/about" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">About</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
