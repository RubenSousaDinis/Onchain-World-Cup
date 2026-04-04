# Marketing Improvements Design

**Date:** 2026-04-04  
**Scope:** Landing page (football fan conversion) + App homepage (crypto-native conversion)  
**Goal:** Improve post-launch conversion — get visitors to actually vote, not just browse  
**Approach:** Copy and UX/layout changes only. No new features.

---

## Context

Mainnet launches April 14, 2026. The landing page targets football fans who may be new to crypto. The app targets crypto-native users on Base/Farcaster. Both surfaces need post-launch conversion improvements — the landing page has structural problems that lose football fans before they reach the financial hook, and the app homepage has stale pre-launch copy and a gap in the conversion flow after April 14.

---

## Landing Page Changes

### 1. Section Reorder

The current order loses football fans: Timeline appears before the user understands the product, Phases is a technical deep-dive in position 5 (before How Voting Works), and jargon sections appear mid-funnel.

**Current order:**
1. Hero
2. Timeline ← too early
3. What Is Onchain World Cup
4. Why This Exists ← abstract philosophy before financial hook
5. Tournament Phases ← technical detail too early
6. How Voting Works + Win ETH
7. Built for Crypto-Native Socials ← jargon
8. Final CTA
9. FAQ

**Proposed order:**
1. Hero
2. What Is Onchain World Cup ← establish product first
3. How Voting Works + Win ETH ← financial hook immediately after product explanation
4. Why This Exists ← emotional resonance after they understand the product
5. Timeline ← now they care about the dates
6. Tournament Phases ← detail for those who want it, not a gate
7. Share With Your Fanbase ← renamed, see below
8. Final CTA ← rewritten, see below
9. FAQ

**Implementation:** Reorder the section imports in `apps/landing/app/page.tsx`.

---

### 2. Hero Copy (Option A)

Keep the headline — it's strong. Update badge, subtext, and secondary CTA.

**Current:**
- Badge: `Qualification Open · Testnet Live Now` (pulsing dot with `animation-iteration-count: 5`)
- Subtext: "Early supporters shape the tournament. Back your country with ETH. Top 48 qualify. Vote now and be first to support your nation."
- Line below subtext: "No odds. No bookmakers. Just community votes."
- Secondary CTA: "View Timeline"

**Proposed:**
- Badge: `Voting Live · Base Mainnet` (pulsing dot with `animation-iteration-count: infinite`)
- Subtext: "192 nations. Top 48 qualify. Back yours with ETH — the earlier you vote, the cheaper it costs. Winners share 90% of the prize pool."
- Line below subtext: "No odds. No bookmakers. Just community votes." ← keep as-is
- Primary CTA: "Vote for Your Country" (was "Vote Now")
- Secondary CTA: "How It Works" linking to `#how-it-works` (was "View Timeline" linking to `#timeline`)

**Files:** `apps/landing/components/hero-section.tsx`

---

### 3. Section Rename: "Built for Crypto-Native Socials" → "Share With Your Fanbase"

The title "Built for Crypto-Native Socials" uses jargon that alienates football fans. The subtitle and body content are fine — only the `<h2>` changes.

**Current:** `Built for Crypto-Native Socials`  
**Proposed:** `Share With Your Fanbase`

**File:** `apps/landing/components/built-for-crypto-section.tsx`

---

### 4. Final CTA Rewrite

Remove "Coordinate Onchain" (jargon) and "Make History" (generic). Lead with financial reward and a specific deadline.

**Current headline:**
```
Support Your Team.
Coordinate Onchain.
Make History Before the World Cup Starts.
```

**Proposed headline:**
```
Back Your Country.
Win ETH.
Crown the Champion Before June 11.
```

**Current button:** "Enter the Onchain World Cup"  
**Proposed button:** "Vote for Your Country"

**File:** `apps/landing/components/final-cta-section.tsx`

---

## App Homepage Changes

All changes are conditional on post-launch state (`isPreLaunch === false`). The pre-launch UI is fine as-is.

### 1. Hero CTA + Subtext

**File:** `apps/app/app/page.tsx`

**Current CTA button:** "View Countries"  
**Proposed:** "Vote for Your Country"

**Current subtext:** "Voting opens April 14 at 10am CT • Vote with ETH on Base • Winners share prize pool"  
**Proposed (post-launch):** "Voting is live on Base • Earlier votes cost less • Top 48 nations qualify"

The subtext should be dynamic: show the pre-launch copy when `Date.now() < LAUNCH_DATE`, and the post-launch copy after. Since `page.tsx` is a server component, pass the launch date as a prop or use a server-side date check. The `LAUNCH_DATE` constant (`2026-04-14T15:00:00Z`) is defined in `homepage-client.tsx` — move it to a shared location (e.g. `lib/constants.ts`) or duplicate it in `page.tsx`.

---

### 2. Top Banner: Launch Countdown → Qualification Urgency

**File:** `apps/app/app/homepage-client.tsx`

The banner currently always shows "Mainnet Launching April 14, 2026" with a countdown to `LAUNCH_DATE`. Post-launch, it should switch to a qualification urgency message.

**Post-launch banner:**
- Icon: `⚡` (Zap)
- Title: `Voting Live · Prices Rise With Every Vote`
- Subtitle: "First vote: 0.001 ETH. Early voters get better prices and a bigger share of winnings."
- Right side: Replace `<CountdownTimer endDate={LAUNCH_DATE} />` with `<CountdownTimer endDate={qualEndDate} />` (qualification end, already fetched from contract)
- Right side label: "Qual. ends in" (or similar)

Condition: `isPreLaunch ? <launch banner> : <urgency banner>`

---

### 3. Post-Launch Conversion Panel

**File:** `apps/app/app/homepage-client.tsx`

The "Get Ready — Actions Before Launch" panel (`isPreLaunch && (...)`) disappears after April 14, leaving a gap. Replace it with a post-launch conversion panel.

**Post-launch panel:**
- Header: "Voting Is Live — Back Your Country Now"
- Subheader: "Prices increase with every vote. Earlier is cheaper."
- 2×2 grid of action cards:
  1. **Vote for a Country** (primary, links to `/qualification`) — "From 0.001 ETH · prices rise"
  2. **Share on X** (links to a pre-composed tweet, not just the profile) — "Rally your country's fans"
  3. **Share on Farcaster** (links to a pre-composed cast, not just the profile) — "Coordinate with your community"
  4. **View Leaderboard** (links to `/leaderboard`) — "See who's leading"

Note: The pre-launch "Share our launch tweet" and "Share the launch cast" cards both link to the profile (`https://x.com/OnchainWorldCup` and `https://farcaster.xyz/onchainworldcup`). Post-launch share cards should link to specific pre-composed share URLs. The tweet/cast content can be something like "I'm voting for [country] on @OnchainWorldCup — back yours before prices rise 🏆".

---

### 4. Bottom InfoBanner: Specific Pricing

**File:** `apps/app/app/homepage-client.tsx`

The post-launch InfoBanner description should include concrete pricing numbers.

**Current (post-launch):** "Vote prices increase as more people vote. Early voters get the best prices and have a better chance of winning if their team succeeds. Don't wait - vote now!"

**Proposed:** "The first vote for any country costs 0.001 ETH. Every subsequent vote adds 0.0005 ETH to that country's price. Vote early — you'll pay less and earn a larger share of winnings if your country qualifies."

---

## Files Changed Summary

| File | Change |
|------|--------|
| `apps/landing/app/page.tsx` | Reorder section imports |
| `apps/landing/components/hero-section.tsx` | Badge text + animation, subtext, primary CTA text, secondary CTA text + href |
| `apps/landing/components/built-for-crypto-section.tsx` | Rename `<h2>` |
| `apps/landing/components/final-cta-section.tsx` | Rewrite headline and button text |
| `apps/app/app/page.tsx` | Hero CTA text + post-launch subtext |
| `apps/app/app/homepage-client.tsx` | Top banner (post-launch state), post-launch conversion panel, InfoBanner copy |
