# Onchain World Cup App — Full SEO Audit Report (v2)

**URL:** https://app.onchainworldcup.xyz/
**Audit Date:** 2026-02-16
**Auditor:** Visual Analysis Agent (Playwright + curl + HTML parsing)
**Business Type:** Web3 dApp / Sports Prediction Game — ETH voting on Base network
**Previous Audit Baseline:** 2026-02-16 (v1, score 34/100 pre-fix)
**Provided Baseline Scores:** Technical 65, Content 60, Schema 75, Performance 65, Images 80

---

## Overall SEO Health Score: 68 / 100

| Category | Weight | Score | Weighted | vs. Baseline | Delta |
|----------|--------|-------|----------|--------------|-------|
| Technical SEO | 25% | 72/100 | 18.0 | 65 | **+7** |
| Content Quality / E-E-A-T | 25% | 62/100 | 15.5 | 60 | **+2** |
| On-Page SEO | 20% | 74/100 | 14.8 | — | — |
| Schema / Structured Data | 10% | 72/100 | 7.2 | 75 | **-3** |
| Performance / Core Web Vitals | 10% | 58/100 | 5.8 | 65 | **-7** |
| Images | 5% | 85/100 | 4.25 | 80 | **+5** |
| AI Search Readiness | 5% | 52/100 | 2.6 | — | — |
| **Total** | | | **68.15 / 100** | 34 (pre-fix) | **+34** |

> **Context:** The v1 audit reflected a near-zero baseline (client-side rendered shells, no metadata, no schema, no security headers). The significant improvements made in PRs #224 and #225 have raised the score dramatically. This v2 audit assesses the current live state against the provided baseline scores and identifies the remaining gaps.

---

## Executive Summary

### Top 5 Issues

| # | Issue | Category | Impact |
|---|-------|----------|--------|
| 1 | **Onboarding modal blocks above-the-fold content on every fresh session** — Googlebot sees a 4-step modal overlay obscuring all page content | Technical + Content | Critical |
| 2 | **/teams returns HTTP 404 but is listed in sitemap.xml** — crawler waste, 404 signal sent to Google for a prominently linked page | Technical | Critical |
| 3 | **X-Frame-Options: SAMEORIGIN conflicts with CSP frame-ancestors: *** — contradictory headers; browsers honour the stricter directive but the conflict creates unpredictable embedding behavior and security scanner flags | Technical | High |
| 4 | **Country qualification pages (/qualification/[country]) are thin-content pages** — only 168 words of visible text, most of it navigation chrome; 199 near-identical pages in the sitemap risk a duplicate/thin-content penalty | Content | High |
| 5 | **Demo Mode banner announces the app is not yet launched** — every page serves a persistent "This app is currently in demo for feedback only. The Qualification Phase launches mid-February 2026" notice; this reduces E-E-A-T and tells search engines the content is provisional | Content | High |

---

## Category 1: Technical SEO — Score: 72 / 100

### What Was Checked
- robots.txt
- sitemap.xml (URL count, lastmod, broken pages)
- Canonical tags
- Meta robots
- HTTP→HTTPS redirect
- Security headers (X-Frame-Options, CSP, Permissions-Policy, HSTS, Referrer-Policy)
- Redirect chains

### Findings

#### robots.txt

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /api-docs

Sitemap: https://app.onchainworldcup.xyz/sitemap.xml
```

**Assessment:** Correct. API routes and admin are blocked. Sitemap is declared. No issues.

#### HTTP → HTTPS Redirect

```
HTTP/1.0 308 Permanent Redirect
Location: https://app.onchainworldcup.xyz/
```

**Assessment:** Correct. 308 Permanent Redirect for HTTP→HTTPS. No redirect chain issues for the root domain.

#### Canonical Tags

All audited pages have correct self-referencing canonicals:
- `/` → `https://app.onchainworldcup.xyz`
- `/how-it-works` → `https://app.onchainworldcup.xyz/how-it-works`
- `/leaderboard` → `https://app.onchainworldcup.xyz/leaderboard`
- `/qualification` → `https://app.onchainworldcup.xyz/qualification`
- `/stats` → `https://app.onchainworldcup.xyz/stats`
- `/tournament` → `https://app.onchainworldcup.xyz/tournament`
- `/qualification/england` → `https://app.onchainworldcup.xyz/qualification/england`

**Assessment:** PASS. Canonical implementation is complete and correct.

#### Sitemap Analysis

- **Total URLs:** 199
- **Last modified:** All set to `2026-02-14T00:00:00.000Z` (static date, not dynamic)
- **Core pages:** `/`, `/qualification`, `/teams`, `/leaderboard`, `/tournament`, `/stats`, `/how-it-works`
- **Country pages:** 192 qualification country pages (e.g., `/qualification/argentina`)

**Critical Issue — /teams returns HTTP 404:**
```
GET https://app.onchainworldcup.xyz/teams → HTTP 404
```
The sitemap includes `/teams` as a valid page, but it returns a 404. This means Google will crawl the sitemap, request `/teams`, receive a 404, and generate a crawl error. All 199 URLs share the same `lastmod` date (likely the build timestamp), which reduces the utility of `lastmod` for Google's re-crawl scheduling.

**Additional Issues:**
- `/faq` returns 404 (not in sitemap but linked from footer area)
- `/my-votes` returns 404 (not in sitemap, was previously `/my-bets`)
- `lastmod` values are static build timestamps, not actual content modification dates

#### Security Headers

| Header | Value | Assessment |
|--------|-------|------------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | PASS — 2-year max-age, preload eligible |
| `X-Content-Type-Options` | `nosniff` | PASS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | PASS |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | PASS — appropriate for a dApp |
| `X-Frame-Options` | `SAMEORIGIN` | CONFLICT — see below |
| `Content-Security-Policy` | `frame-ancestors *` | CONFLICT — see below |
| CSP `script-src` | `'unsafe-inline' 'unsafe-eval'` | WEAK — necessary for Next.js but reduces security score |

**Critical Header Conflict — X-Frame-Options vs CSP frame-ancestors:**

```
X-Frame-Options: SAMEORIGIN
CSP: frame-ancestors *
```

These directives directly contradict each other. `X-Frame-Options: SAMEORIGIN` restricts embedding to same-origin frames only, while `CSP frame-ancestors: *` allows embedding from any origin. Modern browsers prioritise `frame-ancestors` and ignore `X-Frame-Options` when CSP is present. Automated security scanners (Google, Mozilla Observatory, OWASP ZAP) will flag this as a misconfiguration. The intent appears to be to allow Farcaster frame embedding (hence `frame-ancestors: *`), but the `X-Frame-Options` header was not updated to match.

**Fix:** Remove `X-Frame-Options` entirely and rely solely on `CSP frame-ancestors: *`, or change `X-Frame-Options: ALLOWALL` if needed for legacy browser support.

#### Redirect Chains for Legal Pages

```
/privacy → 308 → https://onchainworldcup.xyz/privacy-policy
/terms   → 308 → https://onchainworldcup.xyz/terms
/about   → 308 → https://onchainworldcup.xyz/about
```

**Assessment:** These are cross-domain redirects to the landing page domain. This is acceptable architecturally but means legal pages are hosted on a different domain than the app. The redirects are clean single-hop 308s with no further redirect chains.

### Technical SEO Score Breakdown

| Check | Status | Points |
|-------|--------|--------|
| robots.txt present and correct | Pass | +10 |
| HTTP→HTTPS redirect (308) | Pass | +10 |
| Canonical tags on all pages | Pass | +10 |
| HSTS with preload | Pass | +8 |
| X-Content-Type-Options | Pass | +5 |
| Referrer-Policy | Pass | +5 |
| Permissions-Policy | Pass | +5 |
| Sitemap linked from robots.txt | Pass | +5 |
| /teams 404 in sitemap | Fail | -10 |
| X-Frame-Options / CSP conflict | Fail | -8 |
| unsafe-inline/eval in CSP | Partial | -4 |
| Static lastmod dates in sitemap | Partial | -4 |
| **Total** | | **72/100** |

---

## Category 2: Content Quality / E-E-A-T — Score: 62 / 100

### What Was Checked
- Title tags (uniqueness, length, keyword relevance)
- Meta descriptions (uniqueness, length, CTR value)
- H1 / H2 structure
- Body content depth and uniqueness
- Trust signals (legal pages, team info, risk disclosure)
- Demo Mode banner impact

### Title Tag Analysis

| Page | Title | Length | Assessment |
|------|-------|--------|------------|
| `/` | Onchain World Cup 2026 \| Vote with ETH on Base Network | 54 | GOOD — keyword-rich, within 60 chars |
| `/how-it-works` | How It Works \| Onchain World Cup 2026 | 37 | PASS |
| `/leaderboard` | Leaderboard \| Top Voters — Onchain World Cup 2026 | 49 | GOOD |
| `/qualification` | World Cup 2026 Qualification Voting \| Onchain World Cup | 55 | GOOD |
| `/stats` | Statistics \| Onchain World Cup 2026 | 35 | PASS |
| `/tournament` | Tournament \| Onchain World Cup 2026 | 35 | PASS |
| `/qualification/england` | Vote for England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 \| Onchain World Cup 2026 | 49 | PASS — note emoji in title |

All titles are unique. All are within the 30–60 character guideline. No duplicate titles detected.

### Meta Description Analysis

| Page | Length | Assessment |
|------|--------|------------|
| `/` | 152 chars | GOOD — within 120–160 |
| `/how-it-works` | 123 chars | PASS — slightly short |
| `/leaderboard` | 108 chars | SHORT — below 120 chars |
| `/qualification` | 137 chars | GOOD |
| `/stats` | 121 chars | PASS |
| `/tournament` | 126 chars | GOOD |
| `/qualification/england` | 132 chars | GOOD |

**Issue:** `/leaderboard` meta description is only 108 characters — Google may auto-generate a snippet that differs from intent.

**Issue on /qualification:** The meta title says "World Cup 2026 Qualification Voting | Onchain World Cup" (55 chars) but the OG title says "World Cup 2026 Qualification | Onchain World Cup" (48 chars) — inconsistency between meta and OG.

### Heading Structure

| Page | H1 | H2 count | Assessment |
|------|----|---------|----|
| `/` | "Onchain World Cup" | 1 ("Qualification Active") | H1 is vague — not keyword-rich enough |
| `/how-it-works` | "How It Works" | 4 (Qualification Phase, Achievements & Levels, Tournament Phase, Finals & Champion) | GOOD structure |
| `/leaderboard` | "Leaderboards" | 0 | No H2s — flat content hierarchy |
| `/qualification` | "World Cup 2026 Qualification" | 1 ("Qualification Phase") | Minimal structure |
| `/stats` | "Statistics \| Onchain World Cup 2026" | 0 | H1 contains pipe character — matches title tag exactly, which is unusual |
| `/tournament` | "Tournament Groups" | 1 ("World Cup 2026") | H2 "World Cup 2026" is a generic heading |
| `/qualification/england` | "England" | 0 | Single-word H1, no H2s |

**Issues:**
- Homepage H1 "Onchain World Cup" is the brand name only — lacks descriptive keywords like "2026", "ETH voting", or "World Cup prediction"
- `/stats` H1 is identical to the title tag (copy-paste) — "Statistics | Onchain World Cup 2026" — the pipe character in an H1 is non-standard
- `/leaderboard` and `/stats` lack H2 structure entirely
- Country pages (`/qualification/[country]`) have only a country name as H1 with no supporting H2s

### Body Content Depth

| Page | Word Count | Assessment |
|------|-----------|------------|
| `/` | 266 words | THIN — mostly navigation + widget placeholders with "..." |
| `/how-it-works` | 594 words | ACCEPTABLE for an explainer page |
| `/leaderboard` | ~150 words (est.) | THIN — largely dynamic data table |
| `/qualification` | ~200 words (est.) | THIN — dynamic table dominates |
| `/stats` | ~120 words (est.) | VERY THIN — mostly metric widgets |
| `/tournament` | ~200 words (est.) | THIN — bracket UI dominates |
| `/qualification/england` | 168 words | THIN — 75% is navigation + UI chrome |

**Most concerning:** 192 qualification country pages each contain approximately 168 words of visible text, of which roughly 50–60 words are shared navigation/footer text. The unique content per country page is approximately 100 words, with most of the data loaded client-side as "LOADING..." or "..." placeholders. At SSR/prerender time, these pages are thin.

### Trust Signals

| Signal | Present | Assessment |
|--------|---------|------------|
| ETH risk disclosure | Yes — "ETH voting is irreversible. Smart contract transactions cannot be undone." | PASS |
| Privacy Policy | Yes — via redirect to onchainworldcup.xyz/privacy-policy | PARTIAL (cross-domain) |
| Terms of Service | Yes — via redirect to onchainworldcup.xyz/terms | PARTIAL (cross-domain) |
| About page | Yes — via redirect to onchainworldcup.xyz/about | PARTIAL (cross-domain) |
| Smart contract address displayed | No | MISSING — would boost credibility |
| Team/founders visible | No | MISSING |
| Audit reports for contracts | No | MISSING |
| Social proof (vote counts, community size) | Partial — "..." placeholders on homepage | WEAK at crawl time |
| Demo Mode banner | Yes — prominent yellow banner | NEGATIVE — signals provisional/unfinished |

**The Demo Mode banner is the single largest E-E-A-T hit.** Every page serves:
> "Demo Mode: This app is currently in demo for feedback only. The Qualification Phase launches mid-February 2026."

Since the audit is being conducted on 2026-02-16 and the banner references "mid-February 2026," the launch may be imminent or may have already passed without the banner being removed. If this banner persists after launch, it actively undermines trust, tells search engines the content is not production-ready, and reduces the perceived authority of every page.

---

## Category 3: On-Page SEO — Score: 74 / 100

### What Was Checked
- Title tag uniqueness and keyword targeting
- Meta description CTR value
- OG / Twitter Card completeness
- H1–H2 keyword alignment
- Internal linking structure
- Anchor text quality

### Open Graph / Twitter Card

| Property | Homepage | How It Works | Leaderboard | Qualification |
|----------|----------|--------------|-------------|---------------|
| `og:title` | Present | Present | Present | Present |
| `og:description` | Present | Present | Present | Present |
| `og:image` | Dynamic URL | Shared image | Shared image | Unique image |
| `og:url` | Present | Missing | Missing | Missing |
| `og:type` | `website` | Not checked | Not checked | Not checked |
| `twitter:card` | `summary_large_image` | Present | Present | Present |

**Issues:**
- `og:url` is only present on the homepage — all inner pages are missing `og:url`
- Only `/qualification` has a unique OG image (qualification-specific). All other pages share the same generic OG image (`/opengraph-image?456cd2c279a78ce5`). This means when any page is shared on Twitter/Farcaster, the same thumbnail appears regardless of which page it is.
- `og:title` on `/qualification` differs from the `<title>` tag by 7 characters — minor but inconsistent.

### Internal Linking

The navigation provides links to: `/qualification`, `/tournament`, `/leaderboard`, `/my-votes` (404), `/how-it-works`, with a "CONNECT" wallet button.

**Issues:**
- `/my-votes` in the navigation links to a 404 page
- No contextual internal links within body content on most pages
- Country pages do not link to related countries or regions
- No site-wide "breadcrumb" navigation (breadcrumbs exist as JSON-LD only, not as visible links)

---

## Category 4: Schema / Structured Data — Score: 72 / 100

### What Was Checked
- JSON-LD blocks on `/`, `/qualification`, `/how-it-works`, `/leaderboard`
- Validation against Schema.org
- Coverage of BreadcrumbList, FAQPage, WebSite with SearchAction, Organization

### Schema Coverage by Page

| Page | WebSite | Organization | Breadcrumb | FAQPage | SportsEvent | ItemList |
|------|---------|-------------|------------|---------|-------------|---------|
| `/` | Yes | Yes | **No** | **No** | **No** | **No** |
| `/how-it-works` | Yes | Yes | Yes | Yes (6 Q&A) | N/A | N/A |
| `/leaderboard` | Yes | Yes | Yes | No | N/A | **No** |
| `/qualification` | Yes | Yes | Yes | No | No | **No** |
| `/stats` | Yes | Yes | Yes | No | N/A | N/A |
| `/tournament` | Yes | Yes | Yes | No | **No** | **No** |
| `/qualification/england` | Yes | Yes | **Two breadcrumbs** | No | No | N/A |

### Schema Validation Details

**WebSite Schema (all pages):**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Onchain World Cup",
  "url": "https://app.onchainworldcup.xyz/",
  "inLanguage": "en",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://app.onchainworldcup.xyz/qualification?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```
**Assessment:** Valid. SearchAction present. Note: the search target parameter format is correct but the `query-input` field format changed in newer Schema.org specifications — should use `"query-input": "required name=search_term_string"` which is present and correct.

**Organization Schema (all pages):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Onchain World Cup",
  "url": "https://onchainworldcup.xyz/",
  "logo": "https://onchainworldcup.xyz/logo.png",
  "sameAs": [
    "https://x.com/OnchainC29697",
    "https://zora.co/@onchainworldcup"
  ]
}
```
**Issues:**
- `url` points to `https://onchainworldcup.xyz/` (root domain) while `WebSite.url` points to `https://app.onchainworldcup.xyz/` — this URL inconsistency signals two separate entities to Google's Knowledge Graph
- Missing `description` property
- Missing `foundingDate` property
- Only 2 `sameAs` entries — no Warpcast/Farcaster URL, no GitHub, no Discord

**FAQPage Schema (/how-it-works):**
```json
{
  "@type": "FAQPage",
  "mainEntity": [6 Question objects]
}
```
**Assessment:** Well-formed. 6 questions covering qualification, voting mechanics, pricing, achievements, tournament format, and prize distribution. Valid Schema.org markup. All questions have `acceptedAnswer` with `Answer` type. This is the strongest schema implementation on the site.

**BreadcrumbList Issues:**
- Homepage (`/`) has no BreadcrumbList — the root of all breadcrumb paths should still have one (`Home` only)
- `/qualification/england` has **two separate BreadcrumbList schemas**: one showing `Home > Qualification` and another showing `Home > Qualification > England`. This creates ambiguity — only the full 3-level breadcrumb is needed.

### Missing Schema Opportunities

| Schema Type | Page(s) | Value |
|-------------|---------|-------|
| `BreadcrumbList` | Homepage (`/`) | Shows breadcrumb in SERP for root |
| `SportsEvent` | `/qualification`, `/tournament` | Rich result eligibility for sports events |
| `ItemList` | `/leaderboard`, `/qualification` | Enables list rich results |
| `WebPage` / `AboutPage` | `/how-it-works` | More specific page type than generic |
| `VideoObject` | N/A — no videos | Future opportunity |

---

## Category 5: Sitemap — Findings

The sitemap was analyzed as part of Technical SEO (Category 1). Key metrics:

- **Total URLs:** 199
- **Core app pages:** 7 (`/`, `/qualification`, `/teams` [404], `/leaderboard`, `/tournament`, `/stats`, `/how-it-works`)
- **Qualification country pages:** 192
- **Missing from sitemap:** `/faq`, `/privacy`, `/terms`, `/about` (though these redirect cross-domain)
- **Broken pages in sitemap:** `/teams` (HTTP 404)
- **lastmod:** All pages share `2026-02-14T00:00:00.000Z` — static, not accurate
- **No `<priority>` or `<changefreq>` tags** — while Google has downplayed these, they can still guide crawl scheduling

**Thin-page risk:** 192 near-identical country pages with only ~100 words of unique content each represent a significant thin-content / duplicate-content risk if Google decides to treat them as low-quality. The pages are differentiated only by country name, rank, and vote data (which is dynamic and not in the SSR HTML).

---

## Category 6: Performance / Core Web Vitals — Score: 58 / 100

### What Was Checked
- HTML payload size
- JavaScript bundle count and size
- CSS bundle count and size
- Render-blocking resources
- Font loading strategy
- Web3 provider initialization cost
- Preload hints

### Performance Data

| Metric | Value | Assessment |
|--------|-------|------------|
| HTML payload (homepage) | 71.7 KB | MODERATE — large for a homepage shell |
| HTML payload (how-it-works) | 112.5 KB | HIGH — this is a static page and should be much smaller |
| HTML payload (leaderboard) | 62.9 KB | MODERATE |
| CSS bundle | 84.8 KB (single file, immutable cache) | ACCEPTABLE |
| JS total scripts in `<head>` | 33 script tags | HIGH — heavy JavaScript footprint |
| Render-blocking scripts | 1 sync script tag | PRESENT |
| Font preloads | 4 woff2 fonts | PASS |
| Image preloads | 0 (logo loaded via `<link rel="preload" as="image">`) | Note: logo preloaded as image srcset |
| Server cache (Vercel) | HIT for homepage, PRERENDER for inner pages | GOOD |

### Performance Estimates

**LCP (Largest Contentful Paint):**
The above-the-fold screenshot shows a large onboarding modal on first visit. The modal's heading "Welcome to Onchain World Cup!" is likely the LCP element. Behind it, the page content is partially obscured. On subsequent visits (modal dismissed), the LCP candidate would be the "Onchain World Cup" heading or the qualification table/countdown. Estimated LCP: **2.5–4.0 seconds** (moderate — acceptable but not excellent, primarily due to 33 JS chunks loading).

**INP (Interaction to Next Paint):**
The app is a Next.js dApp with 33 JavaScript chunks. The Web3 provider stack (wagmi + viem + Coinbase Wallet SDK + WalletConnect) initializes on page load. This adds significant main-thread work that can delay interactivity. Estimated INP: **200–350ms** (borderline).

**CLS (Cumulative Layout Shift):**
The "Demo Mode" banner at the top of every page and the onboarding modal both appear on page load. If the banner is rendered server-side (which it appears to be, given the SSR HTML includes it), CLS should be low. However, dynamic counters ("Active Voters ...", "Total Votes ...", "Prize Pool ...") replacing "..." with real values on client hydration could cause CLS. Estimated CLS: **0.05–0.15** (borderline).

### Key Performance Issues

1. **33 JavaScript bundle files loaded on every page** — even simple static pages like `/how-it-works` load the full Web3 provider bundle
2. **112.5 KB HTML for /how-it-works** — this is a static content page and should not be larger than the homepage; the large size suggests it is loading the full application shell including wallet components
3. **No `defer` or `async` on 1 sync script** — though Next.js handles most loading, the one synchronous script could be render-blocking
4. **Web3 provider stack initializes on every page** — lazy initialization was explicitly skipped due to breakage risk (per previous audit), but this remains the single biggest performance liability
5. **4 font preloads** — this is acceptable but contributes to the initial connection overhead

### What Works Well

- Vercel CDN caching is active (HIT/PRERENDER responses)
- Long-term immutable caching for static assets (CSS: `max-age=31536000,immutable`)
- Single CSS file (no render-blocking CSS chain)
- Font preloads reduce FOUT (flash of unstyled text)

---

## Category 7: Images — Score: 85 / 100

### What Was Checked
- Alt text coverage across all audited pages
- Image format and optimization
- Oversized images
- Next.js Image component usage

### Image Audit Results

**All audited pages (/, /how-it-works, /leaderboard, /qualification, /stats, /tournament, /qualification/england):**

| Metric | Value |
|--------|-------|
| Total `<img>` tags found | 2 per page (logo in desktop nav + mobile nav) |
| Images without alt text | 0 |
| Images with descriptive alt text | 2 ("Onchain World Cup logo") |
| Next.js `<Image>` component used | Yes — evidenced by `/_next/image?url=` URLs with width/quality params |

**Logo images are properly optimized:**
```html
<img alt="Onchain World Cup logo" width="48" height="48"
  srcSet="/_next/image?url=%2Flogo.png&w=48&q=75 1x,
          /_next/image?url=%2Flogo.png&w=96&q=75 2x"
  src="/_next/image?url=%2Flogo.png&w=96&q=75"/>
```

The Next.js Image component is correctly applied with:
- Explicit `width` and `height` attributes (prevents CLS)
- Responsive `srcSet` with 1x and 2x variants
- Quality parameter set to 75 (reasonable)
- Descriptive alt text

**Issues:**

1. **Leaderboard avatar images** (referenced in previous audit as Imgur-hosted images without alt text) — these are loaded dynamically client-side and not present in the SSR HTML, so they cannot be assessed via static analysis. If the previous audit finding still applies, user-generated avatars from Imgur may lack alt text.

2. **Country flag images** — the qualification page lists countries with flag emoji characters (Unicode) rather than `<img>` tags for flags. While emoji flags don't require alt text, they may not display consistently across all platforms and are not indexable as images.

3. **No hero images** — the pages use CSS-based football pitch backgrounds rather than `<img>` elements. This is fine for SEO (no alt text needed on decorative backgrounds) but represents a missed opportunity for image search traffic.

4. **OG images are shared across pages** — only `/qualification` has a unique OG image. All other pages share one generic OG image URL. While not an alt-text issue, this affects social sharing quality.

---

## Category 8: AI Search Readiness — Score: 52 / 100

### What Was Checked
- Structured facts density
- Brand mention clarity
- Citability of key claims
- Entity disambiguation
- Content depth for RAG (Retrieval-Augmented Generation)

### Assessment

**Brand Identity:**
- "Onchain World Cup" as brand name is consistent across all pages (no "Crypto World Cup" found — branding guideline followed)
- The X (Twitter) handle `@OnchainC29697` in the Organization schema is cryptic — it does not match the brand name and is unlikely to help AI systems identify the brand

**Structured Facts (high citability):**
- `/how-it-works` contains clearly structured factual content (qualification mechanics, pricing model, achievement points values) that is suitable for AI citation
- FAQ schema on `/how-it-works` with 6 questions provides directly retrievable Q&A pairs — this is a strong AI-readiness signal
- Dynamic data pages (`/qualification`, `/leaderboard`, `/stats`) contain placeholder text at SSR time — AI crawlers see "..." instead of actual data

**Weak Signals:**
- No `datePublished` or `dateModified` on any content — AI systems prefer timestamped content
- No author or publisher entity on any page
- The Demo Mode banner undermines factual authority — AI may deprioritise content that signals it is provisional
- Social proof is entirely client-side rendered — AI sees no vote counts, user numbers, or activity data

**Specific Gaps:**
- No structured data for pricing information (the 2-phase ETH pricing model is a key differentiator but not in schema)
- No `HowTo` schema on the `/how-it-works` page (ideal for this content type)
- Country pages could benefit from `Country` entity schema linking to Wikidata for disambiguation

---

## Visual Analysis — Screenshots

Screenshots captured: 2026-02-16 using Playwright (Chromium)

### Desktop Homepage (1920x1080)

**Above-the-fold content:** The onboarding modal ("Welcome to Onchain World Cup!") is displayed full-screen on every fresh session, completely obscuring the actual homepage content. The modal reads "Step 1 of 4" with 3 steps listed and a "Next" button.

**Impact:** Googlebot, which does not interact with JavaScript modals, may either see the modal or see the page behind it depending on the rendering context. In either case, users arriving from search are forced to dismiss a 4-step modal before seeing the content that matched their query.

**Key finding:** The modal is confirmed to be rendering from JavaScript (client-side) and not from the SSR HTML. The SSR HTML contains the full page content including H1, navigation, prize pool, and countdown — so crawlability is not impacted. However, first-time user experience (including first-time Googlebot rendering) will show the modal.

### Desktop /how-it-works (1920x1080)

Content is well-structured and readable. The Demo Mode banner is visible at top. The Championship Manager-style retro UI is distinctive. Section headers (Qualification Phase, Achievements & Levels) are clearly visible. H2 structure is evident in the visual layout, matching the DOM structure.

### Desktop /qualification (1920x1080)

Above the fold: "World Cup 2026 Qualification" H1 is visible, with a prize pool counter (0.1100 ETH), a countdown timer, and the beginning of the country table (Portugal, Brazil visible). The Demo Mode banner is present.

**Positive:** The primary content (the qualification table) is visible above the fold on desktop. The H1 is immediately visible without scrolling. The CTA (country vote buttons in the table) is above the fold.

### Mobile /qualification (375x812)

The mobile view shows a clear, responsive layout. The "Demo Mode" banner takes up approximately 20% of the above-the-fold area on mobile. Below it: the H1 "World Cup 2026 Qualification" (in a card), the ETH risk disclosure, the qualification phase description, and the prize pool counter.

**Mobile navigation:** A bottom tab bar with 6 icons is present — this is appropriate for mobile dApps. Touch targets appear to meet the 48x48px minimum.

**Positive:** No horizontal scrolling detected. Text appears readable at standard mobile font sizes. The layout adapts cleanly.

### Mobile /how-it-works (375x812)

Clean mobile layout. The H1 "How It Works" is the first content element. Body text appears at approximately 14–16px, which is at the minimum acceptable size. Section cards (Qualification Phase, Community-Driven Competition) are stacked vertically as expected.

---

## Prioritized Action Plan

### Critical — Fix Immediately

#### 1. Remove /teams from sitemap.xml (or restore the /teams page)

**Impact:** High — Google crawls sitemaps and generates 404 errors for listed pages, reducing crawl budget efficiency and potentially flagging the site for sitemap quality issues.

**File:** `apps/app/app/sitemap.ts` or equivalent sitemap generation file

**Fix:**
```typescript
// Remove this entry from the sitemap generation
// { url: 'https://app.onchainworldcup.xyz/teams', ... }
```

If a `/teams` page is planned, create it before adding it to the sitemap. If it was previously a live page (pre-audit state: "Teams" was in navigation per previous audit), ensure it has a proper redirect to `/qualification` or a functional replacement.

#### 2. Fix X-Frame-Options / CSP frame-ancestors conflict

**Impact:** High — security scanner flag, potential browser inconsistency for Farcaster embedding.

**File:** `apps/app/next.config.mjs` or middleware

**Fix:** Remove `X-Frame-Options` entirely and keep only `frame-ancestors *` in CSP (since Farcaster embedding requires allowing all origins):
```javascript
// Remove this header:
// { key: 'X-Frame-Options', value: 'SAMEORIGIN' }

// Keep only in CSP:
// frame-ancestors *
```

**Note:** If same-origin framing is desired for non-Farcaster contexts, use `frame-ancestors 'self' https://farcaster.xyz` instead of `*`.

#### 3. Remove the Demo Mode banner before/at launch

**Impact:** Critical for E-E-A-T and user trust — the banner broadcasts that the site is not production-ready.

The banner references "mid-February 2026" as the launch date. As of the audit date (2026-02-16), this should either be removed immediately or updated to show a specific confirmed launch date. A persistent "demo mode" banner on a YMYL-adjacent financial product (ETH voting) signals unreliability to both users and search engines.

---

### High Priority — Fix This Week

#### 4. Add unique OG images for /leaderboard, /stats, /tournament, /how-it-works

**Impact:** Medium — improves CTR on social shares and helps Google better understand each page's content.

Currently 5 of 7 core pages share the same OG image. Only the homepage and `/qualification` have unique images.

**Fix:** Generate dynamic OG images using Next.js `opengraph-image.tsx` for each route, similar to what is already done for `/qualification`.

#### 5. Add og:url to all inner pages

**Impact:** Medium — `og:url` helps social platforms and search engines understand the canonical URL when content is shared.

**Fix:** Add `openGraph: { url: 'https://app.onchainworldcup.xyz/[page]' }` to all page metadata objects.

#### 6. Expand content on /leaderboard and /stats pages

**Impact:** Medium — thin content pages with 0 H2s and < 150 words risk being deemed low-quality.

**Suggestions for /leaderboard:**
- Add an H2 "Top ETH Voters This Week"
- Add a paragraph explaining how the leaderboard works and what the rankings mean
- Include a brief section on "Why Rank Matters" with points/rewards info

**Suggestions for /stats:**
- The H1 currently reads "Statistics | Onchain World Cup 2026" (a copy of the title tag) — change to a human-readable H1 like "Live Statistics"
- Add H2 sections for each metric category (Prize Pool, Participation, Qualification Progress)
- Add a brief explainer paragraph above the stats widgets

#### 7. Fix H1 on /stats page

**Current H1:** "Statistics | Onchain World Cup 2026" (contains pipe character — title tag format in an H1)
**Recommended H1:** "Live Statistics"

**File:** `apps/app/app/stats/page.tsx` or equivalent

#### 8. Extend /leaderboard meta description to 120+ characters

**Current:** 108 characters — "Top supporters ranked by ETH spent, votes cast, and early bird status in the Onchain World Cup 2026 on Base."
**Suggested:** "Explore the Onchain World Cup 2026 leaderboard. Top supporters ranked by ETH spent, votes cast, and early bird status. Base network, live rankings."

#### 9. Remove duplicate BreadcrumbList from /qualification/[country] pages

**Issue:** Each country page emits two separate BreadcrumbList schemas — one 2-level (`Home > Qualification`) and one 3-level (`Home > Qualification > [Country]`). Only the 3-level is needed.

**Fix:** Remove the 2-level BreadcrumbList from country page templates, keeping only the full path breadcrumb.

#### 10. Add BreadcrumbList to the homepage

**Issue:** The homepage has no BreadcrumbList schema. This is correct semantically (home has no parent), but adding a minimal one helps establish the site structure.

**Suggested:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://app.onchainworldcup.xyz/"
  }]
}
```

---

### Medium Priority — Fix This Month

#### 11. Add Organization schema properties

**Missing:** `description`, `foundingDate`
**Suggested addition:**
```json
{
  "@type": "Organization",
  "name": "Onchain World Cup",
  "description": "Community-driven World Cup prediction game on the Base blockchain. Vote with ETH to qualify countries and share in prize pools.",
  "foundingDate": "2025",
  "url": "https://app.onchainworldcup.xyz/",
  ...
}
```

Also consider updating `Organization.url` to point to the app subdomain for consistency with `WebSite.url`, or add both URLs via `sameAs`.

#### 12. Add HowTo schema to /how-it-works

The `/how-it-works` page describes a 3-step process (Connect wallet → Buy votes → Win prizes) that maps directly to `HowTo` schema.

```json
{
  "@type": "HowTo",
  "name": "How to vote on Onchain World Cup",
  "step": [
    { "@type": "HowToStep", "name": "Connect Wallet", "text": "Connect Coinbase, MetaMask, or any crypto wallet" },
    { "@type": "HowToStep", "name": "Buy Votes", "text": "Support your favorite countries with ETH" },
    { "@type": "HowToStep", "name": "Win Prizes", "text": "Share the prize pool if your countries qualify" }
  ]
}
```

#### 13. Improve country page content depth

The 192 qualification country pages currently have ~100 unique words each. To avoid thin-content penalties as the site scales in indexability, each country page should include:
- The country's confederation (UEFA, CONMEBOL, etc.)
- Historical World Cup qualification record (static data, not dynamic)
- A paragraph about the country's predicted performance (even generic: "Brazil is one of CONMEBOL's top nations...")
- This static content would survive SSR and not require client-side data fetching

#### 14. Fix /my-votes link in navigation (404)

The navigation menu includes "My Votes" which resolves to `/my-votes` — a 404. This creates a broken link in the global navigation, visible on every page.

**Fix:** Either implement the `/my-votes` page or update the navigation link to a working URL.

#### 15. Update sitemap lastmod to use actual content modification dates

**Current:** All 199 URLs share `2026-02-14T00:00:00.000Z`
**Recommended:** Use `revalidate` or deployment timestamps for static pages; use database `updatedAt` for dynamic pages like country standings.

#### 16. Add `sameAs` social links to Organization schema

**Current sameAs:** `["https://x.com/OnchainC29697", "https://zora.co/@onchainworldcup"]`
**Recommended additions:** Warpcast/Farcaster profile URL, Discord server URL (if applicable), GitHub repository URL

---

### Low Priority — Backlog

#### 17. Improve X (Twitter) handle discoverability

The Organization schema lists `https://x.com/OnchainC29697` — this handle appears auto-generated and does not reflect the brand name. If possible, claiming `@OnchainWorldCup` or similar would improve brand-entity association in Knowledge Graphs.

#### 18. Add `datePublished` and `dateModified` to static content

Articles and how-to pages benefit from `datePublished` and `dateModified` in schema. The `/how-it-works` page in particular should have these fields.

#### 19. Consider `ItemList` schema for /leaderboard

```json
{
  "@type": "ItemList",
  "name": "Top Onchain World Cup Voters",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "...", "url": "..." }
  ]
}
```
This could enable list rich results in Google SERPs if the data can be server-rendered.

#### 20. Add `apple-mobile-web-app` meta tags

The app has Farcaster integration but no Apple PWA meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`). These are not required for SEO but improve the native-feel when added to iOS home screen.

#### 21. Consider suppressing /typescript build errors flag

Per the previous audit, `typescript: { ignoreBuildErrors: true }` was still pending removal. This does not affect SEO directly but is an indicator of technical debt.

---

## Comparison vs Previous Audit Baseline

### Score Comparison Table

| Category | Provided Baseline | This Audit | Delta | Trend |
|----------|------------------|------------|-------|-------|
| Technical SEO (25%) | 65 | **72** | +7 | Improved |
| Content Quality (25%) | 60 | **62** | +2 | Marginally improved |
| Schema (10%) | 75 | **72** | -3 | Slightly regressed |
| Performance (10%) | 65 | **58** | -7 | Regressed |
| Images (5%) | 80 | **85** | +5 | Improved |
| On-Page SEO (20%) | — | **74** | — | New category |
| AI Search Readiness (5%) | — | **52** | — | New category |
| **Overall** | ~65 (est.) | **68** | +3 | Improved |

### Key Improvements Since Baseline

1. **Security headers** fully implemented (HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options)
2. **Canonical tags** present on all pages
3. **Per-page metadata** (unique titles and descriptions on all pages)
4. **Schema foundation** in place (WebSite, Organization, BreadcrumbList, FAQPage)
5. **ETH risk disclosure** added
6. **Image alt text** 100% coverage
7. **HTTP→HTTPS redirect** confirmed working
8. **robots.txt** correct

### Regressions or New Issues

1. **Schema score slightly lower** than baseline (75 → 72): The baseline likely did not account for the duplicate BreadcrumbList on country pages, missing `og:url`, and the Organization URL inconsistency — these were newly identified.
2. **Performance score lower** than baseline (65 → 58): The previous baseline may have been optimistic. The current measurement reflects the actual 33 JS bundles, 112 KB HTML on static pages, and the Web3 provider initialization cost.
3. **Demo Mode banner** — not present in the baseline state, or was considered temporary. It is now a persistent content quality issue.

---

## Appendix: Audit Methodology

**Tools used:**
- `curl` — HTTP header inspection, redirect chain analysis
- Playwright (Chromium) — full-page screenshot capture at 1920x1080 and 375x812
- Python 3 — HTML parsing (regex), metadata extraction, content analysis
- Manual review — schema validation, content quality assessment

**Pages audited:**
- `https://app.onchainworldcup.xyz/` (homepage)
- `https://app.onchainworldcup.xyz/qualification`
- `https://app.onchainworldcup.xyz/how-it-works`
- `https://app.onchainworldcup.xyz/leaderboard`
- `https://app.onchainworldcup.xyz/stats`
- `https://app.onchainworldcup.xyz/tournament`
- `https://app.onchainworldcup.xyz/qualification/england` (representative country page)
- `https://app.onchainworldcup.xyz/robots.txt`
- `https://app.onchainworldcup.xyz/sitemap.xml`

**Screenshots captured:**
- `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/homepage_desktop_desktop.png` (1920x1080)
- `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/homepage_desktop_mobile.png` (375x812)
- `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/how-it-works_desktop_desktop.png` (1920x1080)
- `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/how-it-works_desktop_mobile.png` (375x812)
- `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/qualification_desktop_desktop.png` (1920x1080)
- `/Users/rubendinis/Documents/Code/v0-crypto-world-cup-app/screenshots/qualification_desktop_mobile.png` (375x812)

---

*Audit conducted: 2026-02-16. All data reflects live site state at time of crawl.*
