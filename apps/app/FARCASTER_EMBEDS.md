# Farcaster Mini App Embeds Implementation Guide

This guide explains how to add page-specific embeds to make individual pages shareable in Farcaster feeds.

## What Are Embeds?

**Embeds** are page-level metadata (via `fc:miniapp` meta tag) that makes individual URLs shareable as rich cards in Farcaster feeds. Unlike the manifest (which is app-wide), embeds are page-specific.

## Current Implementation Status

### ✅ Implemented

1. **Home Page** (`/`) - Uses root layout metadata with "⚽ Vote Now" button
2. **Helper functions exist** for matches and qualification pages:
   - `generateMatchMiniAppMetadata(matchId, team1, team2)`
   - `generateQualificationMiniAppMetadata(countryName)`

### 📝 To Be Implemented

Since most pages are client components ("use client"), they can't export metadata directly. To add embeds to these pages, create a `layout.tsx` file in the route folder:

#### 1. Qualification Page (`/qualification`)

Create `app/qualification/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { generateMiniAppMetadata } from "@/lib/utils/miniapp-metadata"

export const metadata: Metadata = generateMiniAppMetadata({
  title: "World Cup 2026 Qualification | Onchain World Cup",
  description: "Vote for countries to qualify for World Cup 2026. Top 48 countries by vote count advance!",
  buttonTitle: "🏆 View Qualification",
  appUrl: `${process.env.NEXT_PUBLIC_APP_DOMAIN}/qualification`,
})

export default function QualificationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

#### 2. Leaderboard Page (`/leaderboard`)

Create `app/leaderboard/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { generateMiniAppMetadata } from "@/lib/utils/miniapp-metadata"

export const metadata: Metadata = generateMiniAppMetadata({
  title: "Leaderboard | Onchain World Cup",
  description: "See top voters and country rankings for World Cup 2026",
  buttonTitle: "📊 View Leaderboard",
  appUrl: `${process.env.NEXT_PUBLIC_APP_DOMAIN}/leaderboard`,
})

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

#### 3. Individual Country Pages (`/qualification/[countryId]`)

When you create individual country detail pages, add `generateMetadata` to make each page shareable:

Create `app/qualification/[countryId]/page.tsx`:

```tsx
import type { Metadata } from "next"
import { generateQualificationMiniAppMetadata } from "@/lib/utils/miniapp-metadata"

// This must be a server component (no "use client")
export async function generateMetadata({
  params
}: {
  params: { countryId: string }
}): Promise<Metadata> {
  // Fetch country data
  const country = await getCountryByCode(params.countryId)

  return generateQualificationMiniAppMetadata(country.name)
}

export default async function CountryPage({
  params
}: {
  params: { countryId: string }
}) {
  // Page content...
}
```

#### 4. Individual Match Pages (`/matches/[matchId]`)

When you create match detail pages, use the match metadata helper:

Create `app/matches/[matchId]/page.tsx`:

```tsx
import type { Metadata } from "next"
import { generateMatchMiniAppMetadata } from "@/lib/utils/miniapp-metadata"

export async function generateMetadata({
  params
}: {
  params: { matchId: string }
}): Promise<Metadata> {
  // Fetch match data
  const match = await getMatchById(params.matchId)

  return generateMatchMiniAppMetadata(
    params.matchId,
    match.team1.name,
    match.team2.name
  )
}

export default async function MatchPage({
  params
}: {
  params: { matchId: string }
}) {
  // Page content...
}
```

#### 5. Individual Team Pages (`/teams/[teamId]`)

The team page currently exists as a client component. To add embeds, create a server component wrapper or layout:

Create `app/teams/[teamId]/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { generateMiniAppMetadata } from "@/lib/utils/miniapp-metadata"
import { countries } from "@/lib/countries"

export async function generateMetadata({
  params
}: {
  params: { teamId: string }
}): Promise<Metadata> {
  const team = countries.find(c => c.code.toLowerCase() === params.teamId.toLowerCase())

  if (!team) {
    return generateMiniAppMetadata()
  }

  return generateMiniAppMetadata({
    title: `${team.name} ${team.flagEmoji} | Onchain World Cup`,
    description: `View ${team.name} stats, votes, and upcoming matches`,
    buttonTitle: `${team.flagEmoji} View ${team.name}`,
    appUrl: `${process.env.NEXT_PUBLIC_APP_DOMAIN}/teams/${params.teamId}`,
  })
}

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

## Testing Embeds

1. **Deploy your changes** to production or staging
2. **Use the Farcaster Mini App preview tool**: https://farcaster.xyz/~/developers/mini-apps/preview?url=YOUR_URL
3. **Share a link** in Warpcast and verify the embed appears correctly

## Embed Best Practices

1. **Button titles** should be max 32 characters
2. **Images** should be 3:2 aspect ratio (e.g., 1200x800px)
3. **Titles** should be descriptive and specific to the page
4. **URLs** should point to the exact page being shared
5. **Each page** should have a unique embed to maximize shareability

## Current Helper Functions

### `generateMiniAppMetadata(config)`

Generic metadata generator used in root layout.

### `generateMatchMiniAppMetadata(matchId, team1, team2)`

Generates embed for individual match pages with:
- Title: "Vote: Team1 vs Team2"
- Button: "Vote Now"
- Dynamic OG image at `/og/match/${matchId}`

### `generateQualificationMiniAppMetadata(countryName)`

Generates embed for qualification pages with:
- Title: "Vote: Country Qualification"
- Button: "Vote for Qualification"
- Dynamic OG image at `/og/qualification/${countryName}`

## Priority Pages

If you want to implement embeds incrementally, prioritize in this order:

1. ✅ **Home page** - Already done
2. **Qualification overview** - High traffic, easy to implement
3. **Individual country pages** - High shareability (when created)
4. **Leaderboard** - Social proof, encourages sharing
5. **Individual match pages** - Core functionality (when created)
6. **Team pages** - Lower priority

## Notes

- Embeds are cached by Farcaster clients
- Changes may take a few hours to propagate
- Use unique `notificationId` values when sending notifications
- Rate limits: 1 notification per 30s per token, 100/day per token
