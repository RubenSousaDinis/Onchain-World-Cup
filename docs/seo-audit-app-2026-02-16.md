# Onchain World Cup App — Full SEO Audit Report

**URL:** https://app.onchainworldcup.xyz/
**Date:** February 16, 2026
**Business Type:** Web3 dApp / Sports Prediction Game (ETH voting on Base network)
**Auditors:** Technical, Content, Schema, Sitemap, Performance, Visual (6 parallel subagents)

---

## SEO Health Score: 34 / 100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 49/100 | 12.25 |
| Content Quality & E-E-A-T | 25% | 18/100 | 4.5 |
| On-Page SEO | 20% | 45/100 | 9.0 |
| Schema / Structured Data | 10% | 0/100 | 0 |
| Performance (Core Web Vitals) | 10% | 37/100 | 3.7 |
| Images | 5% | 30/100 | 1.5 |
| AI Search Readiness | 5% | 15/100 | 0.75 |
| **Total** | | | **34 / 100** |

> **Context:** The app subdomain scores lower than the landing page (47/100) primarily because all pages are client-side rendered (near-empty HTML shells for crawlers), all pages share a single title and meta description, zero structured data exists, and the manifest uses the wrong brand name. These are all fixable issues.

---

## Category Scorecards

| Category | Score | Headline Issue |
|----------|-------|----------------|
| Technical SEO | 49/100 | No canonical tags; no noindex on wallet-gated pages; manifest not linked |
| E-E-A-T | 8/100 | No privacy policy, T&Cs, team info, or risk disclosure — YMYL site |
| Content Quality | 27/100 | All pages share one title/description; all client-rendered; mock data on /teams |
| Schema | 0/100 | Absolutely zero JSON-LD on any page |
| Sitemap | 61/100 | /my-bets incorrectly included; dynamic routes missing; lastmod = build time |
| Performance | 37/100 | 7-deep provider stack; 3.2 MB logo; 1,245 console.log calls in production |
| Mobile / Visual | 71/100 | Onboarding modal blocks every page on every session |
| Security | 60/100 | No security headers; `typescript: { ignoreBuildErrors: true }` |

---

## Implementation Status Tracker

> Last updated: 2026-02-16 (after PRs #224, #225, and round-4 branch)

| # | Item | Status | PR / Branch |
|---|------|--------|-------------|
| 1 | Onboarding modal fires every session | ✅ Done | #224 |
| 2 | Manifest branding: "Crypto World Cup" → "Onchain World Cup" | ✅ Done | #224 |
| 3 | Link manifest from `<head>` | ✅ Done | #224 |
| 4 | noindex for /my-bets and /api-docs | ✅ Done | #224 |
| 5 | Per-page metadata on all routes | ✅ Done | #224 |
| 6 | Privacy Policy + Terms of Service | ✅ Done | #225 |
| 7 | JSON-LD: WebSite, Organization, ETH disclaimer, breadcrumbs | ✅ Done | #224 / #225 |
| 8 | Fix H1 on qualification page | ✅ Done | #224 |
| 9 | /teams mock data → noindex | ✅ Done | #225 |
| 10 | Remove `generator: 'v0.app'` | ✅ Done | #224 |
| 11 | Remove duplicate GA4 scripts (GTM only) | ✅ Done | #224 |
| 12 | Strip production console.log calls (removeConsole) | ✅ Done | #224 |
| 13 | Security headers (all) | ✅ Done | #224 / #225 |
| 14 | Re-enable Next.js image optimization | ✅ Done | #224 |
| 15 | ETH risk disclosure on voting pages | ✅ Done | #225 |
| 16 | Convert /how-it-works to Server Component | ✅ Done | #224 |
| 17 | Lazy-initialize Web3 provider stack | ❌ Skipped | Breakage risk |
| 18 | Fix dual QueryClient instances | ✅ Done | #225 |
| 19 | Gate Farcaster SDK behind env detection | ❌ Skipped | Breakage risk |
| 20 | Sitemap: remove /my-bets, fix lastmod, add dynamic routes | ✅ Done | #224 |
| 21 | generateMetadata on /qualification/[countryId] + /teams/[teamId] | ✅ Done | #224 / #225 |
| 22 | preconnect hints | ✅ Done | #224 |
| 23 | Add Teams to main navigation | ✅ Done | #225 |
| 24 | Breadcrumbs: [countryId], [teamId], [matchId], [address] | ✅ Done | #225 / round-4 |
| 25 | About page | ✅ Done | #225 |
| 26 | Remove `typescript: { ignoreBuildErrors: true }` | ⏳ Pending | — |
| 27 | Lazy-load modal components via next/dynamic | ⏳ Backlog | — |
| 28 | Touch targets ≥ 48px | ⏳ Pending | — |
| 29 | Mobile body font ≥ 16px | ⏳ Pending | — |
| 30 | og:title / twitter:title consistency on /qualification | ✅ Done | round-4 |
| 31 | Imgur avatar alt text | ⏳ Backlog | — |
| 32 | Manifest icon purpose field | ✅ Done | #224 |
| — | /matches/[matchId] metadata + noindex + breadcrumbs | ✅ Done | round-4 |
| — | /schedule metadata + noindex (mock data) | ✅ Done | round-4 |
| — | /tournament metadata layout | ✅ Done | round-4 |

---

## Prioritized Action Plan

### 🔴 Critical — Fix This Week

#### 1. Fix onboarding modal — it fires on every page, every session
**Files:** Look for `OnboardingProvider` in `apps/app/providers/` or `apps/app/components/`

The onboarding tour ("Step 1 of 4: Welcome to Onchain World Cup!") fires on **every page** (`/`, `/qualification`, `/teams`) on every fresh browser session. This means:
- Googlebot renders the modal overlay on every page it crawls, potentially obscuring body content during the indexing window
- Every shared deep link (e.g., a link to `/qualification`) opens a generic "Welcome" modal instead of the page content
- Return users see it again on every new tab

**Fix:** Store tour completion in `localStorage`. Suppress for returning visitors. Show only on homepage `/`, not all pages:

```ts
// On mount in OnboardingProvider:
const hasSeenTour = localStorage.getItem("onboarding-complete")
if (hasSeenTour || pathname !== "/") return // don't show tour
```

#### 2. Fix branding violation in manifest.json — "Crypto World Cup" → "Onchain World Cup"
**File:** `apps/app/public/manifest.json`

```json
// CURRENT (violates CLAUDE.md branding rules):
"name": "Crypto World Cup 2026",
"short_name": "CWC 2026"

// CORRECT:
"name": "Onchain World Cup 2026",
"short_name": "OWC 2026"
```

#### 3. Link the manifest from `<head>` — it currently is not linked
**File:** `apps/app/app/layout.tsx`

The manifest exists at `/public/manifest.json` but is not referenced from the HTML `<head>`. PWA install prompts, Lighthouse, and browser discovery all fail silently.

```ts
export const metadata: Metadata = {
  // ...existing fields
  manifest: "/manifest.json",
}
```

#### 4. Add `noindex` to wallet-gated and developer pages
**Files:** Create `apps/app/app/my-bets/layout.tsx` and `apps/app/app/api-docs/layout.tsx`

`/my-bets` is in the sitemap at priority 0.7 but shows only a "Connect Wallet" prompt to unauthenticated visitors. Google indexes a thin-content page.

```ts
// apps/app/app/my-bets/layout.tsx (new file)
export const metadata = {
  robots: { index: false, follow: false }
}
export default function MyBetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

Do the same for `/api-docs`.

#### 5. Add page-level metadata — every page currently shares the homepage title
**Files:** Create `layout.tsx` in each route directory, or add `export const metadata` to each page.

Currently every page across the entire app uses the same title and meta description from the root layout:
- Title: `"Onchain World Cup 2026 | Vote with ETH on Base Network"`
- Description: `"Vote on World Cup 2026 qualification with ETH..."`

This applies to `/`, `/qualification`, `/teams`, `/leaderboard`, `/how-it-works`, `/my-bets`, `/stats`, and all dynamic routes.

Recommended titles/descriptions per page:

```ts
// apps/app/app/qualification/layout.tsx
export const metadata: Metadata = {
  title: "World Cup 2026 Qualification Voting | Onchain World Cup",
  description: "Vote with ETH to qualify countries for the Onchain World Cup 2026. Top 48 of 64 nations advance. Dynamic pricing — early voters pay less.",
  alternates: { canonical: "https://app.onchainworldcup.xyz/qualification" },
}

// apps/app/app/teams/layout.tsx
export const metadata: Metadata = {
  title: "Teams Overview | Onchain World Cup 2026",
  description: "Browse all 64 national teams competing in the Onchain World Cup 2026 on Base Network. Stats, standings, and upcoming matches.",
  alternates: { canonical: "https://app.onchainworldcup.xyz/teams" },
}

// apps/app/app/leaderboard/layout.tsx
export const metadata: Metadata = {
  title: "Leaderboard | Top Voters — Onchain World Cup 2026",
  description: "Top supporters ranked by ETH spent, votes cast, and early bird status. See who's leading the Onchain World Cup 2026 on Base.",
  alternates: { canonical: "https://app.onchainworldcup.xyz/leaderboard" },
}

// apps/app/app/how-it-works/layout.tsx
export const metadata: Metadata = {
  title: "How It Works | Onchain World Cup 2026",
  description: "How the Onchain World Cup works: 3 phases, dynamic ETH pricing, achievements and levels, and how winners share the prize pool.",
  alternates: { canonical: "https://app.onchainworldcup.xyz/how-it-works" },
}

// apps/app/app/stats/layout.tsx
export const metadata: Metadata = {
  title: "Statistics | Onchain World Cup 2026",
  description: "Live stats for Onchain World Cup 2026: total ETH in prize pool, total votes cast, active voters, and qualifying countries on Base Network.",
  alternates: { canonical: "https://app.onchainworldcup.xyz/stats" },
}
```

Also add a root canonical in `apps/app/app/layout.tsx`:
```ts
metadataBase: new URL("https://app.onchainworldcup.xyz"),
alternates: { canonical: "/" },
```

#### 6. Add Privacy Policy and Terms of Service pages
Both return 404. For a site handling real ETH transactions, this is a legal liability and an E-E-A-T critical failure under Google's YMYL standards (financial transactions site). GTM and GA4 are actively firing without any consent mechanism.

#### 7. Add Schema.org JSON-LD — zero structured data exists anywhere
**File:** `apps/app/app/layout.tsx` (for site-wide schemas), then per-page layouts

Add to root layout as inline `<script>` tags (these are static and can live in the Server Component layout):

```tsx
// WebSite schema — enables Google Sitelinks Search Box
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{__html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Onchain World Cup",
    "url": "https://app.onchainworldcup.xyz",
    "description": "Vote with ETH on World Cup 2026 qualification. Community-decided tournament on Base network."
  })}}
/>

// Organization schema — Knowledge Panel eligibility
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{__html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Onchain World Cup",
    "url": "https://app.onchainworldcup.xyz"
  })}}
/>
```

**Per-page schemas:**
- `/qualification` → `ItemList` with server-side country rankings + `BreadcrumbList`
- `/teams` → `ItemList` with `SportsTeam` entries + `BreadcrumbList`
- `/leaderboard` → `ItemList` + `BreadcrumbList`
- `/how-it-works` → `AboutPage` + `BreadcrumbList`
- All dynamic routes → `BreadcrumbList` at minimum

**Do NOT** add `FAQPage` (restricted to government/healthcare) or `HowTo` (deprecated Sept 2023).

---

### 🟠 High Priority — Fix Within 2 Weeks

#### 8. Fix H1 tag — identical on homepage and qualification page
Both pages render `<h1>Onchain World Cup</h1>`. The qualification page should have:
```tsx
<h1>World Cup 2026 Qualification Leaderboard</h1>
```
And the tournament topic promoted from H2 to be the semantic topic of the page.

**File:** `apps/app/app/qualification/page.tsx` ~line 349

#### 9. Replace mock data on /teams with real data, or add noindex until fixed
**File:** `apps/app/app/teams/page.tsx`

The `/teams` page uses hardcoded `const mockTeams = [...]` with only 4 teams (Brazil, Argentina, Germany, France) and fabricated ETH vote numbers. This page should either:
- Be connected to real Supabase data (countries table + vote aggregates), OR
- Be marked `noindex` until real data is in place

If Google indexes this page now, it indexes fabricated match results and fake vote totals.

#### 10. Remove `generator: 'v0.app'` from metadata
**File:** `apps/app/app/layout.tsx:57`

Outputs `<meta name="generator" content="v0.app">` — signals AI-generated toolchain.

#### 11. Fix duplicate analytics — GTM + direct GA4 import
**File:** `apps/app/app/layout.tsx` lines 82–97

GTM already contains the GA4 tag if configured in the GTM container. The direct `gtag.js` script is redundant and doubles analytics script weight. Remove the direct GA4 script block (lines 82–97), keep only the GTM snippet.

#### 12. Strip production console.log calls — 1,245 found across 35+ files
**File:** `apps/app/next.config.mjs`

```js
// Add to next.config.mjs
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // ...
}
```

Key offenders:
- `apps/app/providers/auto-auth-provider.tsx` — 29 calls, fires on every auth state change
- `apps/app/app/page.tsx` — console.log inside JSX render function (fires on every re-render)
- `apps/app/lib/wallet/desktop-config.ts` — logs at module load time on every page

#### 13. Add security headers
**File:** `apps/app/next.config.mjs`

```js
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ],
    },
  ]
},
```

#### 14. Re-enable Next.js image optimization
**File:** `apps/app/next.config.mjs`

Remove `images: { unoptimized: true }`. This single line disables WebP/AVIF conversion, responsive srcsets, and lazy loading across the entire app. The 3.2 MB `logo.png` served at 40–48px display size is a direct consequence. Switch logo usage in `retro-sidebar.tsx` and `mobile-nav.tsx` to use the existing `logo.svg` (538 bytes):

```tsx
// apps/app/components/retro-sidebar.tsx — replace <img>:
import Image from "next/image"
<Image src="/logo.svg" alt="Onchain World Cup logo" width={48} height={48} priority />
```

#### 15. Add ETH/financial risk disclosure
For a YMYL site (real money transactions), add a visible disclaimer on the homepage and voting pages. Even a brief statement: *"Voting with ETH involves financial risk. Smart contract interactions are irreversible. Only vote with ETH you can afford to lose."*

---

### 🟡 Medium Priority — Fix Within 1 Month

#### 16. Convert /how-it-works to a Server Component
**File:** `apps/app/app/how-it-works/page.tsx`

This page is `"use client"` (imports `useOnboardingContext`) but contains **entirely static content** — no API calls, no dynamic data. Removing `"use client"` would enable full static generation, improve LCP significantly, and make it the most crawlable page in the app. This is the easiest SSR win available.

#### 17. Lazy-initialize the Web3 provider stack
**File:** `apps/app/app/layout.tsx` lines 113–127

Seven nested context providers initialize on every page load, including pages that never need a wallet:

```
QueryProvider → SessionProvider → Web3Provider → FarcasterProvider →
NotificationProvider → AutoAuthProvider → TooltipProvider → OnboardingProvider
```

The `Web3Provider` alone pulls in wagmi v2 (~200 KB), viem v2 (~200 KB), and `@reown/appkit` (~300 KB) eagerly. Use `next/dynamic` with `ssr: false` to defer wallet initialization:

```tsx
const DeferredWeb3Stack = dynamic(() => import("@/components/providers/deferred-web3-stack"), {
  ssr: false,
  loading: () => <>{children}</>,
})
```

**Expected impact:** −1.5–2 s LCP on mobile, −100–150 ms INP.

#### 18. Fix dual QueryClient instances
**Files:** `apps/app/providers/query-provider.tsx`, `apps/app/components/providers/web3-provider.tsx`

`Web3Provider` creates its own `new QueryClient()` that overrides the shared one from `QueryProvider`. This splits the cache — wagmi queries use a separate instance with no custom settings. Pass the shared client from `QueryProvider` into `WagmiProvider` via the `queryClient` prop.

#### 19. Gate Farcaster SDK behind environment detection
**File:** `apps/app/components/farcaster-ready.tsx`

The SDK is imported at module evaluation time for all visitors, including regular browser users who will never be in a Farcaster context. Gate behind a user-agent check or context detection before importing:

```ts
// Only import if we detect a Farcaster context
const isFarcasterContext = navigator.userAgent.includes("Farcaster")
if (isFarcasterContext) {
  import("@farcaster/miniapp-sdk").then(({ sdk }) => sdk.actions.ready())
}
```

#### 20. Fix sitemap — remove /my-bets, fix lastmod, add dynamic routes
**File:** `apps/app/app/sitemap.ts`

- Remove `/my-bets` entry (wallet-gated, no indexable content)
- Replace `new Date()` with real dates per page
- Remove deprecated `changeFrequency` and `priority` fields (both ignored by Google)
- After confirming unique content per page, add `/qualification/[countryId]` dynamic URLs (⚠️ 192 countries = HARD STOP threshold — verify 60%+ unique content per page first)

#### 21. Add `generateMetadata()` to dynamic routes
**Files:** `apps/app/app/qualification/[countryId]/page.tsx`, `apps/app/app/teams/[teamId]/page.tsx`

Each `/qualification/[countryId]` page could rank for "vote for [Country] World Cup 2026" — 64 high-intent, low-competition long-tail keywords. Currently none have `generateMetadata()`, so they all inherit the root title.

```ts
export async function generateMetadata({ params }: { params: { countryId: string } }): Promise<Metadata> {
  const country = await getCountry(params.countryId)
  return {
    title: `Vote for ${country.name} | Onchain World Cup 2026 Qualification`,
    description: `Support ${country.name} in World Cup 2026 qualification. Vote with ETH on Base. Currently ranked #${country.rank} with ${country.votes} votes.`,
    alternates: { canonical: `https://app.onchainworldcup.xyz/qualification/${params.countryId}` },
  }
}
```

#### 22. Add preconnect resource hints
**File:** `apps/app/app/layout.tsx`

```tsx
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

#### 23. Add Teams to main navigation
The `/teams` route is accessible via URL but absent from both the desktop sidebar and mobile bottom nav. This suppresses internal link equity and makes the page undiscoverable to users and crawlers navigating from other pages.

#### 24. Add breadcrumb navigation to dynamic routes
`/qualification/[countryId]`, `/users/[address]`, and `/matches/[matchId]` have no breadcrumb components. Breadcrumbs aid crawlability and are eligible for rich result rendering when combined with `BreadcrumbList` schema.

#### 25. Add About / Team page
No human attribution or organization information exists anywhere in the app. For YMYL content (real ETH transactions), Google's E-E-A-T framework requires demonstrated expertise and accountability.

---

### 🔵 Low Priority — Backlog

#### 26. Remove `typescript: { ignoreBuildErrors: true }` from next.config.mjs
TypeScript errors silently pass in builds, masking potential bugs including security-relevant ones.

#### 27. Lazy-load modal components via next/dynamic
`QualificationVoteModal`, `ShareModal`, `AchievementUnlockedModal`, and `NftMintModal` are eagerly imported in every page bundle despite only rendering on user interaction. Use `next/dynamic` to split these out.

#### 28. Increase touch targets to 48px minimum
Hamburger menu (44×44px), "Skip tour" button (44px height), and "Next" tour button (44px height) are all 4px short of WCAG 2.5.5 recommendation.

#### 29. Increase mobile body font from 14–15px to 16px
Modal body text appears at ~14px in the onboarding tour. Below the 16px recommended minimum.

#### 30. Fix og:title / twitter:title mismatch on /qualification
- `og:title`: `"World Cup 2026 Qualification - Top 3 Countries"`
- `twitter:title`: `"World Cup 2026 Qualification Leaderboard"`

These should be consistent.

#### 31. Fix Imgur avatar alt text
Profile photo in Top Voters section has `alt="rubendinis"` (a username). Should be `alt="Profile photo of rubendinis"` or `alt=""` if decorative.

#### 32. Fix manifest icon purpose field
`"purpose": "any maskable"` is non-standard. Should be two separate icon entries:
```json
{ "src": "...", "purpose": "any" },
{ "src": "...", "purpose": "maskable" }
```

---

## Quick Wins Checklist (< 2 hours total)

- [ ] Fix `manifest.json` branding: `"Crypto World Cup"` → `"Onchain World Cup"`
- [ ] Add `manifest: "/manifest.json"` to root metadata in `layout.tsx`
- [ ] Remove `generator: 'v0.app'` from `layout.tsx`
- [ ] Add `alternates: { canonical: "/" }` to root metadata in `layout.tsx`
- [ ] Create `apps/app/app/my-bets/layout.tsx` with `robots: { index: false }`
- [ ] Create `apps/app/app/api-docs/layout.tsx` with `robots: { index: false }`
- [ ] Add `compiler: { removeConsole: process.env.NODE_ENV === "production" }` to `next.config.mjs`
- [ ] Add page-level metadata to `/qualification`, `/teams`, `/leaderboard`, `/how-it-works`, `/stats`
- [ ] Remove `/my-bets` from `sitemap.ts`
- [ ] Add `rel="preconnect"` hints for `googletagmanager.com` and `fonts.gstatic.com`

---

## Key Files to Update

| File | Issues |
|------|--------|
| `apps/app/public/manifest.json` | Branding violation ("Crypto World Cup"), icon purpose |
| `apps/app/app/layout.tsx` | Manifest not linked, no canonical, `generator` tag, dual analytics, no JSON-LD |
| `apps/app/next.config.mjs` | `images: { unoptimized: true }`, no security headers, `ignoreBuildErrors: true` |
| `apps/app/app/sitemap.ts` | /my-bets included, `new Date()` lastmod, deprecated tags |
| `apps/app/app/robots.ts` | Missing `/api-docs` disallow |
| `apps/app/app/qualification/page.tsx` | H1 identical to homepage, all client-rendered |
| `apps/app/app/teams/page.tsx` | Mock data only, no page-level metadata |
| `apps/app/app/how-it-works/page.tsx` | Unnecessary `"use client"` on static content |
| `apps/app/components/retro-sidebar.tsx` | 3.2 MB logo.png via `<img>` tag |
| `apps/app/components/mobile-nav.tsx` | 3.2 MB logo.png via `<img>` tag |
| `apps/app/providers/auto-auth-provider.tsx` | 29 console.log calls in production |
| `apps/app/lib/wallet/desktop-config.ts` | createAppKit() at module load time |
| `apps/app/components/farcaster-ready.tsx` | SDK eager-loaded for all visitors |
| `apps/app/components/providers/web3-provider.tsx` | Duplicate QueryClient instance |

---

## Detailed Findings by Category

### Technical SEO (49/100)

| Check | Status | Finding |
|-------|--------|---------|
| HTTPS | Pass | Vercel enforces HTTPS |
| robots.txt | Pass | Correctly blocks /api/, /admin/; sitemap declared |
| /api-docs not disallowed | Warning | Should be disallowed in robots.ts |
| Canonical tags | Fail | Missing on all pages |
| noindex on /my-bets | Fail | Wallet-gated page in sitemap, no noindex |
| Page-level metadata | Fail | All pages share root layout title/description |
| Manifest linked from `<head>` | Fail | manifest.json exists but not referenced |
| Manifest branding | Fail | "Crypto World Cup" — violates CLAUDE.md |
| `generator: 'v0.app'` | Warning | Exposes toolchain |
| Security headers | Fail | None configured in next.config.mjs |
| `typescript: ignoreBuildErrors` | Warning | Type errors silently pass |
| OG tags completeness | Warning | Missing `og:type` and `og:url` on homepage and /teams |
| Farcaster fc:miniapp tag | Pass (app) | Present and functional in app |
| `lang` attribute | Pass | `<html lang="en">` correct |
| Sitemap | Warning | /my-bets included; dynamic routes missing; lastmod = build time |

### E-E-A-T (8/100)

| Signal | Status | Notes |
|--------|--------|-------|
| Team / author info | Fail | No attribution anywhere |
| About page | Fail | Does not exist |
| Privacy Policy | Fail | 404 — GDPR/CCPA non-compliant; GTM firing without consent |
| Terms of Service | Fail | 404 — required for ETH transaction site |
| Risk disclosure | Fail | No ETH volatility or smart contract risk warnings |
| Contact info | Fail | No email, form, or contact page |
| Smart contract transparency | Fail | No links to verified Basescan contracts |
| Cookie consent | Fail | GTM + GA4 fire without any consent mechanism |
| Social proof | Fail | No press, audits, or testimonials |
| YMYL classification | Note | Real ETH transactions = highest E-E-A-T standard applies |

### Content Quality Per Page

| Page | Content Score | Title Unique | Meta Unique | H1 Unique | Server-Rendered | Real Data |
|------|---------------|--------------|-------------|-----------|-----------------|-----------|
| `/` homepage | 18/100 | Yes | Yes | No (generic) | No | Partially |
| `/qualification` | 32/100 | Yes (OG only) | Yes (OG only) | No (same as homepage) | No | Yes |
| `/teams` | 14/100 | No | No | Yes | No | No (mock) |
| `/how-it-works` | 52/100 | No | No | No (jargon) | No (static content) | N/A |
| `/leaderboard` | 20/100 | No | No | Yes | No | Yes |

### Schema (0/100)

| Page | JSON-LD | Microdata | RDFa | Schema Score |
|------|---------|-----------|------|--------------|
| `/` | None | None | None | 0/100 |
| `/qualification` | None | None | None | 0/100 |
| `/teams` | None | None | None | 0/100 |
| `/leaderboard` | None | None | None | 0/100 |
| `/how-it-works` | None | None | None | 0/100 |

Estimated score after recommended implementations: **76/100**

### Sitemap (61/100)

| Check | Status | Notes |
|-------|--------|-------|
| Sitemap found | Pass | `/sitemap.xml` returns 200 |
| Declared in robots.txt | Pass | Correct |
| Valid XML | Pass | Well-formed |
| URL count | Warning | 9 static URLs; no dynamic routes |
| All listed URLs return 200 | Pass | Spot-checked ✓ |
| `/my-bets` in sitemap | Fail | Should be excluded (wallet-gated, no indexable content) |
| `lastmod` accuracy | Fail | All URLs share identical build timestamp |
| Dynamic routes included | Fail | `/qualification/[id]`, `/teams/[id]`, `/matches/[id]` all missing |
| Deprecated `changefreq`/`priority` | Warning | Present but ignored by Google |

### Performance (37/100)

| Check | Status | Notes |
|-------|--------|-------|
| `images: { unoptimized: true }` | Fail | Disables entire image pipeline |
| logo.png file size | Fail | 3.2 MB at 40–48px display size |
| Web3 provider initialization | Fail | 7-deep eager stack blocks hydration |
| Console.log in production | Fail | 1,245 calls across 35 files; some in JSX render |
| Farcaster SDK eager load | Fail | Loads for all visitors, not just Farcaster |
| Dual QueryClient instances | Warning | wagmi and app queries use separate caches |
| Dual analytics (GTM + GA4) | Warning | Two separate script loads |
| Font loading | Pass | `display: swap` + size-adjust fallback |
| Preconnect hints | Fail | None for GTM, analytics, or RPC endpoints |
| Estimated mobile LCP | Fail | ~4.5–7s (target: <2.5s) |
| Estimated mobile INP | Fail | ~300–500ms (target: <200ms) |
| Estimated CLS | Borderline | ~0.05–0.15 (target: <0.1) |
| TTFB | Pass | ~200–400ms |

### Mobile / Visual (71/100)

| Check | Status | Notes |
|-------|--------|-------|
| Onboarding modal fires every session | Fail | Blocks all above-the-fold content universally |
| No horizontal scroll | Pass | All viewports clean |
| Viewport meta tag | Pass | Correctly configured |
| Logo oversized | Fail | 2864×2664px natural size, 40–48px display |
| Touch targets ≥48px | Warning | Hamburger, Skip tour, Next button all 44px |
| Teams in navigation | Fail | `/teams` absent from sidebar and mobile nav |
| CONNECT button placement | Warning | In bottom bar, not top-right (Web3 convention) |
| Duplicate logo load | Warning | Logo loads twice (sidebar + mobile nav) |
| Imgur avatar alt text | Warning | `alt="rubendinis"` is not descriptive |
| No canonical tags | Fail | All pages missing |
| Missing `og:type` / `og:url` | Warning | Homepage and /teams missing both |

---

## Comparison with Landing Page Audit

| Category | Landing Page (onchainworldcup.xyz) | App (app.onchainworldcup.xyz) |
|----------|------------------------------------|-------------------------------|
| SEO Health Score | 47/100 | **34/100** |
| Canonical tags | Missing | Missing |
| Schema | 18/100 (OG partial credit) | 0/100 |
| Performance | 63/100 | 37/100 |
| Content quality | 52/100 | 27/100 (all shared title/desc) |
| E-E-A-T | 22/100 | 8/100 |
| Mobile | 72/100 | 71/100 |
| Branding compliance | Pass | **Fail** (manifest says "Crypto World Cup") |

The app subdomain has more severe issues primarily because:
1. Zero per-page metadata (landing page at least has unique homepage metadata)
2. More pages with more rendering and indexability issues
3. Manifest branding violation
4. Heavier JavaScript with more performance impact
5. Onboarding modal blocking every page

---

*Generated by Claude Code SEO Audit — 6 parallel subagents*
*Next audit recommended: After implementing Critical + High fixes (estimated +20–25 points)*
