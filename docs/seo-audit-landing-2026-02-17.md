# SEO Audit: onchainworldcup.xyz (Landing Page)

**Audit Date:** 2026-02-17
**Audited By:** Claude Sonnet 4.5 (Sitemap Architecture Specialist)
**Scope:** https://onchainworldcup.xyz — marketing landing page for Onchain World Cup 2026

---

## SEO Health Score: 85 / 100

| Category | Score | Max |
|---|---|---|
| Technical SEO | 21 | 25 |
| Content Quality | 16 | 20 |
| On-Page SEO | 18 | 20 |
| Structured Data / Schema | 13 | 15 |
| Performance | 8 | 10 |
| AI Search Readiness | 9 | 10 |
| **TOTAL** | **85** | **100** |

Overall assessment: The landing page is in good shape for a new crypto product. Core indexability, canonicals, and schema are solid. The main drag on the score is a single systemic bug — the `og:url`, `og:title`, and `twitter:title` tags are hardcoded in the root layout and therefore identical on every page. This is the highest-priority fix.

---

## Pages Crawled

| URL | HTTP Status | Size | Notes |
|---|---|---|---|
| https://onchainworldcup.xyz | 200 | 144 KB | Homepage |
| https://onchainworldcup.xyz/about | 200 | 38.4 KB | About page |
| https://onchainworldcup.xyz/privacy-policy | 200 | 39.9 KB | Privacy Policy |
| https://onchainworldcup.xyz/terms | 200 | 40.8 KB | Terms of Service |
| https://onchainworldcup.xyz/sitemap.xml | 200 | 742 B | Valid XML |
| https://onchainworldcup.xyz/robots.txt | 200 | 75 B | Correct |
| https://onchainworldcup.xyz/llms.txt | 200 | 748 B | Present |
| https://www.onchainworldcup.xyz | 301 | — | Redirects to non-www |
| https://onchainworldcup.xyz/faq | 404 | — | Not in sitemap — correct |
| https://onchainworldcup.xyz/blog | 404 | — | Not in sitemap — correct |

No pages were found that are in the sitemap but returning non-200 status. No crawlable pages were found that are missing from the sitemap.

---

## Critical Issues (Blocks Indexing or Causes Penalties)

None identified. All four sitemap pages are returning HTTP 200 and are indexable.

---

## High Priority Issues (Significant Ranking or Social Impact)

### H1: `og:url`, `og:title`, and `twitter:title` are hardcoded to the homepage on all pages

**Severity:** High
**Affected pages:** `/about`, `/privacy-policy`, `/terms`

The root `layout.tsx` defines a global `openGraph.url` pointing to the homepage. Because the `/about`, `/privacy-policy`, and `/terms` pages do not override `og:url`, `og:title`, or `twitter:title` in their own `metadata` exports, all three subpages share the homepage's Open Graph identity.

**Observed values (all three subpages):**
```html
<meta property="og:url" content="https://onchainworldcup.xyz"/>
<meta property="og:title" content="Onchain World Cup 2026 | Vote for Your Country with ETH on Base"/>
<meta name="twitter:title" content="Onchain World Cup 2026 | Vote for Your Country with ETH on Base"/>
```

**Expected for `/about`:**
```html
<meta property="og:url" content="https://onchainworldcup.xyz/about"/>
<meta property="og:title" content="About Onchain World Cup 2026 — ETH Voting on Base"/>
<meta name="twitter:title" content="About Onchain World Cup 2026 — ETH Voting on Base"/>
```

**Impact:** When users share these pages on X/Twitter, Discord, or Telegram, the unfurl card shows the homepage URL and title. This creates broken social previews for three of the four indexed pages. Google also uses `og:url` as a signal when consolidating duplicate content signals, though this is secondary to the canonical tag (which is correctly set per-page).

**Fix:** In each page's `metadata` export, add explicit `openGraph` and `twitter` overrides. Example for `/about/page.tsx`:

```typescript
export const metadata: Metadata = {
  title: "About Onchain World Cup 2026 — ETH Voting on Base",
  description: "Learn about Onchain World Cup 2026...",
  alternates: { canonical: "https://onchainworldcup.xyz/about" },
  robots: { index: true, follow: true },
  openGraph: {
    url: "https://onchainworldcup.xyz/about",
    title: "About Onchain World Cup 2026 — ETH Voting on Base",
    description: "Learn about Onchain World Cup 2026...",
  },
  twitter: {
    title: "About Onchain World Cup 2026 — ETH Voting on Base",
    description: "Learn about Onchain World Cup 2026...",
  },
}
```

Apply the same pattern to `privacy-policy/page.tsx` and `terms/page.tsx`.

---

### H2: `og:image` on `/about`, `/privacy-policy`, `/terms` is 1200x1200 — wrong aspect ratio for Twitter

**Severity:** High (social preview quality)
**Affected pages:** `/about`, `/privacy-policy`, `/terms`

The layout.tsx defines a fallback `og:image` of `/splash_social.png` at `1200x1200`. Twitter (`summary_large_image`) renders best with 1200x630 (2:1 ratio). A square image will be cropped or displayed as a small thumbnail depending on the platform.

**Homepage** correctly uses the dynamically generated `/opengraph-image` at `1200x630`. The subpages fall back to the square image because they do not define their own `openGraph.images`.

**Fix:** Either create a 1200x630 version of the social splash image, or add per-page `openGraph.images` pointing to the same generated OG image endpoint (or a static 1200x630 image), as part of the fix described in H1 above.

---

## Medium Priority Issues (Optimisation Opportunities)

### M1: Homepage title tag is 63 characters — 3 over the soft limit

**Severity:** Medium
**Page:** https://onchainworldcup.xyz

```
"Onchain World Cup 2026 | Vote for Your Country with ETH on Base"
```
Length: 63 characters. Google truncates titles at approximately 600px pixel width, which corresponds roughly to 55-60 characters in standard fonts. The current title may be truncated in SERPs to `"Onchain World Cup 2026 | Vote for Your Country with ETH on B..."`.

**Suggested alternative (57 chars):**
```
Onchain World Cup 2026 | Vote with ETH on Base
```

Or retain the keyword richness and accept the truncation risk — the primary keyword `Onchain World Cup 2026` appears early so truncation does not harm keyword visibility.

---

### M2: Sitemap uses deprecated `changefreq` and `priority` tags

**Severity:** Medium (noise, no harm, but wastes maintenance effort)
**File:** `apps/landing/app/sitemap.ts`

All four URLs include `changeFrequency` and `priority` fields. Google has publicly confirmed it ignores both tags. Bing also ignores `priority`. These fields add payload to the sitemap without benefit.

**Current sitemap output:**
```xml
<url>
  <loc>https://onchainworldcup.xyz</loc>
  <lastmod>2026-02-17T10:02:30.901Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1</priority>
</url>
```

**Recommended sitemap output:**
```xml
<url>
  <loc>https://onchainworldcup.xyz</loc>
  <lastmod>2026-02-17</lastmod>
</url>
```

Note also that `lastmod` for the homepage and `/about` are set to `new Date()` (build time), not the actual last content modification date. This means the timestamp changes every time Vercel rebuilds, which is misleading. Use a hardcoded ISO date string for stable pages, only updating it when content genuinely changes.

**Fix in `apps/landing/app/sitemap.ts`:**
```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://onchainworldcup.xyz"

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-02-17"),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-02-17"),
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2026-02-16"),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-02-16"),
    },
  ]
}
```

---

### M3: `Organization` schema is missing Farcaster/Warpcast in `sameAs`

**Severity:** Medium (knowledge graph quality)
**Page:** All pages (defined in `layout.tsx`)

The `Organization` schema `sameAs` array includes X and Zora but omits Warpcast, which is the primary social channel for the target audience (crypto-native users on Farcaster). Google uses `sameAs` to build knowledge graph entity connections.

**Current:**
```json
"sameAs": [
  "https://x.com/OnchainC29697",
  "https://zora.co/@onchainworldcup"
]
```

**Recommended:**
```json
"sameAs": [
  "https://x.com/OnchainC29697",
  "https://warpcast.com/onchainworldcup",
  "https://zora.co/@onchainworldcup"
]
```

Note: The page links use `https://farcaster.xyz/onchainworldcup` but the canonical Farcaster profile URL is `https://warpcast.com/onchainworldcup` (as documented in `llms.txt`). The `sameAs` should use the canonical Warpcast URL. The body links could optionally be updated to Warpcast for consistency, though both resolve correctly.

---

### M4: `Event` schema image is an SVG

**Severity:** Medium (rich result eligibility)
**Page:** All pages (defined in `layout.tsx`)

```json
"image": "https://onchainworldcup.xyz/logo.svg"
```

Google's structured data guidelines require images in Event rich results to be in a raster format (JPG, PNG, WebP). SVG images are not supported for Event rich results and will prevent the schema from qualifying for the visual carousel in Google Search.

Additionally, the SVG file is 891KB — an unusually large SVG that may indicate embedded raster content. This should be investigated and optimised regardless.

**Fix:** Reference the existing PNG OG image or a dedicated event image:
```json
"image": "https://onchainworldcup.xyz/android-chrome-512x512.png"
```

Or create a dedicated event hero image in JPG/PNG format.

---

### M5: `About` page lacks internal links back to key site sections

**Severity:** Medium (internal linking equity)
**Page:** https://onchainworldcup.xyz/about

The `/about` page has zero internal links to the homepage's FAQ section, the app URL's qualification page, or other landing page sections. The only internal navigation is the `← Back to Home` footer link.

Strong internal linking on the about page would:
1. Pass PageRank to the homepage
2. Give Google a clearer site structure signal
3. Improve user navigation for users who land on `/about` directly

**Recommended additions:**
- Link "0.001 ETH" pricing mention to `/#how-voting-works` anchor on homepage
- Link "Base Network" to an external Coinbase Base explainer (builds topical authority)
- Link "Smart Contracts" to the Basescan contract address (adds E-E-A-T credibility)
- Add a visible CTA linking to `https://app.onchainworldcup.xyz`

Note: The `contractAddress` variable is conditionally rendered in `about/page.tsx` only when `process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET` is set. If this env variable is not set in the Vercel production environment for the landing app, the Basescan link will be invisible to users and crawlers. Verify this is configured.

---

### M6: `about` page has thin unique content relative to homepage

**Severity:** Medium (content quality / E-E-A-T)
**Page:** https://onchainworldcup.xyz/about

The `/about` page word count is approximately 390 meaningful body words. The homepage covers much of the same territory (What is it, How voting works, Tournament phases) with far more depth. The about page currently adds limited unique value.

While this is not a thin content penalty risk at this scale (4 pages total), if the site grows, this page could be a duplication concern.

**Recommended improvements:**
- Add a "Team" or "Who built this?" section — even pseudonymous team info improves E-E-A-T
- Add the Basescan contract address(es) directly (verifiable on-chain credibility)
- Add a "Roadmap" or "Season 2" section with unique forward-looking content
- Add a press/media kit link or contact for journalists (supports E-E-A-T expertise signals)

---

## Low Priority Issues (Nice to Have)

### L1: No `hreflang` tags

**Severity:** Low
**Pages:** All

The site is English-only with `og:locale` set to `en_US`. No hreflang tags are required unless non-English versions are added. No action needed unless international expansion is planned.

---

### L2: `logo.svg` is 891KB

**Severity:** Low (performance, not directly SEO)
**Asset:** https://onchainworldcup.xyz/logo.svg

A 891KB SVG is extremely large. SVGs should typically be under 20KB. This size suggests either embedded raster images within the SVG, or unoptimised paths/gradients. While the logo loads from the CDN (Vercel Edge Network) and is not in the critical rendering path for the main page content, it impacts the `Organization` schema image and any social context where it is used.

**Recommended action:** Run the SVG through SVGO (`npx svgo logo.svg --output logo.optimized.svg`) or rebuild it from vector sources. Target under 30KB.

---

### L3: `SoftwareApplication` schema uses `priceCurrency: "ETH"`

**Severity:** Low (schema validity)
**Page:** All pages (defined in `layout.tsx`)

The `Offer` schema within `SoftwareApplication` specifies:
```json
"priceCurrency": "ETH"
```

Schema.org `priceCurrency` expects an ISO 4217 currency code. "ETH" is not an ISO 4217 code. Google's structured data validator may flag this as a warning. This is unlikely to cause any practical ranking harm, but it prevents proper rich result rendering for pricing.

**Option 1 — Use USD equivalent and note ETH:**
```json
"offers": {
  "@type": "Offer",
  "price": "0.00",
  "priceCurrency": "USD",
  "description": "Free to use. Voting requires ETH on Base (starts at 0.001 ETH per vote)."
}
```

**Option 2 — Remove the offers field** since the app's pricing is variable and ETH price changes. A missing offers field is cleaner than an invalid one.

---

### L4: Twitter handle `@OnchainC29697` is not brand-consistent

**Severity:** Low (brand recognition, not SEO)

The Twitter/X handle `@OnchainC29697` appears non-intuitive for new users discovering the project. While this is not an SEO issue per se, users searching for the brand on X may have difficulty finding it, and social citations in search results will show the handle. If the handle can be changed to something like `@OnchainWorldCup`, it would improve brand discoverability.

This observation is for awareness — changing an existing handle has its own tradeoffs.

---

### L5: `manifest.json` icon `purpose` value uses both `"any"` and `"maskable"` in one string

**Severity:** Low (PWA quality)

```json
{
  "purpose": "any maskable"
}
```

The Web App Manifest spec supports `"purpose": "any maskable"` as a space-separated list. However, best practice is to provide separate icon objects: one with `"purpose": "any"` and one with `"purpose": "maskable"` pointing to a masked version of the icon. Combined `"any maskable"` can cause display issues on some Android launchers where a masked icon is used in contexts that expect a non-masked icon.

This does not affect SEO but affects PWA experience and could indirectly affect engagement metrics.

---

## Sitemap Validation Report

| Check | Result | Notes |
|---|---|---|
| Valid XML format | PASS | Well-formed XML with correct namespace |
| URL count | PASS | 4 URLs (limit: 50,000) |
| All URLs return 200 | PASS | All 4 pages are live and indexable |
| No noindexed URLs in sitemap | PASS | No noindex meta found on any page |
| No redirected URLs in sitemap | PASS | All canonical, no redirects in listed URLs |
| `lastmod` accuracy | WARN | Homepage/About use build timestamp (`new Date()`), not real modification date |
| `changefreq` tags | INFO | Present on all 4 URLs — Google ignores this field |
| `priority` tags | INFO | Present on all 4 URLs — Google ignores this field |
| Index sitemap needed | N/A | 4 URLs — no index sitemap required |
| Homepage URL format | PASS | `https://onchainworldcup.xyz` — matches canonical (no trailing slash) |

### Sitemap vs Crawl Coverage

**Pages in sitemap and confirmed 200:** All 4 match.

**Pages crawled but NOT in sitemap:** None found. The 404 pages checked (`/faq`, `/blog`, `/how-it-works`, `/leaderboard`) are correctly absent from the sitemap.

**Pages in sitemap but NOT returning 200:** None.

---

## Structured Data / Schema Audit

| Schema Type | Fields Present | Issues |
|---|---|---|
| `WebSite` | name, url, inLanguage, potentialAction | PASS |
| `Organization` | name, url, logo, email, description, sameAs | WARN: sameAs missing Warpcast; logo is 891KB SVG |
| `Event` | name, description, startDate, endDate, image, eventStatus, eventAttendanceMode, location, organizer | WARN: image is SVG (Google requires raster for rich results) |
| `SoftwareApplication` | name, url, applicationCategory, operatingSystem, description, offers | WARN: priceCurrency "ETH" is not ISO 4217 |
| `FAQPage` | mainEntity (12 Q&As) | PASS — excellent depth and length |
| `AboutPage` (on /about) | url, name, description, isPartOf | PASS |

---

## Technical SEO Summary

### Security Headers

All pages return the following headers — this is a strong configuration:

```
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
content-security-policy: (configured, restricts script/img/style/font sources)
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
```

### Caching

Pages are served with `cache-control: public, max-age=0, must-revalidate` and `x-vercel-cache: HIT` on subsequent requests. This is Vercel's standard ISR behavior — pages are cached at the CDN edge and revalidated after `x-nextjs-stale-time: 300` (5 minutes). No issues.

### Robots.txt

```
User-Agent: *
Allow: /

Sitemap: https://onchainworldcup.xyz/sitemap.xml
```

Correct. No disallow rules needed for a 4-page marketing site. The sitemap declaration is present.

### Canonical Tags

| Page | Canonical | Status |
|---|---|---|
| https://onchainworldcup.xyz | `https://onchainworldcup.xyz` | PASS |
| https://onchainworldcup.xyz/about | `https://onchainworldcup.xyz/about` | PASS |
| https://onchainworldcup.xyz/privacy-policy | `https://onchainworldcup.xyz/privacy-policy` | PASS |
| https://onchainworldcup.xyz/terms | `https://onchainworldcup.xyz/terms` | PASS |

All canonicals are self-referencing and correct. There is a minor inconsistency: the `alternates.canonical` in `layout.tsx` hardcodes `https://onchainworldcup.xyz/` (with trailing slash), but the rendered `<link rel="canonical">` tag outputs `https://onchainworldcup.xyz` (without trailing slash). Next.js normalises the URL correctly. However, the `WebSite` schema `url` field uses a trailing slash while the canonical does not. These should be made consistent — pick one form and use it everywhere.

### www Redirect

```
https://www.onchainworldcup.xyz → 301 → https://onchainworldcup.xyz/
```

Correct permanent redirect. The redirect target includes a trailing slash; canonical uses no trailing slash. Vercel normalises this appropriately.

---

## On-Page SEO Details

### Title Tags

| Page | Title | Length | Status |
|---|---|---|---|
| Homepage | `Onchain World Cup 2026 \| Vote for Your Country with ETH on Base` | 63 chars | WARN (3 over soft limit) |
| About | `About Onchain World Cup 2026 — ETH Voting on Base` | 49 chars | PASS |
| Privacy | `Privacy Policy \| Onchain World Cup` | 34 chars | PASS (acceptable for legal page) |
| Terms | `Terms of Service \| Onchain World Cup` | 36 chars | PASS |

### Meta Descriptions

| Page | Description | Length | Status |
|---|---|---|---|
| Homepage | `Back your country with ETH. Only top 48 qualify. Prize pool shared among winners. Early supporters shape the tournament.` | 120 chars | PASS |
| About | `Learn about Onchain World Cup 2026 — a community-driven ETH voting tournament on the Base blockchain, aligned with the FIFA World Cup 2026.` | 139 chars | PASS |
| Privacy | `Privacy Policy for Onchain World Cup 2026. How we handle analytics, wallet data, and ETH transactions.` | 102 chars | PASS (slightly short, acceptable) |
| Terms | `Terms of Service for Onchain World Cup 2026. Important information about ETH voting, smart contract risks, and platform rules.` | 125 chars | PASS |

### H1 Structure

All four pages have exactly one `<h1>` tag. Hierarchy is logical (H1 → H2 → H3). No heading skips detected.

### Image Alt Text

All `<img>` elements observed on the homepage have descriptive `alt` attributes. Social icon links (X, Farcaster, Zora) use image elements with alt text matching the platform name. The anchor elements wrapping social icons have empty text content, but the `<img alt="">` attributes are populated, so screen readers receive a label.

---

## AI Search Readiness

### llms.txt

Present at https://onchainworldcup.xyz/llms.txt. Content is well-structured:
- Project summary in plain language
- Key facts as a bullet list (pricing, mechanics, pool distribution)
- How-it-works step list
- All relevant links including app, social, and contact

This is a high-quality `llms.txt` that makes the product directly citable by AI assistants. The pricing facts (0.001 ETH first vote, 0.0005 ETH linear increment, 90% prize pool distribution, 10% fee) are machine-readable and factually accurate.

**One discrepancy noted:** `llms.txt` references `https://warpcast.com/onchainworldcup` for Farcaster, while the HTML links use `https://farcaster.xyz/onchainworldcup`. These should be consistent. Warpcast is the canonical URL for Farcaster profiles.

### FAQ Schema

The `FAQPage` schema with 12 detailed Q&As is the strongest AI-search asset on the site. Each answer is 100-200 words and directly addresses likely user questions. This format is directly ingestible by AI search engines and voice assistants.

### Missing for Full AI Search Coverage

- No Basescan contract address linked from the landing page (verifiable trust signal for AI)
- No security audit report or third-party verification cited
- No explicit mention of the deployer / team identity (reduces cited authority)

---

## Summary: Recommended Fix Priority

| Priority | Issue | Effort | Impact |
|---|---|---|---|
| High | Fix `og:url`, `og:title`, `twitter:title` on `/about`, `/privacy-policy`, `/terms` | Low (3 metadata exports) | High (social sharing) |
| High | Fix OG image aspect ratio on subpages (1200x1200 → 1200x630) | Low | High (social previews) |
| Medium | Remove `changefreq` + `priority` from sitemap; fix `lastmod` to use static dates | Low | Medium (sitemap quality) |
| Medium | Add Warpcast URL to `Organization` sameAs | Trivial | Medium (knowledge graph) |
| Medium | Change `Event` schema `image` from `.svg` to `.png`/`.jpg` | Trivial | Medium (rich results) |
| Medium | Verify `NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET` is set in landing Vercel env | Trivial | Medium (E-E-A-T on about) |
| Medium | Add unique content to `/about` page (team, contract, roadmap) | Medium | Medium (E-E-A-T) |
| Medium | Shorten homepage title to under 60 chars | Trivial | Low-Medium |
| Low | Optimise `logo.svg` (currently 891KB) | Low | Low (performance) |
| Low | Fix `SoftwareApplication` offers priceCurrency (ETH is not ISO 4217) | Trivial | Low (schema validity) |
| Low | Harmonise Farcaster links: use `warpcast.com` consistently in HTML and `llms.txt` | Trivial | Low |
| Low | Separate manifest icon purposes into distinct objects | Trivial | Low (PWA) |

---

*Report generated on 2026-02-17 against live production at https://onchainworldcup.xyz.*
*Source files inspected: `apps/landing/app/layout.tsx`, `apps/landing/app/sitemap.ts`, `apps/landing/app/robots.ts`, `apps/landing/app/about/page.tsx`.*
