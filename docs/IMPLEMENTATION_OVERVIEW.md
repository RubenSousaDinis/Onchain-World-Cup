# Onchain World Cup — Implementation Overview & Task Breakdown

## Executive Summary

This document defines the **clear execution path** from current state to qualification launch and beyond. It provides a phased approach to transform the existing demo into a live, viral Onchain World Cup platform.

**Current Status**:
- ✅ Landing page live at https://onchainworldcup.xyz
- ✅ Demo / feedback app live at https://app.onchainworldcup.xyz
- ✅ Qualification smart contract implemented (ETH prize pool, voting, fees)
- ❌ Qualification phase not live yet
- ❌ No waitlist mechanics or Farcaster notification hooks yet
- ❌ "Add App & Get Notified" CTA not deployed to `/app` yet
- ❌ Social accounts started from zero reach

**Goal**: Launch a global onchain competition where users back real countries, votes cost ETH, and only top 48 countries qualify for the World Cup.

---

## Table of Contents

1. [Core Product Vision](#core-product-vision)
2. [Phase 0: Reframe What Exists](#phase-0--reframe-what-exists-no-protocol-changes)
3. [Phase 1: Waitlist Mechanics](#phase-1--waitlist-mechanics-critical)
4. [Phase 2: Shareability & Viral Loops](#phase-2--shareability--viral-loops)
5. [Phase 3: App UX Before Qualification](#phase-3--app-ux-before-qualification)
6. [Phase 4: Read-Only Onchain Transparency](#phase-4--read-only-onchain-transparency)
7. [Phase 5: Qualification Phase Launch](#phase-5--qualification-phase-launch)
8. [Phase 6: Shareable Moments During Qualification](#phase-6--shareable-moments-during-qualification)
9. [Phase 7: Post-Qualification](#phase-7--post-qualification)
10. [Phase 8: Marketing & Distribution](#phase-8--marketing--distribution-non-code)
11. [Key Principles](#key-principles-do-not-break)
12. [Success Metrics](#success-metrics-early)
13. [Technical Requirements](#technical-requirements)
14. [Developer Checklist](#developer-checklist)

---

## Core Product Vision

Onchain World Cup is a **global onchain competition** where:

- **Users back real countries** with ETH votes
- **Votes cost ETH** and form a prize pool
- **ETH forms a prize pool** shared among winners
- **Only top 48 countries qualify** for the main tournament
- **Users who backed qualified countries** share the prize pool proportionally
- **The final happens 1 week before the real World Cup** to build hype

### Key Differentiators

1. **Real stakes**: ETH prize pool, not points
2. **Country pride**: Tap into national identity and global competition
3. **Qualification drama**: Only 48 countries make it
4. **Early supporter advantage**: Linear pricing in Phase 1
5. **Viral by design**: Every action is shareable

---

## PHASE 0 — REFRAME WHAT EXISTS (NO PROTOCOL CHANGES)

### Goal
Turn the existing demo into an intentional **pre-launch + waitlist experience**.

### Current State
- Landing page says "Demo / Feedback"
- No clear timeline for when things go live
- No sense of urgency or exclusivity

### Tasks

#### 1. Update Landing Page Hero Copy
**File**: `apps/landing/app/page.tsx` or equivalent

**Current messaging** (to be replaced):
- "Demo / Feedback" language
- Generic call-to-action

**New messaging**:
```
Hero: "Qualification Phase Opens Soon"
Subtext: "Early supporters shape the tournament. Back your country with ETH."
CTA: "Add App & Get Notified"
```

**Implementation**:
- Replace hero text in landing page component
- Update meta tags to reflect pre-launch messaging
- Ensure OG tags say "Opening Soon" not "Live Now"

#### 2. Add Simple Timeline Section
**File**: Create `apps/landing/components/timeline-section.tsx`

**Content**:
- **Qualification Opens**: Mid-February 2026
- **Qualification Ends**: [Date TBD based on opening]
- **Onchain World Cup Final**: 1 week before real World Cup (Early June 2026)
- **Real World Cup**: June 11, 2026 - July 19, 2026

**Design**:
- Retro CM 01/02 aesthetic
- Horizontal timeline on desktop, vertical on mobile
- Highlight "Qualification Opens Soon" with accent color
- Clear date labels

**Implementation**:
```tsx
// Timeline milestones
const milestones = [
  {
    date: "Mid-February 2026",
    title: "Qualification Opens",
    description: "Vote for countries with ETH. Linear pricing in Phase 1.",
    status: "upcoming",
  },
  {
    date: "TBD",
    title: "Qualification Ends",
    description: "Top 48 countries qualify for the tournament.",
    status: "future",
  },
  {
    date: "Early June 2026",
    title: "Onchain World Cup Final",
    description: "1 week before the real World Cup begins.",
    status: "future",
  },
  {
    date: "June 11 - July 19, 2026",
    title: "Real World Cup",
    description: "FIFA World Cup 2026 in North America.",
    status: "future",
  },
]
```

#### 3. Update Meta Tags and OG Images
**Files**:
- `apps/landing/app/layout.tsx`
- `apps/app/app/layout.tsx`

**Changes**:
- Title: "Onchain World Cup | Qualification Opens Soon"
- Description: "Back your country with ETH. Only top 48 qualify. Prize pool shared among winners."
- OG image: Show "Opening Soon" messaging

### Validation Criteria

- [ ] Landing page no longer says "Demo"
- [ ] Clear timeline visible on landing page
- [ ] Hero messaging creates urgency ("Opens Soon")
- [ ] Users understand this is a pre-launch phase
- [ ] Meta tags updated for sharing

### Implementation Notes

- **No wallet connection required** for viewing timeline
- **No contract interaction** at this stage
- **Text-only changes** - should be quick to deploy
- **Mobile-responsive** timeline

---

## PHASE 1 — WAITLIST MECHANICS (CRITICAL)

### Goal
Turn early visitors into **reachable users** before launch by enabling Farcaster Mini App installation and notifications.

### Why This Matters
- Users who add the Mini App can be notified when qualification opens
- Creates a committed audience before spending marketing budget
- Farcaster users are crypto-native and likely to spend ETH
- App installation shows real intent (not just email collection)

### Tasks

#### 1. Deploy "Add App & Get Notified" Primary CTA

**Location**: `apps/app/` (main app, NOT landing page)

**File**: Create or update `apps/app/components/add-app-cta.tsx`

**Functionality**:
- Detect if running in Farcaster context
- Show different UI based on installation status:
  - Not in Farcaster: Prompt to open in Warpcast
  - In Farcaster, not installed: Show "Add App" button
  - In Farcaster, installed: Show success state

**Implementation**:
```tsx
"use client"

import { useEffect, useState } from "react"
import sdk from "@farcaster/miniapp-sdk"

export function AddAppCTA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isFrameContext, setIsFrameContext] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    // Check if in Farcaster context
    const context = sdk.context
    setIsFrameContext(!!context)

    // Check if app is already added
    // (SDK doesn't expose this directly, use localStorage as proxy)
    const installed = localStorage.getItem('miniapp-installed')
    setIsInstalled(!!installed)
  }, [])

  const handleAddApp = async () => {
    try {
      await sdk.actions.addMiniApp()
      localStorage.setItem('miniapp-installed', 'true')
      setIsInstalled(true)

      // Request notification permission after installation
      await handleEnableNotifications()
    } catch (error) {
      console.error('Failed to add app:', error)
    }
  }

  const handleEnableNotifications = async () => {
    try {
      // Request notification permission
      const result = await sdk.notifications.requestPermission()
      if (result === 'granted') {
        setNotificationsEnabled(true)
        localStorage.setItem('notifications-enabled', 'true')
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
    }
  }

  if (!isFrameContext) {
    return (
      <div className="cm-panel p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Open in Farcaster</h3>
        <p className="text-muted-foreground mb-4">
          Get notified when qualification opens
        </p>
        <a
          href="https://warpcast.com/~/add-mini-app?url=https://app.onchainworldcup.xyz"
          className="cm-nav-tab inline-block px-6 py-3"
        >
          Open in Warpcast
        </a>
      </div>
    )
  }

  if (isInstalled && notificationsEnabled) {
    return (
      <div className="cm-panel p-6 text-center border-2 border-accent">
        <div className="cm-highlight text-lg font-bold mb-2">
          🏆 FOUNDING SUPPORTER
        </div>
        <p className="text-sm text-muted-foreground">
          You'll be notified when qualification opens
        </p>
      </div>
    )
  }

  return (
    <div className="cm-panel p-6 text-center">
      <h3 className="text-xl font-bold mb-2">Add App & Get Notified</h3>
      <p className="text-muted-foreground mb-4">
        Be first to know when qualification opens
      </p>
      {!isInstalled ? (
        <button
          onClick={handleAddApp}
          className="cm-nav-tab px-6 py-3"
        >
          Add to Farcaster
        </button>
      ) : (
        <button
          onClick={handleEnableNotifications}
          className="cm-nav-tab px-6 py-3"
        >
          Enable Notifications
        </button>
      )}
    </div>
  )
}
```

#### 2. Implement Farcaster Mini App Installation

**Package**: `@farcaster/miniapp-sdk`

**Installation**:
```bash
cd apps/app
npm install @farcaster/miniapp-sdk
```

**Configuration**: `apps/app/app/layout.tsx`
```tsx
import sdk from "@farcaster/miniapp-sdk"

// Initialize SDK
useEffect(() => {
  sdk.init()
}, [])
```

**Farcaster Manifest**: Ensure `apps/app/.well-known/farcaster.json` exists
```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "frame": {
    "version": "1",
    "name": "Onchain World Cup",
    "iconUrl": "https://app.onchainworldcup.xyz/logo.png",
    "homeUrl": "https://app.onchainworldcup.xyz",
    "imageUrl": "https://app.onchainworldcup.xyz/og-image.png"
  }
}
```

#### 3. Implement Farcaster Notifications

**Notification Hooks Infrastructure**:

Create `apps/app/lib/notifications/index.ts`:
```typescript
import sdk from "@farcaster/miniapp-sdk"

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await sdk.notifications.requestPermission()
    return result === 'granted'
  } catch (error) {
    console.error('Notification permission error:', error)
    return false
  }
}

export async function scheduleQualificationAlert() {
  // This will be called by backend when qualification opens
  // For now, just store the opt-in status
  return true
}

export function getNotificationStatus(): boolean {
  return localStorage.getItem('notifications-enabled') === 'true'
}
```

**Backend Endpoint** (for future notification sending):

Create `apps/app/app/api/notifications/send/route.ts`:
```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // This endpoint will be called by admin to send notifications
  // when qualification opens

  const { message, userIds } = await request.json()

  // TODO: Integrate with Farcaster notification API
  // For now, just log
  console.log('Sending notification:', message, 'to', userIds?.length, 'users')

  return NextResponse.json({ success: true })
}
```

#### 4. Display Status Badges

**Create**: `apps/app/components/supporter-badge.tsx`

```tsx
export function SupporterBadge({ type }: { type: 'founding' | 'early' }) {
  if (type === 'founding') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-accent-foreground rounded-sm">
        <span className="text-sm font-bold">🏆 FOUNDING SUPPORTER</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-sm">
      <span className="text-sm font-bold">⚡ EARLY QUALIFICATION INSIDER</span>
    </div>
  )
}
```

**Integration**: Show badge in header when user has added app and enabled notifications

### Validation Criteria

- [ ] CTA deployed to `/app` homepage
- [ ] Farcaster SDK integrated and initialized
- [ ] `addMiniApp()` working (must test in production, not localhost)
- [ ] Notification permission flow working
- [ ] Status badges displaying correctly
- [ ] Installation status persists across sessions
- [ ] Works in Warpcast and other Farcaster clients

### Implementation Notes

- **Must deploy to production domain** for `addMiniApp()` to work (not tunnel/localhost)
- **Client-side state acceptable initially** for tracking install status
- **No token / NFT required** for badge display
- **Wallet connection optional** (soft prompt, not required)
- **Track metrics**: Number of app installations, notification opt-ins

### Technical Requirements

- `@farcaster/miniapp-sdk` version: Latest (check compatibility)
- Next.js version: 14+ (App Router)
- Production domain with valid SSL
- Farcaster manifest file properly signed

---

## PHASE 2 — SHAREABILITY & VIRAL LOOPS

### Goal
Make every interaction promotable on Farcaster / X (Twitter).

### Why This Matters
- User-generated content is the most effective marketing
- Sharing creates FOMO and drives signups
- Pre-composed messages reduce friction
- OG images make shares visually compelling

### Tasks

#### 1. Define Static Share Preview (OG Images)

**Locations**:
- Landing page: `apps/landing/app/opengraph-image.tsx`
- App root: `apps/app/app/opengraph-image.tsx`

**Requirements**:
All OG images must include:
- Trophy icon or World Cup imagery
- "Onchain World Cup" branding
- "ETH Prize Pool" mention
- "Qualification Opens Soon" (pre-launch) or current status

**Implementation** (using Next.js OG Image Generation):

Create `apps/landing/app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Onchain World Cup'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: '#0a0f1e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
        <div style={{ color: '#d4ff00', fontWeight: 'bold' }}>
          ONCHAIN WORLD CUP
        </div>
        <div style={{ fontSize: 40, color: '#8b9dc3', marginTop: 20 }}>
          ETH Prize Pool
        </div>
        <div style={{ fontSize: 30, color: '#8b9dc3', marginTop: 20 }}>
          Qualification Opens Soon
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
```

#### 2. Prepare Dynamic Share Moments

**Create**: `apps/app/lib/share-messages.ts`

```typescript
export const shareMessages = {
  appAdded: {
    text: "Just added the Onchain World Cup app! Backing my country with ETH when qualification opens. 🏆\n\nOnly top 48 countries qualify. Prize pool goes to early supporters.\n\nhttps://app.onchainworldcup.xyz",
    image: "/share/app-added.png"
  },

  countdown: (days: number) => ({
    text: `Onchain World Cup qualification opens in ${days} days! 🔥\n\nVote for countries with ETH. Top 48 qualify. Winners share the prize pool.\n\nhttps://app.onchainworldcup.xyz`,
    image: `/share/countdown-${days}.png`
  }),

  qualificationInfo: {
    text: "Onchain World Cup: Vote for countries with ETH. Only top 48 qualify for the tournament. 🌍⚽\n\nWinners share the prize pool. Early voters get linear pricing.\n\nhttps://app.onchainworldcup.xyz",
    image: "/share/qualification-info.png"
  }
}
```

**Create**: `apps/app/components/share-button.tsx`

```tsx
"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"

interface ShareButtonProps {
  messageKey: keyof typeof shareMessages
  variant?: 'default' | 'compact'
}

export function ShareButton({ messageKey, variant = 'default' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const message = shareMessages[messageKey]
  const shareText = typeof message === 'function'
    ? message(7).text // Default to 7 days for countdown
    : message.text

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleShare}
        className="p-2 hover:bg-secondary rounded-sm transition-colors"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="cm-nav-tab flex items-center gap-2 px-4 py-2"
    >
      <Share2 className="w-4 h-4" />
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
```

#### 3. Integration Points

**Add share buttons to**:
- Post-app-installation confirmation screen
- Countdown timer component
- "How it Works" page
- Any page explaining the qualification system

**Example**: Add to `AddAppCTA` success state:
```tsx
{isInstalled && notificationsEnabled && (
  <div className="cm-panel p-6 text-center border-2 border-accent">
    <SupporterBadge type="founding" />
    <p className="text-sm text-muted-foreground mt-2 mb-4">
      You'll be notified when qualification opens
    </p>
    <ShareButton messageKey="appAdded" />
  </div>
)}
```

### Validation Criteria

- [ ] OG images created for landing and app
- [ ] OG images include all required elements
- [ ] Share messages pre-composed for key moments
- [ ] Share button component created and styled
- [ ] Share functionality works (native share API + clipboard fallback)
- [ ] Preview images display correctly on Farcaster/X

### Implementation Notes

- **No forced posting** - just share button with pre-composed text
- **Dynamic images can be stubbed initially** (use static placeholder)
- **Track share events** for metrics
- **Test OG tags** with https://cards-dev.twitter.com/validator

---

## PHASE 3 — APP UX BEFORE QUALIFICATION

### Goal
Make the app emotionally engaging before money is involved.

### Why This Matters
- Users need something to interact with while waiting
- Builds familiarity with the UI before high-stakes voting
- Creates anticipation through countdown
- Allows users to browse and favorite countries

### Tasks

#### 1. Qualification Countdown Timer

**Create**: `apps/app/components/countdown-timer.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"

interface CountdownTimerProps {
  targetDate: Date
  title?: string
}

export function CountdownTimer({ targetDate, title = "Qualification Opens In" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date()

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return null
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div className="cm-panel p-6 text-center">
        <div className="cm-highlight text-2xl font-bold">
          QUALIFICATION IS LIVE!
        </div>
      </div>
    )
  }

  return (
    <div className="cm-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-accent" />
        <h3 className="font-bold uppercase tracking-wide">{title}</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center">
            <div className="cm-highlight text-3xl lg:text-4xl font-bold mb-1">
              {value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs lg:text-sm text-muted-foreground uppercase">
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Placement**:
- App homepage (prominent position)
- Country pages (smaller version)
- Landing page (hero section)

**Configuration**: Create `apps/app/lib/constants.ts`
```typescript
// TODO: Update this date when qualification opening is confirmed
export const QUALIFICATION_OPEN_DATE = new Date('2026-02-15T00:00:00Z')
```

#### 2. Country Discovery Interface

**Create**: `apps/app/app/countries/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { Search, Flag } from "lucide-react"
import { countries } from "@/lib/mock-data/countries-data"

export default function CountriesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Choose Your Country</h1>
        <p className="text-muted-foreground">
          Back your country in the qualification phase. Top 48 qualify for the tournament.
        </p>
      </div>

      {/* Search */}
      <div className="cm-panel p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map((country) => (
          <div key={country.code} className="cm-panel p-4 hover:border-accent transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">{country.flag}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{country.name}</h3>
                <p className="text-sm text-muted-foreground">{country.code}</p>
              </div>
            </div>

            <button
              className="w-full cm-nav-tab py-2 text-sm"
              disabled={true}
            >
              Qualification Opens Soon
            </button>
          </div>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No countries found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}
```

**Create Mock Data**: `apps/app/lib/mock-data/countries-data.ts`

```typescript
export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
  flag: string // Emoji
  region: string
}

// This will be replaced with contract data later
export const countries: Country[] = [
  { code: "AR", name: "Argentina", flag: "🇦🇷", region: "CONMEBOL" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", region: "CONMEBOL" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "UEFA" },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "UEFA" },
  { code: "ES", name: "Spain", flag: "🇪🇸", region: "UEFA" },
  { code: "GB-ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", region: "UEFA" },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "UEFA" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", region: "UEFA" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "UEFA" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", region: "UEFA" },
  // Add more countries...
]
```

#### 3. Update Navigation

**Add Countries link** to `apps/app/components/retro-sidebar.tsx`:

```typescript
const sidebarItems = [
  { icon: Flag, label: "Countries", href: "/countries" },
  { icon: Trophy, label: "Qualification", href: "/qualification" },
  // ... rest
]
```

### Validation Criteria

- [ ] Countdown timer created and displays correctly
- [ ] Countdown updates every second
- [ ] Country discovery page created
- [ ] Search functionality works
- [ ] Countries display with flags and names
- [ ] CTAs disabled (shows "Opens Soon")
- [ ] Mobile-responsive layout

### Implementation Notes

- **Static country list initially** - will be replaced with contract data
- **No wallet connection required** for browsing
- **Countdown target date** should be configurable
- **Country data** can be expanded later (add regions, stats, etc.)

---

## PHASE 4 — READ-ONLY ONCHAIN TRANSPARENCY

### Goal
Build trust before users spend ETH by showing live onchain data.

### Why This Matters
- Transparency builds trust in the prize pool
- Users can verify the system is fair
- Live data creates excitement and engagement
- Demonstrates the "onchain" promise

### Tasks

#### 1. Display Read-Only Contract Data

**Create**: `apps/app/lib/contracts/use-qualification-data.ts`

```typescript
"use client"

import { useContractRead } from "wagmi"
import { QUALIFICATION_CONTRACT_ADDRESS } from "@/lib/constants"
import WorldCupQualificationABI from "@/lib/contracts/WorldCupQualification.json"

export function useQualificationData() {
  const { data: totalPrizePool } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getTotalPrizePool',
  })

  const { data: totalVotes } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getTotalVotes',
  })

  const { data: uniqueVoters } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getUniqueVotersCount',
  })

  return {
    totalPrizePool,
    totalVotes,
    uniqueVoters,
    isLoading: !totalPrizePool && !totalVotes && !uniqueVoters,
  }
}

export function useCountryVotes(countryCode: string) {
  const { data: votes } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getCountryVotes',
    args: [countryCode],
  })

  const { data: rank } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getCountryRank',
    args: [countryCode],
  })

  return {
    votes,
    rank,
    isLoading: !votes && !rank,
  }
}
```

#### 2. Create Prize Pool Display Component

**Create**: `apps/app/components/prize-pool-display.tsx`

```tsx
"use client"

import { useQualificationData } from "@/lib/contracts/use-qualification-data"
import { formatEther } from "viem"
import { Wallet, Users, TrendingUp } from "lucide-react"

export function PrizePoolDisplay() {
  const { totalPrizePool, totalVotes, uniqueVoters, isLoading } = useQualificationData()

  if (isLoading) {
    return (
      <div className="cm-panel p-6 animate-pulse">
        <div className="h-8 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Prize Pool */}
      <div className="cm-panel p-6">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-accent" />
          <div className="text-sm text-muted-foreground uppercase">Prize Pool</div>
        </div>
        <div className="cm-highlight text-3xl font-bold">
          {totalPrizePool ? formatEther(totalPrizePool as bigint) : '0'} ETH
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Live onchain data
        </div>
      </div>

      {/* Total Votes */}
      <div className="cm-panel p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <div className="text-sm text-muted-foreground uppercase">Total Votes</div>
        </div>
        <div className="text-3xl font-bold">
          {totalVotes?.toString() || '0'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Cast by voters
        </div>
      </div>

      {/* Unique Voters */}
      <div className="cm-panel p-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-500" />
          <div className="text-sm text-muted-foreground uppercase">Voters</div>
        </div>
        <div className="text-3xl font-bold">
          {uniqueVoters?.toString() || '0'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Unique addresses
        </div>
      </div>
    </div>
  )
}
```

#### 3. Add "Live Onchain Data" Labels

**Update country cards** to show live vote counts:

```tsx
<div className="cm-panel p-4">
  <div className="flex items-center gap-3 mb-3">
    <div className="text-4xl">{country.flag}</div>
    <div className="flex-1">
      <h3 className="font-bold text-lg">{country.name}</h3>
      <p className="text-sm text-muted-foreground">
        Rank: #{rank || '--'} | Votes: {votes || 0}
      </p>
    </div>
  </div>

  <div className="text-xs text-muted-foreground flex items-center gap-1">
    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
    Live onchain data
  </div>
</div>
```

### Validation Criteria

- [ ] Contract read hooks created
- [ ] Prize pool displays live data
- [ ] Total votes displays from contract
- [ ] Unique voters count shows
- [ ] Country vote counts update from contract
- [ ] "Live onchain data" labels visible
- [ ] Loading states handle gracefully
- [ ] Data refreshes automatically

### Implementation Notes

- **Use contract read methods only** - no transactions yet
- **Cache reads where possible** (wagmi does this automatically)
- **Handle loading states** - show skeleton or spinner
- **Show stale data warning** if refresh fails
- **Format numbers properly** (use thousands separators for large numbers)

---

## PHASE 5 — QUALIFICATION PHASE LAUNCH

### Goal
Activate the core game loop and let users start voting with ETH.

### Why This Matters
- This is the revenue-generating launch
- Real stakes make the experience compelling
- Users can now back their countries with real ETH
- Prize pool starts growing, creating momentum

### Tasks

#### 1. Enable Voting UI

**Create**: `apps/app/components/vote-modal.tsx`

```tsx
"use client"

import { useState } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { parseEther } from "viem"
import { X, AlertTriangle } from "lucide-react"
import WorldCupQualificationABI from "@/lib/contracts/WorldCupQualification.json"
import { QUALIFICATION_CONTRACT_ADDRESS } from "@/lib/constants"

interface VoteModalProps {
  countryCode: string
  countryName: string
  countryFlag: string
  onClose: () => void
}

export function VoteModal({ countryCode, countryName, countryFlag, onClose }: VoteModalProps) {
  const [voteCount, setVoteCount] = useState(1)
  const [ethCost, setEthCost] = useState("0.001") // Calculated from contract

  const { write, data, isLoading } = useContractWrite({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'vote',
  })

  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const handleVote = () => {
    if (!write) return

    write({
      args: [countryCode, voteCount],
      value: parseEther(ethCost),
    })
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="cm-panel p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Vote Successful!</h2>
          <p className="text-muted-foreground mb-6">
            You backed {countryFlag} {countryName} with {voteCount} vote{voteCount > 1 ? 's' : ''}
          </p>
          <button onClick={onClose} className="cm-nav-tab px-6 py-3 w-full">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="cm-panel p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Vote for {countryFlag} {countryName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vote Count Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Number of Votes</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
              className="cm-nav-tab px-4 py-2"
            >
              -
            </button>
            <input
              type="number"
              value={voteCount}
              onChange={(e) => setVoteCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 text-center text-2xl font-bold bg-background border border-border rounded-sm py-2"
            />
            <button
              onClick={() => setVoteCount(voteCount + 1)}
              className="cm-nav-tab px-4 py-2"
            >
              +
            </button>
          </div>
        </div>

        {/* Cost Preview */}
        <div className="cm-panel bg-secondary p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">ETH Cost</span>
            <span className="cm-highlight text-2xl font-bold">{ethCost} ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Platform Fee (5%)</span>
            <span>{(parseFloat(ethCost) * 0.05).toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">To Prize Pool (95%)</span>
            <span className="text-green-500">{(parseFloat(ethCost) * 0.95).toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-sm p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Important</p>
              <p className="text-muted-foreground">
                Your ETH will be locked until qualification ends. Only top 48 countries qualify.
                Winners share the prize pool proportionally.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleVote}
          disabled={isLoading || isTransactionLoading}
          className="cm-nav-tab w-full py-3 font-bold disabled:opacity-50"
        >
          {isLoading || isTransactionLoading ? 'Processing...' : `Vote with ${ethCost} ETH`}
        </button>
      </div>
    </div>
  )
}
```

#### 2. Show Increasing Vote Price

**Calculate price from contract**:

```typescript
export function useVotePrice(countryCode: string, voteCount: number) {
  const { data: price } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'calculateVoteCost',
    args: [countryCode, voteCount],
  })

  return {
    price: price ? formatEther(price as bigint) : '0',
    isLoading: !price,
  }
}
```

#### 3. Display Live Leaderboard

**Update qualification page** to show top 48 countries:

```tsx
export default function QualificationPage() {
  const { data: topCountries } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getTopCountries',
    args: [48], // Top 48
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Qualification Leaderboard</h1>

      <div className="cm-panel p-2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3">Rank</th>
              <th className="text-left p-3">Country</th>
              <th className="text-right p-3">Votes</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {topCountries?.map((country, index) => (
              <tr key={country.code} className="border-b border-border hover:bg-secondary">
                <td className="p-3 font-bold">#{index + 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono">{country.votes}</td>
                <td className="p-3 text-right">
                  {index < 48 ? (
                    <span className="text-green-500 font-bold">QUALIFIED</span>
                  ) : (
                    <span className="text-red-500">ELIMINATED</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### Validation Criteria

- [ ] Voting modal created and functional
- [ ] Vote count selector works
- [ ] ETH cost calculates correctly from contract
- [ ] Platform fee disclosure visible (5% Phase 1, 15% Phase 2)
- [ ] Warning about locked ETH displayed
- [ ] Transaction submits to contract
- [ ] Success confirmation shown
- [ ] Leaderboard updates after vote
- [ ] Top 48 highlighted as "QUALIFIED"

### Implementation Notes

- **Match smart contract logic exactly** for pricing
- **Always show net prize pool** (fees excluded)
- **Strong warning copy** about ETH spending
- **Disable voting** if wallet not connected
- **Handle transaction errors** gracefully
- **Show gas estimation** if possible

---

## PHASE 6 — SHAREABLE MOMENTS DURING QUALIFICATION

### Goal
Turn users into distribution by triggering shares at key moments.

### Why This Matters
- Viral growth during qualification phase
- Each share brings potential new voters
- Shareable moments create FOMO
- User-generated content is authentic marketing

### Tasks

#### 1. Trigger Share Prompts on Key Events

**Create**: `apps/app/lib/share-triggers.ts`

```typescript
export type ShareEvent =
  | 'first-vote'
  | 'country-qualified'
  | 'qualification-ended'
  | 'prize-pool-milestone'

export function getShareMessage(event: ShareEvent, data?: any): string {
  switch (event) {
    case 'first-vote':
      return `Just backed ${data.countryFlag} ${data.countryName} in the Onchain World Cup! ⚽\n\nTop 48 countries qualify. Winners share the ETH prize pool.\n\nhttps://app.onchainworldcup.xyz`

    case 'country-qualified':
      return `🎉 ${data.countryFlag} ${data.countryName} just qualified for the Onchain World Cup!\n\nRank: #${data.rank}\nPrize pool: ${data.prizePool} ETH\n\nhttps://app.onchainworldcup.xyz`

    case 'qualification-ended':
      return `Qualification ended! Top 48 countries locked in for the Onchain World Cup. 🏆\n\nTotal prize pool: ${data.prizePool} ETH\n\nhttps://app.onchainworldcup.xyz`

    case 'prize-pool-milestone':
      return `🔥 Onchain World Cup prize pool just hit ${data.milestone} ETH!\n\nQualification is heating up. Only top 48 countries qualify.\n\nhttps://app.onchainworldcup.xyz`

    default:
      return ''
  }
}
```

**Integrate into VoteModal** (after successful vote):

```tsx
// In VoteModal success state
useEffect(() => {
  if (isSuccess && isFirstVote) {
    // Prompt to share
    const message = getShareMessage('first-vote', {
      countryFlag,
      countryName,
    })

    // Show share prompt
    setTimeout(() => {
      setShowSharePrompt(true)
    }, 2000)
  }
}, [isSuccess])
```

#### 2. Create Share Prompt Component

**Create**: `apps/app/components/share-prompt.tsx`

```tsx
"use client"

import { useState } from "react"
import { Share2, X } from "lucide-react"

interface SharePromptProps {
  message: string
  onClose: () => void
  onShare?: () => void
}

export function SharePrompt({ message, onClose, onShare }: SharePromptProps) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: message })
        setShared(true)
        onShare?.()
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      await navigator.clipboard.writeText(message)
      setShared(true)
      onShare?.()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="cm-panel p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Share Your Vote</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-secondary p-4 rounded-sm mb-6 font-mono text-sm">
          {message}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 cm-nav-tab py-3 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {shared ? 'Shared!' : 'Share'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 hover:bg-secondary rounded-sm"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### 3. Prize Pool Milestone Tracking

**Create**: `apps/app/lib/hooks/use-prize-pool-milestones.ts`

```typescript
"use client"

import { useEffect, useState } from "react"
import { useQualificationData } from "@/lib/contracts/use-qualification-data"
import { formatEther } from "viem"

const MILESTONES = [5, 10, 25, 50, 100, 250, 500, 1000] // ETH

export function usePrizePoolMilestones() {
  const { totalPrizePool } = useQualificationData()
  const [triggeredMilestones, setTriggeredMilestones] = useState<number[]>([])
  const [latestMilestone, setLatestMilestone] = useState<number | null>(null)

  useEffect(() => {
    if (!totalPrizePool) return

    const currentPool = parseFloat(formatEther(totalPrizePool as bigint))

    MILESTONES.forEach(milestone => {
      if (currentPool >= milestone && !triggeredMilestones.includes(milestone)) {
        setTriggeredMilestones(prev => [...prev, milestone])
        setLatestMilestone(milestone)
      }
    })
  }, [totalPrizePool])

  return { latestMilestone, triggeredMilestones }
}
```

### Validation Criteria

- [ ] Share prompts trigger after first vote
- [ ] Share messages pre-composed for all events
- [ ] Share prompt modal created
- [ ] One-click share functionality works
- [ ] Prize pool milestone tracking implemented
- [ ] Milestone shares trigger automatically
- [ ] Users can skip sharing (not forced)
- [ ] Share events tracked for metrics

### Implementation Notes

- **One-click share** - minimize friction
- **Auto-generated copy** - users can edit if needed
- **Dynamic preview image per event** (can stub initially)
- **Track share conversion** - how many users share vs skip
- **Don't spam** - limit share prompts per session

---

## PHASE 7 — POST-QUALIFICATION

### Goal
Reward users and transition to main tournament.

### Why This Matters
- Users need to claim their winnings
- Clear transition builds anticipation for main tournament
- Transparent payout builds trust for future phases
- Success stories create marketing material

### Tasks

#### 1. Claim UI

**Create**: `apps/app/app/claim/page.tsx`

```tsx
"use client"

import { useAccount, useContractWrite, useContractRead } from "wagmi"
import { formatEther } from "viem"
import WorldCupQualificationABI from "@/lib/contracts/WorldCupQualification.json"
import { QUALIFICATION_CONTRACT_ADDRESS } from "@/lib/constants"
import { Wallet, TrendingUp, Trophy } from "lucide-react"

export default function ClaimPage() {
  const { address } = useAccount()

  const { data: claimableAmount } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getClaimableAmount',
    args: [address],
  })

  const { data: userStats } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getUserStats',
    args: [address],
  })

  const { write: claim, isLoading } = useContractWrite({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'claim',
  })

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Connect your wallet to claim winnings</p>
      </div>
    )
  }

  const claimable = claimableAmount ? formatEther(claimableAmount as bigint) : '0'

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Claim Your Winnings</h1>

      {/* Claimable Amount */}
      <div className="cm-panel p-8 mb-6 text-center">
        <div className="text-sm text-muted-foreground uppercase mb-2">
          Your Claimable Amount
        </div>
        <div className="cm-highlight text-6xl font-bold mb-6">
          {claimable} ETH
        </div>

        {parseFloat(claimable) > 0 ? (
          <button
            onClick={() => claim?.()}
            disabled={isLoading}
            className="cm-nav-tab px-8 py-4 text-lg font-bold disabled:opacity-50"
          >
            {isLoading ? 'Claiming...' : 'Claim ETH'}
          </button>
        ) : (
          <p className="text-muted-foreground">
            No winnings to claim. Your countries didn't qualify.
          </p>
        )}
      </div>

      {/* Formula Explanation */}
      <div className="cm-panel p-6 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          How Winnings Are Calculated
        </h2>
        <div className="bg-secondary p-4 rounded-sm font-mono text-sm mb-4">
          (Your Qualified Votes / Total Qualified Votes) × Total Prize Pool
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Your Qualified Votes</div>
            <div className="font-bold text-lg">{userStats?.qualifiedVotes || 0}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Total Qualified Votes</div>
            <div className="font-bold text-lg">{userStats?.totalQualifiedVotes || 0}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Total Prize Pool</div>
            <div className="font-bold text-lg">{userStats?.prizePool || 0} ETH</div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cm-panel p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Votes Cast</div>
          <div className="text-2xl font-bold">{userStats?.totalVotes || 0}</div>
        </div>
        <div className="cm-panel p-4">
          <div className="text-sm text-muted-foreground mb-1">Countries Backed</div>
          <div className="text-2xl font-bold">{userStats?.countriesBacked || 0}</div>
        </div>
        <div className="cm-panel p-4">
          <div className="text-sm text-muted-foreground mb-1">Qualified Countries</div>
          <div className="text-2xl font-bold text-green-500">
            {userStats?.qualifiedCountries || 0}
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 2. Post-Qualification Summary Page

**Create**: `apps/app/app/qualification/results/page.tsx`

```tsx
export default function QualificationResultsPage() {
  const { data: qualifiedCountries } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getQualifiedCountries',
  })

  const { data: stats } = useContractRead({
    address: QUALIFICATION_CONTRACT_ADDRESS,
    abi: WorldCupQualificationABI,
    functionName: 'getQualificationStats',
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Qualification Complete!</h1>
        <p className="text-xl text-muted-foreground mb-6">
          48 countries have qualified for the Onchain World Cup
        </p>

        <div className="cm-panel inline-block p-6">
          <div className="text-sm text-muted-foreground mb-2">Total ETH Distributed</div>
          <div className="cm-highlight text-5xl font-bold">
            {stats?.totalDistributed || 0} ETH
          </div>
        </div>
      </div>

      {/* Qualified Countries Grid */}
      <h2 className="text-2xl font-bold mb-6">Qualified Countries</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {qualifiedCountries?.map((country, index) => (
          <div key={country.code} className="cm-panel p-4 text-center">
            <div className="text-4xl mb-2">{country.flag}</div>
            <div className="font-bold text-sm">{country.name}</div>
            <div className="text-xs text-muted-foreground">#{index + 1}</div>
          </div>
        ))}
      </div>

      {/* Transition Message */}
      <div className="cm-panel p-8 text-center bg-accent/10 border-accent">
        <h3 className="text-2xl font-bold mb-4">What's Next?</h3>
        <p className="text-lg text-muted-foreground mb-6">
          The main Onchain World Cup tournament is coming soon. These 48 countries
          will compete for the ultimate prize.
        </p>
        <p className="text-muted-foreground">
          Winners from qualification can claim their ETH now. Stay tuned for
          tournament announcements!
        </p>
      </div>
    </div>
  )
}
```

### Validation Criteria

- [ ] Claim page created and functional
- [ ] Claimable amount displays from contract
- [ ] Formula explanation shown clearly
- [ ] Claim transaction works
- [ ] User stats displayed
- [ ] Results page shows all 48 qualified countries
- [ ] Total ETH distributed shown
- [ ] Transition message clear

### Implementation Notes

- **Show formula clearly** - transparency builds trust
- **Handle zero claimable amount** gracefully
- **Provide user stats** for context (total votes, countries backed, etc.)
- **Celebrate winners** - make it feel rewarding
- **Clear transition messaging** to main tournament

---

## PHASE 8 — MARKETING & DISTRIBUTION (NON-CODE)

### Goal
Build awareness and drive users to the app through strategic content and community engagement.

### Why This Matters
- Code doesn't market itself
- Early reach compounds over time
- Community building creates lasting value
- Content establishes credibility

### Channels

#### 1. Twitter (X)
- **Handle**: @OnchainWorldCup (or similar)
- **Strategy**: Build in public, share milestones, engage with crypto/soccer communities

#### 2. Farcaster
- **Strategy**: Post updates, share frames, engage in relevant channels
- **Channels**: /worldcup, /base, /onchain

#### 3. Zora
- **Strategy**: Create commemorative NFTs for key moments
- **Examples**: Founding supporter NFTs, qualified country badges

#### 4. Paragraph (Newsletter)
- **Strategy**: Weekly updates during qualification
- **Content**: Top countries, prize pool growth, voter stories

### Content Pillars

#### 1. Build in Public
- Share development progress
- Behind-the-scenes of smart contract deployment
- Feature announcements

**Example posts**:
- "Qualification smart contract deployed to Base. Prize pool mechanism is live and audited."
- "Just hit 100 voters in the first 24 hours. Prize pool: 12.5 ETH and growing."

#### 2. Explain Fairness & Mechanics
- How pricing works (linear → exponential)
- How prize pool is distributed
- Why only 48 countries qualify

**Example posts**:
- "Why 2-phase pricing? Early supporters get linear pricing. Late voters pay exponential. Rewards conviction over speculation."
- "Prize pool math: 95% goes to winners, 5% platform fee. All onchain, fully transparent."

#### 3. Highlight ETH Prize Pool
- Regular updates on pool size
- Milestone celebrations
- Countdown to qualification end

**Example posts**:
- "🔥 Prize pool just hit 50 ETH! Top 48 countries will share this. Who's qualifying?"
- "72 hours left in qualification. Current pool: 87.3 ETH. Top country: Brazil with 4,250 votes."

#### 4. Country Pride Narratives
- Highlight competitive countries
- Share voter stories
- Create rivalries

**Example posts**:
- "🇧🇷 vs 🇦🇷: The South American battle is ON. Brazil leads by 200 votes but Argentina is catching up."
- "🇩🇪 Germany supporters just pushed their country into the top 48. Will they hold the spot?"

#### 5. Countdown Urgency
- Daily countdowns as qualification end approaches
- Last chance messaging
- FOMO triggers

**Example posts**:
- "24 HOURS LEFT. Countries ranked #48-#52 are separated by just 50 votes. Every vote counts."
- "Qualification ends in 6 hours. Is your country in the top 48?"

### Timeline

#### Pre-Launch (2-3 weeks before qualification opens)
- **Frequency**: 2-3 posts/week
- **Focus**: Build anticipation, explain mechanics, share timeline
- **Goal**: Build follower base, establish credibility

#### During Qualification (2-4 weeks)
- **Frequency**: Daily updates
- **Focus**: Prize pool milestones, country rankings, voter stories
- **Goal**: Maintain engagement, drive more votes

#### Post-Qualification (1 week)
- **Frequency**: 3-4 posts/week
- **Focus**: Results celebration, claim announcements, tournament teasers
- **Goal**: Retain community for main tournament

### Content Calendar (Sample Week)

**Monday**: Prize pool update + top 10 countries
**Wednesday**: Voter spotlight / story
**Friday**: Weekend countdown + urgency messaging
**Sunday**: Week recap + next milestone

### Engagement Tactics

1. **Reply to every mention** in first 30 days
2. **Engage with soccer and crypto communities** (reply to relevant threads)
3. **Share user-generated content** (retweet voter shares)
4. **Run mini-competitions** (predict top 3 countries, win ETH)
5. **Partner with crypto influencers** (especially Base ecosystem)

### Metrics to Track

- Follower growth rate
- Post engagement rate
- Click-through to app
- Conversion: visitors → voters
- Share rate (how many voters share)

---

## KEY PRINCIPLES (DO NOT BREAK)

These principles are non-negotiable. Breaking them destroys trust and the core value proposition.

### 1. ETH Prize Pool Must Always Be Net of Fees

**Right**: "Prize Pool: 47.5 ETH (95% of 50 ETH wagered)"
**Wrong**: "Prize Pool: 50 ETH"

**Implementation**:
- Contract returns net prize pool
- UI always displays net amount
- Fee percentages clearly disclosed (5% Phase 1, 15% Phase 2)

### 2. Qualification Has No Matches, Only Votes

**Right**: "Vote for countries. Top 48 qualify."
**Wrong**: "Bet on qualification matches"

**Implementation**:
- No match results in qualification phase
- Only vote counts matter
- Rankings purely based on ETH votes

### 3. Admin Can Add Countries If Missing

**Why**: Can't predict every country users want to support

**Implementation**:
- Admin function to add new countries
- Countries added before qualification opens
- After opening, list is locked

### 4. Users Can Vote Multiple Times

**Why**: Users should be able to increase their stake

**Implementation**:
- No limit on number of votes per user
- No limit on number of countries per user
- Each vote increases their potential winnings

### 5. Simplicity > Clever Math

**Why**: Users need to understand how winnings are calculated

**Implementation**:
- Linear pricing in Phase 1 (easy to predict)
- Clear formula for winnings: `(your votes / total votes) × prize pool`
- No hidden fees or complex distributions

### 6. Trust > Complexity

**Why**: Users are spending real ETH

**Implementation**:
- Full transparency (all data onchain)
- Clear deadlines (can't be changed after voting starts)
- Immutable contracts (no admin backdoors after deployment)

### 7. Shareability Is Part of the Product

**Why**: Viral growth is the growth strategy

**Implementation**:
- Share buttons everywhere
- Pre-composed messages
- Shareable moments trigger automatically
- OG images for all pages

---

## SUCCESS METRICS (EARLY)

### Leading Indicators (Pre-Launch)

- **Farcaster Mini App Adds**: Target 100+ before qualification opens
- **Notification Opt-ins**: Target 80%+ of app installers
- **Social Followers**: Target 500+ on X, 200+ on Farcaster
- **Page Views**: Target 5,000+ on landing page

### Launch Metrics (First Week)

- **Unique Voters**: Target 100+ in first 24 hours
- **ETH in Prize Pool**: Target 10+ ETH in first week
- **Share Events Per User**: Target 30%+ share rate
- **User Retention**: Target 40%+ voters return to vote again

### Long-Term Success (Qualification Phase)

- **Total Unique Voters**: Target 1,000+
- **Total ETH Prize Pool**: Target 100+ ETH
- **Average Votes Per User**: Target 5+
- **Share Rate**: Target 25%+ of voters share
- **Claim Rate**: Target 80%+ of winners claim

### What Good Looks Like

**Successful Launch**:
- 100+ voters in first 24 hours
- 10+ ETH in prize pool within first week
- 30%+ share rate among voters
- Trending on Farcaster in /worldcup or /base channels

**Viral Moment**:
- Prize pool milestone hits (50 ETH, 100 ETH, etc.)
- Country rivalry goes viral (Brazil vs Argentina)
- Big whale vote creates FOMO
- Influencer shares and drives traffic

---

## TECHNICAL REQUIREMENTS

### Infrastructure

#### Production Domains
- **Landing**: https://onchainworldcup.xyz
- **App**: https://app.onchainworldcup.xyz
- **Must have valid SSL** for Farcaster integration

#### Smart Contracts
- **WorldCupQualification**: Deployed on Base Mainnet
- **Contract must be verified** on Basescan
- **Read-only methods** must be accessible without auth

#### API Requirements
- **RPC**: Base RPC (Alchemy/Infura recommended)
- **Rate Limits**: Handle gracefully, implement caching
- **Farcaster SDK**: Latest version of `@farcaster/miniapp-sdk`

### Environment Variables

**Required**:
```bash
# App
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxx
NEXT_PUBLIC_BASE_RPC_URL=xxx
NEXT_PUBLIC_QUALIFICATION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_QUALIFICATION_OPEN_DATE=2026-02-15T00:00:00Z

# Farcaster
NEXT_PUBLIC_FARCASTER_MANIFEST_URL=https://app.onchainworldcup.xyz/.well-known/farcaster.json
```

**Optional**:
```bash
# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=xxx
NEXT_PUBLIC_MIXPANEL_TOKEN=xxx
```

### Browser Support
- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari 14+, Android Chrome 90+
- **Wallet browsers**: MetaMask mobile, Rainbow, Coinbase Wallet

### Performance Targets
- **Page Load**: < 2s (LCP)
- **Time to Interactive**: < 3s (TTI)
- **Contract Read**: < 1s (with caching)
- **Transaction Confirmation**: < 10s (Base network)

---

## DEVELOPER CHECKLIST

### Phase 0: Reframe
- [ ] Landing page copy updated
- [ ] Timeline section added
- [ ] Meta tags updated
- [ ] OG images say "Opens Soon"

### Phase 1: Waitlist
- [ ] Farcaster SDK installed
- [ ] Add App CTA deployed to `/app`
- [ ] `addMiniApp()` working in production
- [ ] Notification permissions implemented
- [ ] Status badges created
- [ ] Installation state persists

### Phase 2: Shareability
- [ ] OG images for landing and app
- [ ] Share messages pre-composed
- [ ] ShareButton component created
- [ ] Native share API + clipboard fallback
- [ ] Share buttons in key locations

### Phase 3: App UX
- [ ] Countdown timer created
- [ ] Countries page created
- [ ] Search functionality works
- [ ] Navigation updated

### Phase 4: Onchain Data
- [ ] Contract read hooks created
- [ ] Prize pool displays live
- [ ] Country vote counts update
- [ ] "Live onchain data" labels

### Phase 5: Launch
- [ ] VoteModal created
- [ ] Price calculation from contract
- [ ] Fee disclosure visible
- [ ] Transaction submission works
- [ ] Leaderboard shows top 48

### Phase 6: Viral Loops
- [ ] Share prompts after first vote
- [ ] Share messages for all events
- [ ] Prize pool milestone tracking
- [ ] SharePrompt modal created

### Phase 7: Post-Qualification
- [ ] Claim page created
- [ ] Formula explanation shown
- [ ] Results page shows qualified countries
- [ ] Transition messaging clear

### Phase 8: Marketing
- [ ] Twitter account created
- [ ] Farcaster account active
- [ ] Content calendar defined
- [ ] First posts scheduled

---

## FINAL NOTE

This project succeeds if:

> **People feel they are participating in a real global event — not just using an app.**

Everything above serves that goal. Every feature, every share prompt, every piece of copy should reinforce the feeling that this is a real, global, high-stakes competition.

The mechanics are simple. The stakes are real. The experience is onchain.

Ship it.

---

**Document Version**: 1.0
**Last Updated**: January 2026
**Status**: Ready for Implementation
