import Link from "next/link"
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
      <nav aria-label="Breadcrumb" className="px-4 pt-4 text-xs text-muted-foreground flex items-center gap-1">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="text-foreground">{shortAddress}</span>
      </nav>
      <UserProfilePageClient address={address} />
    </>
  )
}
