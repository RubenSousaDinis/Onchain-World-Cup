import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/providers/web3-provider"
import { FarcasterProvider } from "@/lib/farcaster-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Live Matches | Crypto World Cup 2026",
  description:
    "Vote on live World Cup 2026 matches with ETH. Real-time crypto betting on Base network with dynamic pricing.",
  openGraph: {
    title: "Live Matches | Crypto World Cup 2026",
    description: "Vote on live World Cup 2026 matches with ETH.",
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
      <body className={inter.className}>
        <Web3Provider>
          <FarcasterProvider>{children}</FarcasterProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
