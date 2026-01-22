import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Web3Provider } from "@/components/providers/web3-provider"
import { FarcasterProvider } from "@/lib/farcaster-provider"
import { FarcasterReady } from "@/components/farcaster-ready"
import { QueryProvider } from "@/providers/query-provider"
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
  title: "Onchain World Cup | Vote on World Cup 2026",
  description: "Vote on World Cup 2026 matches with ETH. Real-time crypto betting on Base network with dynamic pricing.",
  buttonTitle: "Open App",
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
      <body className={barlowCondensed.className}>
        <FarcasterReady />
        <SkipToContent />
        <DemoBanner />
        <QueryProvider>
          <Web3Provider>
            <FarcasterProvider>
              <NotificationProvider>
                <OnboardingProvider>{children}</OnboardingProvider>
              </NotificationProvider>
            </FarcasterProvider>
          </Web3Provider>
        </QueryProvider>
      </body>
    </html>
  )
}
