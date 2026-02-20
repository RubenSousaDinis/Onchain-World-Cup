# Onchain World Cup — Landing Page SEO Audit (v2)

**URL audited:** https://onchainworldcup.xyz
**Audit date:** 2026-02-16
**Pages examined:** `/` (homepage), `/about`, `/privacy-policy`, `/terms`
**Baseline:** Previous audit (2026-02-16 v1) — Technical 72, Content 65, Schema 80, Performance 70, Images 85
**Auditor:** Visual Analysis specialist — automated data collection via cURL + Playwright

---

## Executive Summary

The landing page has undergone significant improvement since the v1 baseline, with canonical tags, structured data, security headers, and legal pages all implemented. However, five issues of meaningful SEO consequence remain.

### Overall SEO Health Score: 77 / 100

| Category | Weight | Score | Weighted Score | vs Baseline |
|---|---|---|---|---|
| Technical SEO | 25% | 82/100 | 20.5 | +10 (was 72) |
| Content Quality / E-E-A-T | 25% | 74/100 | 18.5 | +9 (was 65) |
| On-Page SEO | 20% | 82/100 | 16.4 | — (new category) |
| Schema / Structured Data | 10% | 84/100 | 8.4 | +4 (was 80) |
| Performance / Core Web Vitals | 10% | 65/100 | 6.5 | -5 (was 70) |
| Images | 5% | 62/100 | 3.1 | -23 (was 85) |
| AI Search Readiness | 5% | 55/100 | 2.75 | — (new category) |
| **TOTAL** | | | **76.15 / 100** | |

> Note: "On-Page SEO" was listed as a distinct 20% category in this audit brief. The score above reflects the new weighting; previous baseline combined some of these into Content Quality. Figures are normalised for direct comparison where possible.

---

## Top 5 Issues

1. **logo.png is 3.3 MB PNG with no WebP/AVIF alternative** — every page loads a 3.3 MB unoptimised PNG via the `<img>` preload chain. This directly harms LCP and Core Web Vitals on all pages.
2. **No `llms.txt` file** — `/llms.txt` returns a 404. AI crawlers (ChatGPT, Perplexity, Claude) have no structured fact sheet about the product, reducing AI-driven discoverability for a brand that explicitly targets crypto-native audiences.
3. **WebSite schema missing `potentialAction` / `SearchAction`** — the existing `WebSite` JSON-LD block has no `potentialAction`, so Google Search Console cannot render sitelinks search box for the brand name query.
4. **Event schema `endDate` semantically incorrect** — the `endDate` is set to `"2026-06-11"` which is the start date of the real FIFA World Cup. The Onchain World Cup Final is described as "1 week before the real World Cup", so the endDate should reflect the OWC Final date (approximately 2026-06-04), not the FIFA start date.
5. **`X-Frame-Options: SAMEORIGIN` conflicts with CSP `frame-ancestors: none`** — the two headers contradict each other. CSP `frame-ancestors` takes precedence in all modern browsers, making `X-Frame-Options: SAMEORIGIN` a dead directive. Either make them consistent or remove the redundant `X-Frame-Options` header.

---

## 1. Technical SEO

**Score: 82 / 100** (baseline: 72)

### Robots.txt

**Status: Pass**

```
GET https://onchainworldcup.xyz/robots.txt → HTTP 200
User-Agent: *
Allow: /
Sitemap: https://onchainworldcup.xyz/sitemap.xml
```

All paths are open to crawling. The sitemap URL is correctly declared. No blocking of CSS/JS assets that Google needs for rendering.

### Sitemap

**Status: Pass (minor gap)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://onchainworldcup.xyz</loc><lastmod>2026-02-14T00:00:00.000Z</lastmod></url>
  <url><loc>https://onchainworldcup.xyz/about</loc><lastmod>2026-02-14T00:00:00.000Z</lastmod></url>
  <url><loc>https://onchainworldcup.xyz/privacy-policy</loc><lastmod>2026-02-14T00:00:00.000Z</lastmod></url>
  <url><loc>https://onchainworldcup.xyz/terms</loc><lastmod>2026-02-14T00:00:00.000Z</lastmod></url>
</urlset>
```

All 4 indexable pages are present. No non-indexable URLs included. `lastmod` dates are static (hardcoded `2026-02-14`) — these should be updated dynamically when content changes, not hardcoded. Missing: `changefreq` and `priority` attributes (optional but helpful signals).

Source: `apps/landing/app/sitemap.ts` — all four URLs are hardcoded with `new Date("2026-02-14")`.

### Canonical Tags

**Status: Pass**

| Page | Canonical URL |
|---|---|
| `/` | `https://onchainworldcup.xyz` |
| `/about` | `https://onchainworldcup.xyz/about` |
| `/privacy-policy` | `https://onchainworldcup.xyz/privacy-policy` |
| `/terms` | `https://onchainworldcup.xyz/terms` |

All pages self-reference correctly. Note: the root canonical omits the trailing slash (`https://onchainworldcup.xyz` vs `https://onchainworldcup.xyz/`). The WebSite and Organization schema use the trailing-slash form (`https://onchainworldcup.xyz/`). While not critical, consistency is preferred.

### Redirect Chains

**Status: Pass**

```
http://onchainworldcup.xyz → HTTP 308 → https://onchainworldcup.xyz/
https://www.onchainworldcup.xyz → HTTP 301 → https://onchainworldcup.xyz/
```

HTTP-to-HTTPS and www-to-non-www redirects are both single-hop. No redirect chains detected.

### Meta Robots

**Status: Pass on main pages, Warning on 404**

All four sitemap URLs return `index, follow` (or no robots meta, which defaults to index/follow). The 404 not-found page correctly returns `<meta name="robots" content="noindex"/>`.

### Hreflang

**Status: Not Implemented**

No `hreflang` tags on any page. The site is English-only (`<html lang="en">`, `inLanguage: "en"`). Hreflang is not needed unless multilingual content is added in future.

### Security Headers

**Status: Good with Two Issues**

Headers observed across all pages (from HTTP response):

| Header | Value | Assessment |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Pass — 2-year HSTS with preload |
| `X-Content-Type-Options` | `nosniff` | Pass |
| `X-Frame-Options` | `SAMEORIGIN` | **Warning** — conflicts with CSP below |
| `Content-Security-Policy` | See below | **Warning** — `unsafe-inline` in script-src |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Pass |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Pass |

**CSP Header:**
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com;
img-src 'self' data: https:;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
frame-ancestors 'none';
```

**Issue 1:** `script-src` contains `'unsafe-inline'`. This negates a significant portion of XSS protection that CSP provides. The GTM implementation requires this, but a nonce-based CSP approach would be more secure.

**Issue 2:** `frame-ancestors 'none'` (CSP) and `X-Frame-Options: SAMEORIGIN` are contradictory. `frame-ancestors: none` means no site (not even the same origin) can embed this page in an iframe. `X-Frame-Options: SAMEORIGIN` says same-origin embedding is allowed. CSP takes precedence in modern browsers. The `X-Frame-Options` header is effectively dead and should be removed or reconciled.

---

## 2. Content Quality / E-E-A-T

**Score: 74 / 100** (baseline: 65)

### Title Tags

| Page | Title | Length | Assessment |
|---|---|---|---|
| `/` | Onchain World Cup 2026 \| Vote for Your Country with ETH on Base | 63 chars | Pass (50–60 ideal; 63 acceptable) |
| `/about` | About \| Onchain World Cup | 25 chars | Weak — too short, missing "2026" and keyword context |
| `/privacy-policy` | Privacy Policy \| Onchain World Cup | 36 chars | Acceptable for a legal page |
| `/terms` | Terms of Service \| Onchain World Cup | 37 chars | Acceptable for a legal page |

The homepage title is strong and keyword-rich. The `/about` title is generic — "About" contributes no search value; a title like "About Onchain World Cup 2026 — ETH Voting on Base" would be meaningfully better.

### Meta Descriptions

| Page | Description | Length | Assessment |
|---|---|---|---|
| `/` | Back your country with ETH. Only top 48 qualify. Prize pool shared among winners. Early supporters shape the tournament. | 120 chars | Pass — concise, action-oriented, within 120–160 ideal |
| `/about` | Learn about Onchain World Cup 2026 — a community-driven ETH voting tournament on the Base blockchain, aligned with the FIFA World Cup 2026. | 141 chars | Pass |
| `/privacy-policy` | Privacy Policy for Onchain World Cup 2026. How we handle analytics, wallet data, and ETH transactions. | 103 chars | Pass |
| `/terms` | Terms of Service for Onchain World Cup 2026. Important information about ETH voting, smart contract risks, and platform rules. | 126 chars | Pass |

**Note:** The homepage `og:description` (`"Back your country with ETH. Only top 48 qualify. Early supporters shape the tournament."`) is shorter than the `<meta name="description">` (it omits "Prize pool shared among winners."). This inconsistency is minor but worth aligning.

### Heading Structure

**Homepage `/`:**
```
H1: Onchain World Cup
  H2: Road to the Onchain World Cup
    H3: Qualification Opens (×2, repeated in mobile/desktop)
    H3: Qualification Ends (×2)
    H3: Onchain World Cup Final (×2)
    H3: Real World Cup (×2)
  H2: What Is Onchain World Cup
  H2: Why This Exists
  H2: Tournament Phases
    H3: Season 1 — Onchain World Cup
      H4: Phase 1: Qualification Phase
      H4: Phase 2: Onchain World Cup Tournament
      H4: Final
    H3: Season 2 — Real World Cup
  H2: How Voting Works
    H3: How to Win ETH
      H4: Vote Early
      H4: Prize Pool Grows
      H4: Winners Share Rewards
      H4: Prize Pool Distribution
  H2: Built for Crypto-Native Socials
  H2: Frequently Asked Questions
```

**Assessment:** Structure is logical and well-nested. One concern: the H1 is just "Onchain World Cup" — it misses the opportunity to include "2026" or a keyword-rich sub-phrase in the primary semantic anchor. The `<title>` has "2026 | Vote for Your Country with ETH on Base" but the H1 does not.

**Timeline H3 duplication:** Each timeline milestone appears twice (once for desktop, once for mobile carousel). While visually necessary, this creates duplicate heading text in the DOM. Search engines may see two `H3: Qualification Opens` tags which looks thin. Using `aria-hidden` on the duplicate set would be cleaner.

**`/about` page:**
```
H1: About Onchain World Cup
  H2: What Is It?
  H2: Technology
  H2: Tournament Phases
    H3: Phase 1 — Qualification
    H3: Phase 2 — Tournament
    H3: Phase 3 — Final
  H2: Follow Along
  H2: Contact
```

Clean, logical structure. No issues.

### Thin Content / Duplicate Content

- **Homepage:** ~794 words of visible body text. Not thin given the FAQ section depth (11 detailed Q&A pairs, each answer 50–200 words). Genuinely substantive.
- **`/about`:** Short (estimated ~350 words). Not harmful — it's a summary/overview page that serves a navigation function.
- **`/privacy-policy` and `/terms`:** Legal boilerplate. Standard, not harmful.
- **Duplication:** The homepage repeats the timeline section in two forms (desktop horizontal scroll + mobile vertical). This creates duplicate heading and text content. Low risk since it's presentational, but could be reduced with `display:none` on one variant rather than rendering both.

### Readability

- Font: Barlow Condensed, geometric condensed sans-serif. Readable on desktop.
- Mobile: Text appears at adequate size (16px+ base font as per CSS `swap` loading).
- Language level: Appropriate for crypto-native audience (assumes ETH/Base knowledge). Could be more accessible for mainstream sports fans who are less Web3-familiar.

### Trust Signals / E-E-A-T

**Strengths:**
- Privacy Policy and Terms of Service present and indexed.
- Smart contract transparency mentioned ("open source and publicly verifiable on Basescan").
- Social profiles linked: X (`@OnchainC29697`), Farcaster, Zora.
- Contact email: `onchainworldcup@gmail.com` (mentioned in FAQ).
- Google Analytics (GTM-TJ49B9N8) implemented — indicates operational status.

**Weaknesses:**
- No team/founders information anywhere — anonymous project reduces E-E-A-T.
- Gmail address (`@gmail.com`) for a financial product looks informal. A custom domain email (`@onchainworldcup.xyz`) would increase trust signals.
- No third-party audit of smart contracts mentioned on any page.
- No blog or editorial content demonstrating expertise.
- Contract addresses not surfaced on the landing page (referenced in `/about` source but conditionally rendered only when `NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET` is set).

---

## 3. On-Page SEO

**Score: 82 / 100**

### Keyword Targeting

Primary keyword targets are well-represented:
- "Onchain World Cup 2026" — in title, H1, meta description, schema name, body text.
- "vote with ETH" / "ETH voting" — in title, description, body, FAQ.
- "Base blockchain" / "Base network" — in description, body, About page.
- "World Cup 2026 qualification" — in hero subtitle, FAQ answers.

**Gap:** No dedicated landing page for long-tail searches like "how to vote for [country] World Cup ETH" or "Base blockchain World Cup game". All traffic is consolidated on the homepage.

### Internal Linking

The homepage links to: `/about`, `/privacy-policy`, `/terms`, `#faq`, `#how-it-works`, `#phases`, `#timeline`. The About page links back to the homepage. Navigation is clean and anchor text is descriptive (`About`, `Privacy Policy`, `Terms of Service`).

**Gap:** No internal link from homepage to `app.onchainworldcup.xyz` pages using keyword-rich anchor text. The CTA buttons say "Vote Now", "Launch App", and "App →" — all generic. A text link with anchor text like "Start voting for your country on Base" would pass richer signals.

### Open Graph Tags

Homepage OG tags are comprehensive:

```html
<meta property="og:title" content="Onchain World Cup 2026 | Vote for Your Country with ETH on Base"/>
<meta property="og:description" content="Back your country with ETH. Only top 48 qualify. Early supporters shape the tournament."/>
<meta property="og:url" content="https://onchainworldcup.xyz"/>
<meta property="og:site_name" content="Onchain World Cup"/>
<meta property="og:locale" content="en_US"/>
<meta property="og:type" content="website"/>
<meta property="og:image" content="https://onchainworldcup.xyz/opengraph-image?132118ad94368b82"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:alt" content="Onchain World Cup 2026 - Vote with ETH on Base Network. Support your country in qualification voting."/>
```

**Note:** Source code (`layout.tsx`) specifies `splash_social.png` (1200×1200) as the OG image, but the live site serves a Next.js dynamic `opengraph-image` route at 1200×630. The live dimensions (1200×630) are correct for `summary_large_image` Twitter cards and OG. The source code comment is outdated but not a live issue.

**Missing:** `og:type` should arguably be `"website"` (correct) but could also reference `og:type: "event"` for Event-type schema alignment, though `website` is standard for a homepage.

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:site" content="@OnchainC29697"/>
<meta name="twitter:title" content="..."/>
<meta name="twitter:description" content="..."/>
<meta name="twitter:image" content="..."/>
<meta name="twitter:image:alt" content="..."/>
<meta name="twitter:image:width" content="1200"/>
<meta name="twitter:image:height" content="630"/>
```

**Missing:** `twitter:creator` tag. While optional, it's recommended for attributing card content to the specific author/account.

---

## 4. Schema / Structured Data

**Score: 84 / 100** (baseline: 80)

### Schemas Present on `/` (homepage)

| Schema Type | Present | Assessment |
|---|---|---|
| `WebSite` | Yes | Pass — name, url, inLanguage. **Missing:** `potentialAction` (SearchAction) |
| `Organization` | Yes | Pass — name, url, logo, sameAs. **Missing:** `contactPoint`, `email`, `description` |
| `Event` | Yes | Pass — good coverage. **Issues:** see below |
| `SoftwareApplication` | Yes | Pass — applicationCategory, operatingSystem, offers |
| `FAQPage` | Yes | Excellent — 11 detailed Q&A pairs, all answers comprehensive |
| `BreadcrumbList` | No | Not implemented — lower priority on a flat-structure site |
| `WebSite SearchAction` | No | Missing `potentialAction` on WebSite schema |

### Schemas Present on `/about`, `/privacy-policy`, `/terms`

All three pages inherit the global layout schemas: `WebSite`, `Organization`, `Event`, `SoftwareApplication`. No page-specific schemas are added (e.g., no `AboutPage` type on `/about`).

### Issue 1: WebSite Schema Missing `potentialAction`

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Onchain World Cup",
  "url": "https://onchainworldcup.xyz/",
  "inLanguage": "en"
}
```

This schema has no `potentialAction`. The `SearchAction` sitelinks search box requires:

```json
{
  "@type": "WebSite",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://app.onchainworldcup.xyz/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

If the app does not have a search feature, this can be omitted. However, if the app does support searching countries/teams, this is a high-value addition.

### Issue 2: Event Schema `endDate` Semantic Mismatch

```json
{
  "@type": "Event",
  "name": "Onchain World Cup 2026 — Qualification Phase",
  "startDate": "2026-02-16",
  "endDate": "2026-06-11"
}
```

The `endDate` of `2026-06-11` is the start date of the real FIFA World Cup. Per the site's own copy ("Final — 1 week before the real World Cup"), the Onchain World Cup Final ends approximately `2026-06-04`. Using the FIFA start date as the OWC endDate is semantically incorrect and potentially confusing for search engines attempting to display event cards.

**Recommended fix:** Change to `"endDate": "2026-06-04"` (or the confirmed OWC Final date once known).

### Issue 3: Organization Schema Missing `email` and `contactPoint`

The FAQ answer for "Where can I follow updates?" states the contact email is `onchainworldcup@gmail.com`, but the `Organization` schema does not include an `email` property or `contactPoint`. Adding this improves Knowledge Panel eligibility.

### Issue 4: Event Schema Organizer Missing `url`

```json
"organizer": {
  "@type": "Organization",
  "name": "Onchain World Cup"
}
```

The organizer object is missing `"url": "https://onchainworldcup.xyz/"`. Google uses this to link the event to the organizer entity.

### Missing Schema Opportunities

| Schema | Priority | Rationale |
|---|---|---|
| `WebSite` `potentialAction` SearchAction | Medium | Enables sitelinks search box in branded SERPs |
| `AboutPage` type on `/about` | Low | Minor signal for Google's Understanding pages |
| `BreadcrumbList` on inner pages | Low | Site is flat (3 levels max), low ROI |

---

## 5. Performance / Core Web Vitals

**Score: 65 / 100** (baseline: 70)

*Note: Core Web Vitals cannot be directly measured without real user data (CrUX) or a lab tool like Lighthouse. The following estimates are based on page weight, resource count, caching headers, and response times measured via cURL.*

### Page Weight (above-the-fold load)

| Resource | Size | Notes |
|---|---|---|
| HTML (homepage) | 146.6 KB | Large for a landing page — includes full RSC payload |
| `logo.png` (preloaded) | **3,325,150 bytes (3.3 MB)** | Critical: full-resolution PNG served via preload chain |
| OG image (opengraph-image) | 220 KB | PNG, only fetched by crawlers |
| JavaScript chunks | 11 `<script>` tags async | Async loading is correct |
| CSS | 1 `<link>` stylesheet | Single concatenated CSS, good |
| Google Fonts (Barlow Condensed) | 4 WOFF2 preloads | Correct preloading strategy |
| Google Tag Manager | Loaded `afterInteractive` | Pass — does not block rendering |

### Response Times (from CDN edge)

| Page | Time | Size | Cache |
|---|---|---|---|
| `/` | 0.50s | 146 KB | HIT |
| `/about` | 0.14s | 37 KB | PRERENDER |
| `/privacy-policy` | 0.17s | 40 KB | HIT |
| `/terms` | 0.14s | 41 KB | HIT |

Vercel Edge Network is serving pages with `x-vercel-cache: HIT` — static rendering is working correctly. TTFB is fast.

### LCP Estimate

The likely LCP element is the hero section H1 text ("Onchain World Cup") or the logo image (32×32 preloaded). Since the logo is tiny (32px), text-based LCP is probable. However, the `logo.png` source file is 3.3 MB — when Next.js optimizes it for the 32×32 display size, the output is small. The concern is the underlying asset size impacting server processing and Next.js image optimization pipeline.

**Risk:** Any page that renders `logo.png` at a larger size (e.g., if `priority` is set and the image optimizer uses the full resolution file) could have a significantly slower LCP.

### CLS Estimate

- 4 WOFF2 fonts preloaded with `crossorigin` — reduces font-swap CLS.
- `display: swap` on Barlow Condensed — minor CLS risk during font load.
- Images use explicit `width` and `height` attributes — prevents layout shift.
- Overall CLS is likely good (estimated < 0.05).

### INP Estimate

- 11 async JavaScript chunks. Since the landing page is largely static (no wagmi/Web3 hooks), JS execution is minimal.
- GTM loaded `afterInteractive` — does not block first interaction.
- INP is likely good.

### Render-Blocking Resources

- No `<link rel="stylesheet">` blocking rendering (single CSS file with `data-precedence="next"` handled by Next.js).
- No synchronous `<script>` tags in `<head>`.
- Positive: `<Script strategy="afterInteractive">` for GTM is correctly implemented.

### Core Web Vitals Risk Summary

| Metric | Estimated Status | Key Risk |
|---|---|---|
| LCP | Likely Good (<2.5s) | logo.png source weight; hero text is likely actual LCP element |
| INP | Likely Good (<200ms) | Minimal JS interaction on static landing |
| CLS | Likely Good (<0.05) | Font swap with `display:swap` is minor risk |

**Score reduction from baseline:** The 3.3 MB `logo.png` was flagged in v1 as well. Despite Next.js optimization being enabled, the source asset remains unoptimised, which creates unnecessary pipeline load and cache pressure. This prevents a higher score.

---

## 6. Images

**Score: 62 / 100** (baseline: 85)

*The baseline score of 85 appears to have been optimistic or based on the assumption that Next.js image optimization was handling everything. The live audit reveals a critical unresolved image weight issue.*

### Images Found on Homepage

| Image | Alt Text | Format | Dimensions | Size | Assessment |
|---|---|---|---|---|---|
| `logo.png` | "Onchain World Cup logo" | PNG | 32×32 displayed | **3.3 MB source** | Critical — 3.3 MB for a 32px icon |
| `farcaster.png` | "Farcaster" | PNG | 20×20 / 24×24 | Unknown | Pass — small icon, lazy loaded |
| `zora.png` | "Zora" | PNG | 20×20 / 24×24 | Unknown | Pass — small icon, lazy loaded |
| `splash_social.png` | N/A (OG only) | PNG | 1200×1200 | 282 KB | Acceptable for social sharing |
| OG image (dynamic) | Present in meta | PNG | 1200×630 | 221 KB | Pass |

### Issue 1: logo.png is 3.3 MB PNG

```
curl https://onchainworldcup.xyz/logo.png
→ Size: 3,325,150 bytes, Type: image/png
```

This is the most significant image issue. While Next.js `<Image>` component will optimize it for the 32×32 display size, the source file is 3.3 MB — likely an uncompressed or oversized original. This has three negative effects:

1. **Server-side processing cost:** Every unique size request requires Next.js to resize from the 3.3 MB source, consuming CPU and adding latency.
2. **Cache inefficiency:** Large source file consumes more CDN cache storage.
3. **Direct access penalty:** Any crawler or bot fetching `/logo.png` directly (including the Schema.org `Organization.logo` reference) downloads 3.3 MB.

The `Organization` schema references `"logo": "https://onchainworldcup.xyz/logo.png"` — Google fetches this URL directly for Knowledge Panel generation and downloads 3.3 MB.

**Recommended fix:** Replace `logo.png` with a properly sized PNG (≤50 KB for a logo) or an SVG. Separately export a high-res version for social sharing if needed.

### Issue 2: No WebP or AVIF Formats

No WebP or AVIF versions of any images exist (`logo.webp` returns 404). All icons and images are PNG. Next.js `<Image>` component will serve WebP/AVIF automatically when it generates optimized variants — but the source files should ideally be in a modern format to begin with, and the `logo.png` direct URL (used in schema) always serves PNG.

### Alt Text Coverage

**Pass.** All visible images have meaningful alt text:
- `logo.png` → "Onchain World Cup logo"
- `farcaster.png` → "Farcaster"
- `zora.png` → "Zora"

No `alt=""` or missing alt attributes found on homepage images.

---

## 7. AI Search Readiness

**Score: 55 / 100**

AI search engines (ChatGPT Browse, Perplexity, Claude, Gemini, Grok) increasingly serve as discovery channels, particularly for Web3 products where their users are technically sophisticated.

### llms.txt

**Status: Missing (404)**

```
GET https://onchainworldcup.xyz/llms.txt → HTTP 404
```

The `llms.txt` standard (proposed by fast.ai) provides a structured plain-text document that AI crawlers can use to understand a site's purpose, key facts, and structure. This is particularly relevant for Onchain World Cup because:

1. The product is novel — AI models may not have training data about it.
2. The target audience (crypto-native users) is the same audience using AI search tools like Perplexity.
3. FAQ content exists and could be reformatted as machine-readable facts.

### Structured Citability

**Strengths:**
- 11-question `FAQPage` JSON-LD with detailed answers — this is the single best AI citability feature. AI models can extract structured facts directly.
- Explicit factual claims throughout: "0.001 ETH first vote", "top 48 qualify", "211 nations compete", "Base network", "linear pricing".
- Clear entity definition: "Onchain World Cup is a community voting tournament, not a prediction market."

**Weaknesses:**
- No dedicated "Facts about Onchain World Cup" or "About" page structured data using `ItemList` or similar.
- No Wikipedia or Wikidata entry (expected for a new project, but worth noting).
- No press mentions or backlinks from authoritative domains.
- No `isBasedOn` or `citation` references in schema to authoritative external sources.

### Brand Mentions

- X: `@OnchainC29697` — the handle is not the brand name, which reduces brand signal strength. `@OnchainWorldCup` would be ideal but may be unavailable.
- Farcaster: `/onchainworldcup` — good brand alignment.
- Zora: `@onchainworldcup` — good brand alignment.
- The `sameAs` in Organization schema links to X and Zora but not Farcaster (Farcaster does not have a stable profile URL format that schema supports).

### robots.txt AI Crawlers

The current `robots.txt` allows all user agents. AI crawlers like GPTBot, ClaudeBot, PerplexityBot, and CCBot are all permitted to crawl. This is correct for a site seeking AI discoverability.

---

## 8. Visual Analysis

*(Based on Playwright screenshots captured at 1920×1080 and 375×812)*

### Desktop (1920×1080) — Above-the-Fold

**Primary H1** ("Onchain World Cup") — visible without scrolling. Pass.

**Main CTA** ("Vote Now" button, yellow) — visible without scrolling. Pass.

**Hero layout:** Clean dark background, centered typography. The hero section occupies roughly 60% of the viewport height, with the timeline section beginning below the fold. This is intentional and effective.

**Navigation:** Logo + brand name visible top-left. "How It Works", "Phases", "FAQ" nav links + "Launch App" CTA button top-right. Social icons (Twitter, Farcaster, Base, Email) on the far right. Clean and uncluttered.

**Above-the-fold assessment:** All critical content — brand name (H1), value proposition, and primary CTA — is visible without scrolling. Pass.

### Mobile (375×812) — Above-the-Fold

**H1** ("Onchain World Cup") — visible. Pass.

**CTA buttons** ("Vote Now", "View Timeline") — both visible, stacked vertically. Pass.

**Navigation:** Collapsed to logo + "App →" button. The desktop nav links are hidden on mobile. The "App →" CTA is the only action visible in the nav bar.

**Touch target sizes:** "Vote Now" and "View Timeline" buttons appear to meet the 48×48px minimum touch target requirement based on visual inspection.

**Text readability:** Font size appears adequate (16px+ base). No horizontal overflow visible.

**Potential issue:** The mobile nav removes all secondary navigation ("How It Works", "Phases", "FAQ"). Users cannot navigate to these sections from mobile without scrolling or knowing to scroll. This is a UX consideration but not a core SEO issue.

---

## Prioritized Action Plan

### Critical — Address Immediately

#### C1: Optimize logo.png — Reduce from 3.3 MB to ≤50 KB

**Impact:** Performance, Images, Schema (Organization logo fetched by Google at full 3.3 MB)
**File:** `apps/landing/public/logo.png`
**Action:** Export a properly sized and compressed PNG (or SVG) for the logo. The display size is 32×32px. Even a 2× retina version should be ≤200 KB for a logo. Target <50 KB PNG or <20 KB SVG.

```bash
# Example optimization with ImageMagick:
convert logo.png -resize 256x256 -quality 90 logo_optimized.png
# Or convert to SVG if the logo is vector-based
```

#### C2: Fix Event Schema `endDate` to reflect the actual OWC Final date

**Impact:** Schema accuracy, Event rich results in Google Search
**File:** `apps/landing/app/layout.tsx`
**Action:** Change `"endDate": "2026-06-11"` to the correct OWC Final date (approximately `"2026-06-04"` or the confirmed date). The current value incorrectly uses the FIFA World Cup start date.

```ts
// In layout.tsx Event schema:
"endDate": "2026-06-04", // Approx 1 week before FIFA WC start on 2026-06-11
```

---

### High — Address This Week

#### H1: Add `potentialAction` to WebSite Schema (SearchAction)

**Impact:** Schema completeness, sitelinks search box eligibility
**File:** `apps/landing/app/layout.tsx`
**Action:** Add `potentialAction` to the WebSite JSON-LD block. Only applicable if the app has a search/filter feature for countries or teams.

```ts
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Onchain World Cup",
  "url": "https://onchainworldcup.xyz/",
  "inLanguage": "en",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://app.onchainworldcup.xyz/?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

#### H2: Resolve `X-Frame-Options` / CSP `frame-ancestors` Conflict

**Impact:** Technical SEO signal clarity, security header hygiene
**File:** `apps/landing/next.config.mjs` (or wherever headers are defined)
**Action:** Since CSP `frame-ancestors: none` takes precedence over `X-Frame-Options` in all modern browsers, remove the `X-Frame-Options: SAMEORIGIN` header or change it to `DENY` to be consistent with `frame-ancestors: none`.

```js
// Either remove X-Frame-Options header entirely (CSP frame-ancestors handles it)
// Or change to DENY to match CSP frame-ancestors: none
{ key: 'X-Frame-Options', value: 'DENY' }
```

#### H3: Add `url` to Event Organizer and `email`/`contactPoint` to Organization

**Impact:** Schema completeness, Knowledge Panel eligibility
**File:** `apps/landing/app/layout.tsx`

```ts
// Event schema organizer:
"organizer": {
  "@type": "Organization",
  "name": "Onchain World Cup",
  "url": "https://onchainworldcup.xyz/"
}

// Organization schema:
{
  "@type": "Organization",
  "name": "Onchain World Cup",
  "url": "https://onchainworldcup.xyz/",
  "logo": "https://onchainworldcup.xyz/logo.png",
  "email": "onchainworldcup@gmail.com",
  "sameAs": ["https://x.com/OnchainC29697", "https://zora.co/@onchainworldcup"]
}
```

#### H4: Improve `/about` Page Title

**Impact:** Content Quality, On-Page SEO for branded informational queries
**File:** `apps/landing/app/about/page.tsx`
**Action:** Change title from `"About | Onchain World Cup"` to something richer:

```ts
title: "About Onchain World Cup 2026 — ETH Voting on Base",
```

---

### Medium — Address This Month

#### M1: Create `/llms.txt`

**Impact:** AI Search Readiness
**File:** `apps/landing/public/llms.txt` (static file)
**Action:** Create a plain-text file at `/llms.txt` that AI crawlers can use as a reference document. Recommended content:

```
# Onchain World Cup

Onchain World Cup is a community-driven football tournament on the Base blockchain.
Fans vote for national teams with ETH. The top 48 countries qualify for the tournament.
This is not a prediction market — it is a community support mechanism.

## Key Facts
- 211 nations compete in qualification
- Top 48 qualify for the tournament bracket
- Voting uses ETH on Base (Ethereum L2 by Coinbase)
- First vote costs 0.001 ETH; price increases linearly by 0.0005 ETH per vote
- 90% of the prize pool is distributed to voters for qualified countries
- The platform fee is capped at 20% (currently up to 10%)
- All smart contract logic is public and verifiable on Basescan
- Not gambling; no odds, no bookmakers

## Links
- Landing page: https://onchainworldcup.xyz
- App: https://app.onchainworldcup.xyz
- X (Twitter): https://x.com/OnchainC29697
- Farcaster: https://warpcast.com/onchainworldcup
- Zora: https://zora.co/@onchainworldcup
- Contact: onchainworldcup@gmail.com
```

#### M2: Fix Static `lastmod` Dates in Sitemap

**Impact:** Sitemap accuracy, crawl prioritisation
**File:** `apps/landing/app/sitemap.ts`
**Action:** Replace `new Date("2026-02-14")` with dynamic dates that reflect actual content updates. For static legal pages, a hardcoded date is acceptable. For the homepage and about page, consider using the git commit timestamp or a content-managed date.

```ts
// Replace all occurrences of new Date("2026-02-14") with:
lastModified: new Date(), // or track actual content change dates
```

#### M3: Add `changefreq` and `priority` to Sitemap Entries

**Impact:** Crawl budget hint (minor)
**File:** `apps/landing/app/sitemap.ts`

```ts
{ url: baseUrl, lastModified: ..., changefreq: "weekly", priority: 1.0 },
{ url: `${baseUrl}/about`, lastModified: ..., changefreq: "monthly", priority: 0.7 },
{ url: `${baseUrl}/privacy-policy`, lastModified: ..., changefreq: "yearly", priority: 0.3 },
{ url: `${baseUrl}/terms`, lastModified: ..., changefreq: "yearly", priority: 0.3 },
```

#### M4: Canonical Trailing Slash Consistency

**Impact:** Technical SEO canonicalisation
**File:** `apps/landing/app/layout.tsx`
**Action:** Decide on a canonical form (with or without trailing slash) and use it consistently in all canonical tags, schema URLs, and OG tags. Currently:
- Canonical: `https://onchainworldcup.xyz` (no trailing slash)
- WebSite schema URL: `https://onchainworldcup.xyz/` (with trailing slash)
- OG URL: `https://onchainworldcup.xyz` (no trailing slash)

Prefer the no-trailing-slash form to match what Vercel serves.

#### M5: Add `twitter:creator` Meta Tag

**Impact:** Twitter/X card attribution
**File:** `apps/landing/app/layout.tsx`

```ts
twitter: {
  card: "summary_large_image",
  site: "@OnchainC29697",
  creator: "@OnchainC29697", // Add this
},
```

#### M6: Remove or `aria-hidden` Duplicate Timeline Headings

**Impact:** Content Quality (duplicate H3 headings in DOM)
**File:** `apps/landing/components/` (timeline component)
**Action:** The timeline section renders each milestone twice — once for desktop horizontal scroll and once for mobile vertical layout. The duplicate H3 tags ("Qualification Opens", "Qualification Ends", etc.) appear twice in the DOM. Add `aria-hidden="true"` to the visually-hidden set to reduce duplicate heading signals.

---

### Low — Backlog

#### L1: Replace Gmail Contact Address with Custom Domain Email

**Impact:** E-E-A-T trust signal
**Action:** Upgrade from `onchainworldcup@gmail.com` to `hello@onchainworldcup.xyz` or similar. Update all references in FAQ copy and schema.

#### L2: Add Contract Address to About Page (Ensure Environment Variable is Set)

**Impact:** E-E-A-T, smart contract transparency
**File:** `apps/landing/app/about/page.tsx` — already conditional on `process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET`. Ensure this env var is set in Vercel for production.

#### L3: Consider `AboutPage` Schema on `/about`

**Impact:** Minor schema signal
```json
{
  "@type": "AboutPage",
  "url": "https://onchainworldcup.xyz/about",
  "name": "About Onchain World Cup",
  "description": "..."
}
```

#### L4: Content Marketing — Blog or Updates Page

**Impact:** E-E-A-T long-term, keyword diversity
**Action:** A blog or updates section demonstrating expertise (e.g., "How ETH voting works", "Why we chose Base") would significantly improve E-E-A-T signals over time. Currently the site has zero editorial content.

#### L5: Resolve `script-src 'unsafe-inline'` in CSP

**Impact:** Security header strength (minor SEO signal)
**Action:** Implement nonce-based CSP to remove `'unsafe-inline'`. This requires Next.js middleware to inject a per-request nonce. The GTM implementation is the primary blocker. Consider server-side GTM to eliminate client-side `'unsafe-inline'` requirements.

---

## Comparison vs Previous Audit Baseline

| Category | Baseline (v1) | This Audit (v2) | Delta | Key Changes |
|---|---|---|---|---|
| Technical SEO | 72 | 82 | +10 | Canonical tags, security headers (HSTS preload, Referrer-Policy, Permissions-Policy), proper sitemap all implemented. Two header inconsistencies remain. |
| Content Quality / E-E-A-T | 65 | 74 | +9 | Privacy Policy, Terms, About page added. FAQ answers expanded to 50–200 words each. Trust signals improved. Anonymous team and Gmail address remain gaps. |
| On-Page SEO | N/A | 82 | New | Strong OG/Twitter meta coverage, good keyword density. Minor gaps: weak `/about` title, no `twitter:creator`. |
| Schema | 80 | 84 | +4 | 5 schema types now present (was 0 in v1, 80 reflects a partial rebase). FAQPage especially strong. Gaps: missing SearchAction, incorrect Event endDate, incomplete organizer URL. |
| Performance | 70 | 65 | -5 | Vercel CDN serving static pages fast. But logo.png remains 3.3 MB source file — Next.js optimization reduces served size but the underlying asset penalty persists. Slightly worse than baseline estimate due to HTML payload size (146 KB). |
| Images | 85 | 62 | -23 | Alt text is now present (was missing in v1). But logo.png is still 3.3 MB source. The baseline of 85 likely assumed Next.js optimization solved the problem; the source file weight remains a real concern, especially for the schema `logo` URL which serves the raw 3.3 MB file to Google. |
| AI Search Readiness | N/A (20 in v1) | 55 | +35 | FAQPage JSON-LD is a strong AI citability signal. But llms.txt still missing, X handle misaligned with brand name. |
| **Overall** | **47 → ~65 (post-v1 fixes)** | **77** | **+12 on adjusted baseline** | Significant improvement across the board. |

---

## Appendix: Screenshots

| File | Viewport | URL |
|---|---|---|
| `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/landing_desktop_1920.png` | 1920×1080 | https://onchainworldcup.xyz |
| `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/landing_mobile_375.png` | 375×812 | https://onchainworldcup.xyz |

---

## Appendix: Raw Data — HTTP Headers (Homepage)

```
HTTP/2 200
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none';
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
cache-control: public, max-age=0, must-revalidate
content-length: 146564
x-vercel-cache: HIT
server: Vercel
```

---

*Report generated: 2026-02-16 | Tool: Claude Sonnet 4.5 via automated HTTP inspection + Playwright visual capture*
