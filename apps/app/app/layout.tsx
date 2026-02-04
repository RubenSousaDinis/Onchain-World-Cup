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
import { DemoBanner } from "@/components/demo-banner"
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_DOMAIN || "http://localhost:3000"),
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
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
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

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-14FTMVVK49"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-14FTMVVK49');
            `,
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
        <DemoBanner />
        <QueryProvider>
          <SessionProvider>
            <Web3Provider>
              <FarcasterProvider>
                <NotificationProvider>
                  <AutoAuthProvider>
                    <OnboardingProvider>{children}</OnboardingProvider>
                  </AutoAuthProvider>
                </NotificationProvider>
              </FarcasterProvider>
            </Web3Provider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
