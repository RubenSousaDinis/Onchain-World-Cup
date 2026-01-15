import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Web3Provider } from "@/components/providers/web3-provider"
import { FarcasterProvider } from "@/lib/farcaster-provider"
import { QueryProvider } from "@/providers/query-provider"

export const metadata: Metadata = {
  title: "Live Matches | Crypto World Cup 2026",
  description:
    "Vote on live World Cup 2026 matches with ETH. Real-time crypto betting on Base network with dynamic pricing.",
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
    title: "Live Matches | Crypto World Cup 2026",
    description: "Vote on live World Cup 2026 matches with ETH.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 800,
        alt: "Crypto World Cup 2026",
      },
    ],
  },
  other: {
    // Farcaster Mini App meta tag
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${process.env.NEXT_PUBLIC_APP_DOMAIN || "https://your-domain.vercel.app"}/og-image.png`,
      button: {
        title: "Vote on Matches",
        action: {
          type: "launch_frame",
          name: "Crypto World Cup 2026",
          url: process.env.NEXT_PUBLIC_APP_DOMAIN || "https://your-domain.vercel.app",
          splashImageUrl: `${process.env.NEXT_PUBLIC_APP_DOMAIN || "https://your-domain.vercel.app"}/splash.png`,
          splashBackgroundColor: "#1e3a8a",
        },
      },
    }),
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
      <body className="font-cm">
        <QueryProvider>
          <Web3Provider>
            <FarcasterProvider>{children}</FarcasterProvider>
          </Web3Provider>
        </QueryProvider>
      </body>
    </html>
  )
}
