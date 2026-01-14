import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Onchain World Cup | The World Cup, decided onchain",
  description:
    "Support your country. Coordinate with fans worldwide. Crown the onchain champion — before the real World Cup even starts.",
  openGraph: {
    title: "Onchain World Cup | The World Cup, decided onchain",
    description: "Support your country. Coordinate with fans worldwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 800,
        alt: "Onchain World Cup",
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
