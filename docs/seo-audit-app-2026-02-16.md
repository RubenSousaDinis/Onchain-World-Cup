# Onchain World Cup App — SEO Audit

**URL:** https://app.onchainworldcup.xyz/
**Business Type:** Web3 dApp / Sports Voting Game (ETH voting on Base network)

---

## Score History

| Date | Score | Change |
|------|-------|--------|
| Feb 16, 2026 (baseline) | 34 / 100 | — |
| Feb 16, 2026 (re-audit after PRs #224, #225, rounds 3–4) | **67 / 100** | **+33** |

---

## Current Score Breakdown

| Category | Score | Max |
|----------|-------|-----|
| Technical SEO | 16 | 20 |
| Content Quality & E-E-A-T | 10 | 20 |
| On-Page SEO | 14 | 20 |
| Schema / Structured Data | 11 | 15 |
| Performance | 8 | 10 |
| Mobile / Visual | 5 | 8 |
| AI Search Readiness | 3 | 7 |
| **Total** | **67** | **100** |

---

## Implementation Status Tracker

| # | Item | Status | PR / Branch |
|---|------|--------|-------------|
| 1 | Onboarding modal fires every session | ✅ Done | #224 |
| 2 | Manifest branding: "Crypto World Cup" → "Onchain World Cup" | ✅ Done | #224 |
| 3 | Link manifest from `<head>` | ✅ Done | #224 |
| 4 | noindex for /my-bets and /api-docs | ✅ Done | #224 |
| 5 | Per-page metadata on all routes | ✅ Done | #224 |
| 6 | Privacy Policy + Terms of Service (landing domain) | ✅ Done | #225 |
| 7 | JSON-LD: WebSite + Organization in root layout | ✅ Done | #224 / #225 |
| 8 | Fix H1 on qualification page | ✅ Done | #224 |
| 9 | /teams mock data → noindex | ✅ Done | #225 |
| 10 | Remove `generator: 'v0.app'` | ✅ Done | #224 |
| 11 | Remove duplicate GA4 scripts (GTM only) | ✅ Done | #224 |
| 12 | Strip production console.log calls (removeConsole) | ✅ Done | #224 |
| 13 | Security headers (X-Frame, nosniff, Referrer, Permissions, HSTS) | ✅ Done | #224 / #225 |
| 14 | Re-enable Next.js image optimization | ✅ Done | #224 |
| 15 | ETH risk disclosure on /qualification | ✅ Done | #225 |
| 16 | Convert /how-it-works to Server Component | ✅ Done | #224 |
| 17 | Lazy-initialize Web3 provider stack | ❌ Skipped | Breakage risk |
| 18 | Fix dual QueryClient instances | ✅ Done | #225 |
| 19 | Gate Farcaster SDK behind env detection | ❌ Skipped | Breakage risk |
| 20 | Sitemap: remove /my-bets, fix lastmod, add dynamic routes | ✅ Done | #224 |
| 21 | generateMetadata on /qualification/[countryId] + /teams/[teamId] | ✅ Done | #224 / #225 |
| 22 | preconnect hints | ✅ Done | #224 |
| 23 | Add Teams to main navigation | ✅ Done | #225 |
| 24 | Breadcrumbs: [countryId], [teamId], [matchId], [address] | ✅ Done | #225 / round-4 |
| 25 | About page (linking to landing domain) | ✅ Done | #225 |
| 26 | Remove `typescript: { ignoreBuildErrors: true }` | ⏳ Pending | — |
| 27 | Lazy-load modal components via next/dynamic | ⏳ Backlog | — |
| 28 | Touch targets ≥ 48px | ✅ Done | round-4 |
| 29 | Mobile body font ≥ 16px | ✅ Done | round-4 |
| 30 | og:title / twitter:title consistency on /qualification | ✅ Done | round-4 |
| 31 | Imgur avatar alt text | ⏳ Backlog | — |
| 32 | Manifest icon purpose field | ✅ Done | #224 |
| — | /matches/[matchId] metadata + noindex + breadcrumbs | ✅ Done | round-4 |
| — | /schedule metadata + noindex (mock data) | ✅ Done | round-4 |
| — | /tournament metadata layout | ✅ Done | round-4 |
| N1 | noindex pages in sitemap (/teams/*, /schedule) | ❌ New issue | — |
| N2 | OG tags not unique on /leaderboard, /how-it-works, /teams, /tournament, /stats | ❌ New issue | — |
| N3 | No global site footer | ❌ New issue | — |
| N4 | Risk disclaimer missing from homepage | ❌ New issue | — |
| N5 | H1 on /how-it-works is "PROJECT PHASES" (wrong) | ❌ New issue | — |
| N6 | /stats has no H1 | ❌ New issue | — |
| N7 | /about, /privacy, /terms return 404 on app domain | ❌ New issue | — |
| N8 | access-control-allow-origin: * set on HTML routes (should be /api only) | ❌ New issue | — |
| N9 | No BreadcrumbList on static routes | ❌ New issue | — |
| N10 | Organization schema missing logo | ❌ New issue | — |
| N11 | WebSite schema missing potentialAction / SearchAction | ❌ New issue | — |
| N12 | Mobile nav missing "How it Works" link | ❌ New issue | — |
| N13 | how-it-works lastmod = 2026-01-01 (stale) | ❌ New issue | — |
| N14 | Twitter handle @OnchainC29697 looks auto-generated | ⏳ Low | — |

---

## Remaining Issues (by priority)

### P0 — Critical

**N1. noindex pages in sitemap (/teams/*, /schedule)**
192 `/teams/*` pages and `/schedule` are tagged `noindex` in their HTML but appear in `sitemap.xml`. This wastes crawl budget and creates a directive conflict — Googlebot ignores the sitemap hint but is still directed there.
- File: `apps/app/app/sitemap.ts` — remove all `/teams/*` entries and `/schedule`

**N2. OG tags not unique on secondary routes**
`/leaderboard`, `/how-it-works`, `/teams`, `/tournament`, and `/stats` all share the homepage OG block. `og:url` points to the homepage, `og:title` reads the homepage headline, and `og:image` is the same static hash. When any of these pages is shared on X, Farcaster, or Discord the social card shows the homepage — not the actual page.
- Files: each page's `metadata` export — add unique `openGraph.url`, `openGraph.title`, `openGraph.description`, `openGraph.images`

### P1 — High

**N3. No global site footer**
No `<footer>` element exists on any page. Trust signals (risk disclaimer, privacy/terms links, social links) are only present on `/qualification`. Homepage, leaderboard, and how-it-works have zero crawlable trust content.
- File: `apps/app/app/layout.tsx` — add a `<footer>` with risk disclaimer, links to landing-domain privacy/terms, and social channels

**N4. Risk disclaimer missing from homepage**
The homepage HTML has no "afford to lose", "ETH is irreversible", or risk-related copy anywhere. Google classifies this site as YMYL (real money transactions) — E-E-A-T requires persistent, crawlable risk disclosure on every page, starting with the homepage.
- File: `apps/app/app/page.tsx` — add static disclaimer below hero, or rely on global footer (fix N3 first)

**N5. H1 on /how-it-works is "PROJECT PHASES"**
The `<title>` is "How It Works | Onchain World Cup 2026" but the rendered H1 is "PROJECT PHASES". Search engines weight H1 heavily for topic relevance; an H1 that doesn't match the title depresses ranking for "how does Onchain World Cup work" queries.
- File: `apps/app/app/how-it-works/page.tsx` — change H1 to "How It Works" or "How Onchain World Cup Works"

**N6. /stats has no H1**
The statistics page renders a correct `<title>` and canonical but no H1 at all. Missing H1 is a notable on-page signal loss.
- File: `apps/app/app/stats/page.tsx` — add `<h1>Statistics</h1>` or "Onchain World Cup 2026 Statistics"

### P2 — Medium

**N7. /about, /privacy, /terms return 404 on app domain**
These pages exist on the landing domain (`https://onchainworldcup.xyz/about` etc.) but the app domain has no equivalent. The `/qualification` page links to `onchainworldcup.xyz/terms` — consistent enough for now — but if any content on the app domain ever links to `/terms` or `/privacy` without the full origin, users and crawlers hit 404.
- Option A: Add redirect rules pointing `/about` → `https://onchainworldcup.xyz/about` etc. in `next.config.mjs`
- Option B: Create thin pages on app domain that render the same content or redirect

**N8. access-control-allow-origin: * on HTML pages**
The CORS wildcard header is applied globally (`source: "/(.*)"`) rather than scoped to API routes. This is harmless but unnecessary on HTML responses and expands the API's attack surface.
- File: `apps/app/next.config.mjs` — scope `access-control-allow-origin: *` to `source: "/api/(.*)"`

**N9. No BreadcrumbList on static routes**
BreadcrumbList is only present on dynamic `/qualification/[country]` pages. `/qualification`, `/leaderboard`, `/how-it-works`, `/teams`, and `/tournament` have no breadcrumb schema. Google uses this for SERP breadcrumb display.
- Files: each route's `layout.tsx` or `page.tsx` — add a static BreadcrumbList JSON-LD block

**N10. Organization schema missing logo**
The Organization JSON-LD has `name`, `url`, and `sameAs` but no `logo` field. Google requires `logo` for Knowledge Panel eligibility.
- File: `apps/app/app/layout.tsx` — add `"logo": "https://app.onchainworldcup.xyz/logo.png"` to the Organization block

**N11. WebSite schema missing potentialAction**
The WebSite JSON-LD is missing a `SearchAction`, which enables the Google Sitelinks Search Box SERP feature.
- File: `apps/app/app/layout.tsx` — add `potentialAction` with target pointing to `/qualification?q={search_term_string}`

**N12. Mobile nav missing "How it Works"**
The sidebar has 6 links (Qualification, Teams, Tournament, Leaderboard, My Votes, How it Works) but the mobile bottom nav has only 5 (no "How it Works"). Users on mobile cannot discover that page from navigation.
- File: `apps/app/components/mobile-nav.tsx` — add "How it Works" entry

### Low / Backlog

- **N13** Update `/how-it-works` lastmod from `2026-01-01` to current deployment date in sitemap
- **N14** Update Twitter handle `@OnchainC29697` to a branded handle in `apps/app/app/layout.tsx`
- Add `FAQPage` JSON-LD to `/how-it-works` for AI search citation
- Add `Content-Security-Policy` header
- Remove `typescript: { ignoreBuildErrors: true }` from `next.config.mjs`
- Lazy-load modal components via `next/dynamic`

---

## What Gets You to 80+

1. Fix OG tags on all secondary routes (N2) — social sharing from 4/5 pages is currently broken
2. Remove noindex pages from sitemap (N1) — 193 wasted crawl budget entries
3. Add global footer with risk disclaimer (N3 + N4) — YMYL E-E-A-T requirement
4. Fix H1 on /how-it-works + add H1 to /stats (N5 + N6) — two-line changes
5. Add BreadcrumbList + Organization logo + WebSite potentialAction (N9–N11)

*Next recommended audit: after implementing P0 + P1 items.*
