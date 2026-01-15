import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Barlow_Condensed } from "next/font/google"

// Barlow Condensed - geometric condensed sans-serif, very similar to Handel Gothic
// Professional and readable, perfect for Championship Manager-style sports interfaces
const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Onchain World Cup | The World Cup, decided onchain",
  description:
    "Support your country. Coordinate with fans worldwide. Crown the onchain champion — before the real World Cup even starts.",
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
    title: "Onchain World Cup | The World Cup, decided onchain",
    description: "Support your country. Coordinate with fans worldwide.",
    images: [
      {
        url: "/splash_social.png",
        width: 1200,
        height: 1200,
        alt: "Onchain World Cup - The World Cup, decided onchain",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={barlowCondensed.className}>{children}</body>
    </html>
  )
}
