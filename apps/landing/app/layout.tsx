import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { SkipToContent } from "@/components/accessibility/skip-to-content"
import { Barlow_Condensed } from "next/font/google"

// Barlow Condensed - geometric condensed sans-serif, very similar to Handel Gothic
// Professional and readable, perfect for Championship Manager-style sports interfaces
const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_DOMAIN || "https://onchainworldcup.xyz"),
  title: "Onchain World Cup 2026 | Vote for Your Country with ETH on Base",
  description:
    "Back your country with ETH. Only top 48 qualify. Prize pool shared among winners. Early supporters shape the tournament.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://onchainworldcup.xyz/",
  },
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
  openGraph: {
    type: "website",
    url: "https://onchainworldcup.xyz/",
    siteName: "Onchain World Cup",
    locale: "en_US",
    title: "Onchain World Cup 2026 | Vote for Your Country with ETH on Base",
    description: "Back your country with ETH. Only top 48 qualify. Early supporters shape the tournament.",
    images: [
      {
        url: "/splash_social.png",
        width: 1200,
        height: 1200,
        alt: "Onchain World Cup - The World Cup, decided onchain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@OnchainC29697",
    creator: "@OnchainC29697",
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
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TJ49B9N8');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Onchain World Cup",
              "url": "https://onchainworldcup.xyz/",
              "inLanguage": "en",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://app.onchainworldcup.xyz/qualification?q={search_term_string}",
                },
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
              "email": "onchainworldcup@gmail.com",
              "description": "Community-driven football tournament on the Base blockchain. Vote with ETH to qualify countries for World Cup 2026.",
              "sameAs": [
                "https://x.com/OnchainC29697",
                "https://zora.co/@onchainworldcup",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "Onchain World Cup 2026 — Qualification Phase",
              "description": "Community-driven football tournament on the Base blockchain. 211 nations compete for 48 spots. Vote with ETH to qualify your country.",
              "startDate": "2026-02-16",
              "endDate": "2026-02-25",
              "image": "https://onchainworldcup.xyz/logo.svg",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
              "location": {
                "@type": "VirtualLocation",
                "url": "https://onchainworldcup.xyz/",
              },
              "organizer": {
                "@type": "Organization",
                "name": "Onchain World Cup",
                "url": "https://onchainworldcup.xyz/",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Onchain World Cup App",
              "url": "https://app.onchainworldcup.xyz/",
              "applicationCategory": "SportsApplication",
              "operatingSystem": "Web",
              "description": "Community-driven football tournament where fans vote for national teams using ETH on the Base blockchain.",
              "offers": {
                "@type": "Offer",
                "price": "0.001",
                "priceCurrency": "ETH",
                "description": "First vote costs 0.001 ETH. Prices increase linearly by 0.0005 ETH per vote.",
              },
            }),
          }}
        />
      </head>
      <body className={barlowCondensed.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TJ49B9N8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <SkipToContent />
        {children}
      </body>
    </html>
  )
}
