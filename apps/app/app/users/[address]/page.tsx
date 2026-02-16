import { UserProfilePageClient } from "./user-profile-page-client"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://app.onchainworldcup.xyz/" },
              { "@type": "ListItem", "position": 2, "name": "Leaderboard", "item": "https://app.onchainworldcup.xyz/leaderboard" },
              { "@type": "ListItem", "position": 3, "name": shortAddress },
            ],
          }),
        }}
      />
      <UserProfilePageClient address={address} shortAddress={shortAddress} />
    </>
  )
}
