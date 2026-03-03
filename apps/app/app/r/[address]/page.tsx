import type { Metadata } from "next"
import { ReferralRedirect } from "./referral-redirect"

const BASE_URL = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>
}): Promise<Metadata> {
  const { address } = await params
  const ogUrl = `${BASE_URL}/api/og/referral?address=${address}`

  return {
    title: "Join me on Onchain World Cup",
    description:
      "Back your country with ETH. Vote in the Onchain World Cup 2026 qualification. Winners share the ETH prize pool.",
    openGraph: {
      title: "Join me on Onchain World Cup",
      description:
        "Back your country with ETH. Vote in qualification. Winners share the ETH prize pool.",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      url: `${BASE_URL}/r/${address}`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Join me on Onchain World Cup",
      description:
        "Back your country with ETH. Vote in qualification. Winners share the ETH prize pool.",
      images: [ogUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: ogUrl,
        button: {
          title: "⚽ Join & Vote",
          action: {
            type: "launch_frame",
            name: "Onchain World Cup",
            url: `${BASE_URL}/?ref=${address}`,
            splashImageUrl: `${BASE_URL}/logo.jpg`,
            splashBackgroundColor: "#0a1628",
          },
        },
      }),
    },
  }
}

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params
  return <ReferralRedirect address={address} />
}
