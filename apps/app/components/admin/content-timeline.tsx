"use client"

import { useState, useMemo } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Five sequential phases of the Onchain World Cup:
 *
 * pre-launch    Mar 1–31       Building hype before qualification
 * qualification Apr 1–May 10   48 countries qualify via ETH voting (40 days)
 * group-draw    May 11–May 20  Claim ETH + groups seeded from qual standings
 * world-cup-1   May 21–Jun 10  Our onchain tournament (qualification groups)
 * real-world-cup Jun 11–Jul 19 Mirrors actual FIFA 2026 — same teams & groups
 */
type Phase = "pre-launch" | "qualification" | "group-draw" | "world-cup-1" | "real-world-cup"

interface ScheduledPost {
  account: "app" | "builder"
  channel: "farcaster" | "twitter" | "both"
  template: string
  note?: string
}

interface TimelineDay {
  dateStr: string
  phase: Phase
  label?: string
  posts: ScheduledPost[]
}

// ── Phase config ──────────────────────────────────────────────────────────────

const PHASE_META: Record<
  Phase,
  { title: string; subtitle: string; dateRange: string; textColor: string; borderCls: string }
> = {
  "pre-launch": {
    title: "Pre-Launch",
    subtitle: "Building hype before qualification opens",
    dateRange: "Mar 1 – Mar 31, 2026",
    textColor: "text-sky-400",
    borderCls: "border-l-sky-500/50",
  },
  qualification: {
    title: "Phase 1 — Qualification",
    subtitle: "48 countries qualify from 211 FIFA members via ETH voting",
    dateRange: "Apr 1 – May 10, 2026",
    textColor: "text-[var(--cm-highlight)]",
    borderCls: "border-l-[var(--cm-highlight)]/50",
  },
  "group-draw": {
    title: "Phase 2 — Group Draw",
    subtitle: "Claim ETH rewards · Groups seeded from qualification standings",
    dateRange: "May 11 – May 20, 2026",
    textColor: "text-violet-400",
    borderCls: "border-l-violet-500/50",
  },
  "world-cup-1": {
    title: "Phase 3 — World Cup 1",
    subtitle: "Onchain World Cup with our qualification-derived groups",
    dateRange: "May 21 – Jun 10, 2026",
    textColor: "text-emerald-400",
    borderCls: "border-l-emerald-500/50",
  },
  "real-world-cup": {
    title: "Phase 4 — Real World Cup",
    subtitle: "Mirrors actual FIFA 2026 — same teams, same groups, real results",
    dateRange: "Jun 11 – Jul 19, 2026",
    textColor: "text-red-400",
    borderCls: "border-l-red-500/50",
  },
}

const ACCOUNT_CONFIG: Record<"app" | "builder", { label: string; cls: string }> = {
  app: {
    label: "APP",
    cls: "bg-[var(--nav-purple)]/60 border border-[var(--cm-highlight)]/40 text-[var(--cm-highlight)]",
  },
  builder: {
    label: "BUILDER",
    cls: "bg-blue-500/10 border border-blue-500/30 text-blue-400",
  },
}

const CHANNEL_LABEL: Record<string, string> = {
  farcaster: "Farcaster",
  twitter: "Twitter/X",
  both: "Farcaster + Twitter/X",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0")
}
function ds(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`
}
function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000)
}
function addDays(base: Date, n: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}
function toDs(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function getTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}
function formatDate(s: string) {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

// ── Timeline builder ──────────────────────────────────────────────────────────

function buildTimeline(): TimelineDay[] {
  const days: TimelineDay[] = []

  // ────────────────────────────────────────────────────────────────────────────
  // PRE-LAUNCH  Mar 1 – Mar 31
  // ────────────────────────────────────────────────────────────────────────────

  days.push({
    dateStr: ds(2026, 3, 1),
    phase: "pre-launch",
    label: "Week 1 — First announcement",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Qualification opens April 1.\n\n48 countries will qualify for the Onchain World Cup.\nVotes cost ETH. Prize pool goes to winners.\n\nMark the date. 🏆\n\n[app link]",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 2),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Been building @onchainworldcup for the past few months.\n\nQualification opens April 1. Up to 8 weeks. 48 spots.\n\nEarly voters get linear pricing. Late voters pay exponential. Rewards conviction over hype.\n\nSharing more on how we built it this week.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 4),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "How does the Onchain World Cup work?\n\n1. Vote for any country with ETH\n2. Top 48 countries qualify\n3. Winners share the prize pool proportionally\n\nEarly voters get linear pricing. Later voters pay exponentially more.\n\nSimple. Onchain.\n\n[app link]",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 6),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "The hardest part of building @onchainworldcup wasn't the contract.\n\nIt was deciding: unified prize pool or per-country pools?\n\nWe went unified.\n→ Everyone backs the same pool\n→ Your payout = your qualified votes / total qualified votes × prize pool\n→ Simpler math, more trust\n\nShips April 1.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 7),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "We built the qualification contract on Base.\n\n- Unified prize pool across all 48 qualifying countries\n- Linear pricing: 0.001 ETH base, +0.0005 ETH per vote\n- 10% platform fee, 90% to voters who backed qualified countries\n- Fully verifiable on Basescan\n\nNo middlemen. No custodians. All onchain.",
      },
    ],
  })

  days.push({
    dateStr: ds(2026, 3, 8),
    phase: "pre-launch",
    label: "Week 2 — How it works",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Why does vote price increase?\n\nEarly supporters take more risk — the country might not qualify.\nEarly voters are rewarded with linear pricing.\n\nAs votes accumulate, each additional vote costs more.\nLate voters pay a premium. Early conviction is rewarded.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 9),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Something I keep coming back to with @onchainworldcup:\n\nThe prize pool formula is public. The contract is on Base.\nAnyone can verify they'll get paid before spending a single ETH.\n\nThat's the point of building onchain. Trust isn't asked for — it's earned.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 11),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "How is the prize pool split?\n\nFormula:\n(Your qualified votes / Total qualified votes) × Total prize pool\n\nExample: 30 votes out of 30,000 total\n→ 30/30,000 × [prize pool ETH]\n\nAll onchain. Verifiable. No trust required.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 13),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Spent the week stress testing the qualification contract.\n\nPricing model holds. Events emit cleanly. Supabase indexing works.\n\n18 days to launch. Feeling good.\n\n@onchainworldcup opens April 1.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 14),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template: "24 days until qualification opens.\n\nWhich country are you backing?",
      },
    ],
  })

  days.push({
    dateStr: ds(2026, 3, 15),
    phase: "pre-launch",
    label: "Week 3 — Building stakes",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Only top 48 countries qualify.\n\nThere are 211 FIFA member nations. 163 will be eliminated.\n\nWhich country are you backing? 🏳️",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 16),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Been getting DMs asking which country I'm backing in @onchainworldcup.\n\nNot saying. Yet.\n\nBut I will say the pricing model makes early conviction the best play.\nVote early, pay less per vote, bigger share of the prize pool.\n\nApril 1.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 18),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Some rivalries we expect in qualification:\n\n🇧🇷 Brazil vs 🇦🇷 Argentina — CONMEBOL pride\n🇫🇷 France vs 🇩🇪 Germany — UEFA dominance\n🇯🇵 Japan vs 🇰🇷 South Korea — Asian rivalry\n\nVotes decide who qualifies. ETH decides the prize pool.\n\nStarts April 1.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 20),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "11 days to launch.\n\nWorking on the final UI pass for qualification voting.\nThe leaderboard updates live — you can watch country rankings shift in real time.\n\nThat part is really satisfying to watch.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 21),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Qualification runs up to 8 weeks — but prices start at the floor on day one.\n\nWeek 1: Price is lowest. Lock in early.\nFinal weeks: Price surges. Late voters pay more.\n\nBest strategy: pick your country on day one.",
      },
    ],
  })

  days.push({
    dateStr: ds(2026, 3, 22),
    phase: "pre-launch",
    label: "Week 4 — Final countdown",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "10 days.\n\nQualification opens April 1.\nUp to 8 weeks. 48 spots. ETH prize pool.\n\nFull journey:\n→ Apr 1: Qualification opens\n→ May 31: Top 48 locked\n→ Jun 11: World Cup 1 begins (our onchain tournament)\n→ Jun 27: Real World Cup — same teams, same groups as FIFA 2026\n→ Jul 19: The Final\n\n[app link]",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 23),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "9 days until @onchainworldcup qualification opens.\n\nLaunching something with real ETH at stake is a different feeling.\nThe contract is audited. The math is right. But still — it's real money.\n\nThat pressure is good. Makes you build carefully.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 25),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "6 days. Here's the full timeline:\n\n→ April 1: Qualification opens — 48 countries compete\n→ May 10: Top 48 locked, claim ETH\n→ May 21: World Cup 1 starts (our groups, our tournament)\n→ June 11: Real World Cup — same teams & groups as actual FIFA 2026\n→ July 19: The Final\n\n48 countries. 163 eliminated. All onchain.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 28),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "3 days.\n\nThe qualification smart contract is deployed, verified, and ready on Base.\nPrize pool starts at 0 ETH and grows with every vote.\n\nEvery ETH in the pool is yours to share — if your country qualifies.",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "3 days to @onchainworldcup qualification.\n\nJust pushed the final piece: real-time leaderboard updates.\nYou can watch country rankings change live as votes come in.\n\nIt's done. Shipping April 1.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 3, 31),
    phase: "pre-launch",
    label: "Eve of Qualification",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Tomorrow.\n\nQualification opens at 00:00 UTC on April 1.\n\n48 spots. Vote early. Prices start at the floor.\n\nSee you on Base. 🏆\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Shipping @onchainworldcup tomorrow.\n\nMonths of building. Real ETH. Real stakes. 48 countries.\n\nFirst vote goes in at 00:00 UTC. I'll be watching.",
      },
    ],
  })

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 1 — QUALIFICATION  Apr 1 – May 10
  // 48 countries qualify via ETH voting — top 48 by vote count
  // ────────────────────────────────────────────────────────────────────────────

  const qualOrigin = new Date(2026, 3, 1)

  days.push({
    dateStr: ds(2026, 4, 1),
    phase: "qualification",
    label: "🚀 Launch Day",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "QUALIFICATION IS LIVE.\n\nVote for your country with ETH. Top 48 qualify.\nPrize pool starts now and grows with every vote.\n\nFirst votes get linear pricing.\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "We're live.\n\n@onchainworldcup qualification just opened.\n6 weeks. 48 spots. Prize pool at 0 ETH right now.\n\nGo back your country.\n[app link]",
      },
    ],
  })

  // Launch Week Apr 2–7
  for (let i = 2; i <= 7; i++) {
    const n = daysBetween(qualOrigin, new Date(2026, 3, i)) + 1
    const builderDay = i === 3 || i === 5 || i === 7
    days.push({
      dateStr: ds(2026, 4, i),
      phase: "qualification",
      label: i === 2 ? "Launch Week" : undefined,
      posts: [
        {
          account: "app",
          channel: "both",
          template: `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nUnique voters: [XXX]\nTop country: [Country] 🏳️ with [X,XXX] votes\n\n[Leaderboard link]\n\n---\nCountry callout (rotate by region):\n[Country] supporters: currently at rank #[X]. [X] votes to top 48.\n\nIs your country in the top 48? Check the live leaderboard.\n[link]`,
        },
        ...(builderDay
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template: `[Personal observation about voter behavior / early results / community reaction — Day ${n}].\n\n@onchainworldcup [app link]`,
              },
            ]
          : []),
      ],
    })
  }

  // Mid-qualification Apr 8 – Apr 30 (App daily, Builder Mon/Wed/Fri)
  const midEnd = new Date(2026, 3, 30)
  for (let dt = new Date(2026, 3, 8); dt <= midEnd; dt = addDays(dt, 1)) {
    const n = daysBetween(qualOrigin, dt) + 1
    const dow = dt.getDay()
    const builderDay = dow === 1 || dow === 3 || dow === 5
    days.push({
      dateStr: toDs(dt),
      phase: "qualification",
      label: dt.getDate() === 8 && dt.getMonth() === 3 ? "Mid-Qualification" : undefined,
      posts: [
        {
          account: "app",
          channel: "both",
          template: `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nUnique voters: [XXX]\nTop country: [Country] 🏳️ with [X,XXX] votes\n\n[Leaderboard link]\n\n---\nCountry callout:\n[Country] supporters: currently at rank #[X]. [X] votes to top 48.\n[link]`,
        },
        ...(builderDay
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template: `[Personal reflection / voter behavior insight — Day ${n}].\n\n@onchainworldcup`,
              },
            ]
          : []),
      ],
    })
  }

  // Final Push May 1–9
  days.push({
    dateStr: ds(2026, 5, 1),
    phase: "qualification",
    label: "⚠️ Final Push — 9 days left",
    posts: [
      {
        account: "app",
        channel: "both",
        template: `📊 Qualification Update — Day ${daysBetween(qualOrigin, new Date(2026, 4, 1)) + 1}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nTop country: [Country] 🏳️\n\n[Leaderboard link]`,
      },
      {
        account: "app",
        channel: "both",
        template:
          "⚠️ 9 DAYS LEFT.\n\nCountries on the bubble:\n#46 [Country] — [X] votes\n#47 [Country] — [X] votes\n#48 [Country] — [X] votes (IN)\n#49 [Country] — [X] votes (OUT)\n\n[X] votes between qualification and elimination.\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "9 days left. @onchainworldcup qualification closes May 10.\n\n[Personal take on the standings / what's at stake in the final stretch].",
      },
    ],
  })
  for (let i = 2; i <= 9; i++) {
    const daysLeft = 10 - i
    const n = daysBetween(qualOrigin, new Date(2026, 4, i)) + 1
    let label: string | undefined
    if (i === 5) label = "5 Days Left"
    if (i === 8) label = "2 Days Left"
    if (i === 9) label = "⏰ 24 Hours Left"
    days.push({
      dateStr: ds(2026, 5, i),
      phase: "qualification",
      label,
      posts:
        i === 9
          ? [
              { account: "app" as const, channel: "both" as const, template: "24 HOURS LEFT.\n\nCountries ranked #46–#52 are separated by [X] votes.\n\nIf your country is on the bubble: now is the time.\n[app link]" },
              { account: "app" as const, channel: "both" as const, template: "24 HOURS LEFT. (evening reminder)\n\nAfter tonight, these rankings are locked forever.\n\n[X] countries still fighting for the last spots.\n[app link]", note: "Post again in the evening" },
              { account: "builder" as const, channel: "farcaster" as const, template: "24 hours until @onchainworldcup qualification closes.\n\n[Personal take on the drama / standings / what's at stake for the final day]." },
            ]
          : [
              { account: "app" as const, channel: "both" as const, template: `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nTop country: [Country] 🏳️\n\n[Leaderboard link]` },
              { account: "app" as const, channel: "both" as const, template: `⚠️ ${daysLeft} days left\n\nBubble countries:\n#46 [Country] — [X] votes\n#47 [Country] — [X] votes\n#48 [Country] — [X] votes (IN)\n#49 [Country] — [X] votes (OUT)\n[app link]` },
              { account: "builder" as const, channel: "farcaster" as const, template: `${daysLeft} days left. [Urgency post / personal take].\n\n@onchainworldcup [app link]` },
            ],
    })
  }

  // Qualification closes May 10
  days.push({
    dateStr: ds(2026, 5, 10),
    phase: "qualification",
    label: "🔒 Qualification Closes",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "6 HOURS.\n\nAfter this, qualification closes and the top 48 are locked forever.\n[app link]",
        note: "Post 6 hours before voting deadline",
      },
      {
        account: "app",
        channel: "both",
        template:
          "Qualification is closed.\n\nThe top 48 are locked. No more votes.\n\nPrize pool: [X.XX] ETH\nUnique voters: [X,XXX]\nTotal votes: [X,XXX]\n\n[Qualified countries list]\n\nClaim your share at [link].",
        note: "Post immediately when voting closes",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "It's done. @onchainworldcup qualification is closed.\n\n[X.XX] ETH in the prize pool. 48 countries qualified.\n\nNext: group draw on May 16. World Cup 1 starts May 21.\n\n[Personal reflection on the qualification phase].",
      },
    ],
  })

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 2 — GROUP DRAW  May 11 – May 20
  // Claim ETH rewards + groups seeded from qualification standings
  // ────────────────────────────────────────────────────────────────────────────

  days.push({
    dateStr: ds(2026, 5, 11),
    phase: "group-draw",
    label: "Claim Period Opens",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Qualification is over. Here are your 48 qualified countries.\n\n[List of 48 with flags — ranked by vote count]\n\nIf your country qualified: claim your ETH at [link].\nFormula: (your qualified votes / total qualified votes) × [prize pool] ETH\n\nRankings by qualification position will seed the group draw.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 5, 13),
    phase: "group-draw",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Claim is live.\n\n[X] ETH waiting to be claimed by voters who backed qualified countries.\n\nCheck your claimable amount at [claim link].\n\nGroup draw announcement coming May 16.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 5, 16),
    phase: "group-draw",
    label: "🎲 Group Draw",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "The groups are set.\n\nGenerated from qualification standings — higher ranked countries are seeded in different groups.\n\nWorld Cup 1 groups:\n\nGroup A: [Country 1] [Country 25] [Country 37] [Country 49]\nGroup B: [Country 2] [Country 26] [Country 38] [Country 50]\n...\n\nFull draw at [link]\n\nWorld Cup 1 starts May 21.",
        note: "Fill in groups from actual qualification standings",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Groups are drawn for @onchainworldcup World Cup 1.\n\nSeeded from qualification positions — top-ranked countries spread across groups.\n\nThis is the bracket we built with 48 countries the community voted in.\n\n[Personal reaction to the groups / interesting matchups].",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 5, 17),
    phase: "group-draw",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "[X] ETH claimed so far. [X] wallets have claimed their share.\n\nIf you backed a qualified country and haven't claimed yet — don't leave ETH on the table.\n\nClaim at [link]. Open until [date].\n\n4 days until World Cup 1 kicks off.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 5, 19),
    phase: "group-draw",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Group stage matchups for World Cup 1:\n\n[Group A matchup preview]\n[Group B matchup preview]\n...\n\nVoting opens May 21. Prices start at the floor.\n\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "2 days to @onchainworldcup World Cup 1.\n\nThis is the tournament we built from scratch — 48 countries qualified by the community, groups seeded from their votes.\n\nMay 21. First match is live.",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 5, 20),
    phase: "group-draw",
    label: "Eve of World Cup 1",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Tomorrow.\n\nWorld Cup 1 kicks off — 48 countries, 12 groups, ETH on every match.\n\nVoting opens at kickoff. Prices start at the floor for every match.\n\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Shipping @onchainworldcup World Cup 1 tomorrow.\n\nQualification → Group draw → Group stage. All onchain. All ETH.\n\nThe community chose 48 countries. Tomorrow we find out who's best.",
      },
    ],
  })

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 3 — WORLD CUP 1  May 21 – Jun 10
  // Our onchain group stage — 48 teams, 12 groups, qualification-derived seedings
  // ────────────────────────────────────────────────────────────────────────────

  days.push({
    dateStr: ds(2026, 5, 21),
    phase: "world-cup-1",
    label: "🏟️ World Cup 1 Opens",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "WORLD CUP 1 IS LIVE.\n\n48 countries. 12 groups. The tournament the community built.\n\nVote on today's matches with ETH. Prize pools form per match.\nEarly votes get linear pricing.\n\n[Today's matches]\n[app link]",
      },
      {
        account: "app",
        channel: "both",
        template:
          "🗓️ World Cup 1 — Match Day 1:\n\n[Group A] [Country] vs [Country] — [Time] UTC\n[Group B] [Country] vs [Country] — [Time] UTC\n[Group C] [Country] vs [Country] — [Time] UTC\n[Group D] [Country] vs [Country] — [Time] UTC\n\nVote on each match at [app link]",
        note: "Pull from live World Cup 1 match schedule",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "World Cup 1 day one. @onchainworldcup\n\nThis is the tournament we built — 48 countries voted in by the community, groups drawn from their qualification positions.\n\n[Personal observation / excitement about the first matches].",
      },
    ],
  })

  // Match days May 22 – Jun 10
  const wc1Origin = new Date(2026, 4, 21)
  for (let dt = new Date(2026, 4, 22); dt <= new Date(2026, 5, 10); dt = addDays(dt, 1)) {
    const matchDay = daysBetween(wc1Origin, dt) + 1
    const isLastDay = toDs(dt) === ds(2026, 6, 10)
    const builderDay = matchDay % 3 === 0
    days.push({
      dateStr: toDs(dt),
      phase: "world-cup-1",
      label: isLastDay ? "🏁 World Cup 1 — Final Group Day" : undefined,
      posts: [
        {
          account: "app",
          channel: "both",
          template: isLastDay
            ? "Final group stage matches today.\n\nAfter today, top 2 from each group advance to the Real World Cup.\n24 countries through. 24 eliminated from World Cup 1.\n\n[Today's decisive matches]\n[app link]"
            : `🗓️ World Cup 1 — Match Day ${matchDay}\n\n[Group X] [Country] vs [Country] — [Time] UTC\n[Group Y] [Country] vs [Country] — [Time] UTC\n[Group Z] [Country] vs [Country] — [Time] UTC\n\nVote on each match at [app link]`,
          note: isLastDay ? undefined : "Pull today's fixtures from World Cup 1 schedule",
        },
        {
          account: "app",
          channel: "both",
          template: isLastDay
            ? "🏆 World Cup 1 Group Stage Complete.\n\n24 countries advance to the Real World Cup (starting June 11).\n\n[Group stage final standings per group]\n\nPrize pool distributed: [X.XX] ETH to correct voters across all group matches.\n[app link]"
            : `📊 World Cup 1 — Yesterday's results\n\nGroup [X] standings:\n1. [Country] — [pts] pts\n2. [Country] — [pts] pts\n3. [Country] — [pts] pts\n4. [Country] — [pts] pts\n\nPrize pool distributed: [X.XX] ETH.\n[app link]`,
        },
        ...(builderDay
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template: isLastDay
                  ? "World Cup 1 group stage is done. @onchainworldcup\n\n24 countries advance. The Real World Cup starts June 11 — same teams, same groups as actual FIFA 2026.\n\n[Personal reaction / which teams advanced / thoughts on the Real WC]."
                  : `World Cup 1 — Match Day ${matchDay}. @onchainworldcup\n\n[Personal observation — surprising results, community reactions, prize pools].\n\nReal World Cup starts June 11 with the same teams as actual FIFA 2026.`,
              },
            ]
          : []),
      ],
    })
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 4 — REAL WORLD CUP  Jun 11 – Jul 19
  // Mirrors actual FIFA 2026 — exact match schedule from official data
  // Sequential after World Cup 1 ends Jun 10
  // ────────────────────────────────────────────────────────────────────────────

  // Helper to build a daily Real WC entry from real fixture data
  function rwcDay(
    dateStr: string,
    label: string | undefined,
    matchLines: string,
    builderNote?: string,
  ): TimelineDay {
    return {
      dateStr,
      phase: "real-world-cup",
      label,
      posts: [
        {
          account: "app",
          channel: "both",
          template: `🌍 Real World Cup${label ? ` — ${label}` : ""}\n\n${matchLines}\n\nVote on each real FIFA 2026 match at [app link]`,
        },
        {
          account: "app",
          channel: "both",
          template: `Real World Cup results:\n\n${matchLines.replace(/ — \d\d:\d\d UTC/g, "").split("\n").map((l) => `${l} — [score] ✅`).join("\n")}\n\nPrize pool: [X.XX] ETH distributed to correct voters.\n[app link]`,
          note: "Post after matches finish",
        },
        ...(builderNote
          ? [{ account: "builder" as const, channel: "farcaster" as const, template: builderNote }]
          : []),
      ],
    }
  }

  // ── Group Stage Matchday 1 ──────────────────────────────────────────────────

  days.push(
    rwcDay(
      ds(2026, 6, 11),
      "🌍 Real World Cup Opens — Matchday 1",
      "Mexico vs South Africa — 19:00 UTC\n(Estadio Azteca)",
      "THE REAL WORLD CUP IS LIVE.\n\nFIFA 2026 just kicked off. @onchainworldcup mirrors every match — same teams, same results.\n\nMexico 🇲🇽 vs South Africa 🇿🇦 — 19:00 UTC. Vote with ETH.\n\n[Personal pick].",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 13),
      "Matchday 1 — Day 3",
      "USA vs Paraguay — 01:00 UTC (SoFi Stadium)\nQatar vs Switzerland — 19:00 UTC\nBrazil vs Morocco — 22:00 UTC (MetLife Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 14),
      "Matchday 1 — Day 4",
      "Haiti vs Scotland — 01:00 UTC (Gillette Stadium)\nGermany vs Curaçao — 17:00 UTC (NRG Stadium)\nNetherlands vs Japan — 20:00 UTC\nIvory Coast vs Ecuador — 23:00 UTC (Lincoln Financial Field)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 15),
      "Matchday 1 — Day 5",
      "Spain vs Cape Verde Islands — 16:00 UTC (Mercedes-Benz Stadium)\nBelgium vs Egypt — 19:00 UTC (Lumen Field)\nSaudi Arabia vs Uruguay — 22:00 UTC (Hard Rock Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 16),
      "Matchday 1 — Day 6",
      "Iran vs New Zealand — 01:00 UTC (SoFi Stadium)\nFrance vs Senegal — 19:00 UTC (MetLife Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 17),
      "Matchday 1 — Day 7",
      "Argentina vs Algeria — 01:00 UTC (Arrowhead Stadium)\nAustria vs Jordan — 04:00 UTC\nEngland vs Croatia — 20:00 UTC\nGhana vs Panama — 23:00 UTC (BMO Field)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 18),
      "Matchday 1 closes / Matchday 2 opens",
      "Uzbekistan vs Colombia — 02:00 UTC (Estadio Azteca)\nCanada vs Qatar — 22:00 UTC (BC Place)",
    ),
  )

  // ── Group Stage Matchday 2 ──────────────────────────────────────────────────

  days.push(
    rwcDay(
      ds(2026, 6, 19),
      "Matchday 2",
      "Mexico vs South Korea — 01:00 UTC (Estadio Akron)\nUSA vs Australia — 19:00 UTC (Lumen Field)\nScotland vs Morocco — 22:00 UTC (Gillette Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 20),
      "Matchday 2",
      "Brazil vs Haiti — 01:00 UTC (Lincoln Financial Field)\nGermany vs Ivory Coast — 20:00 UTC (BMO Field)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 21),
      "Matchday 2",
      "Ecuador vs Curaçao — 00:00 UTC (Arrowhead Stadium)\nTunisia vs Japan — 04:00 UTC (Estadio BBVA Bancomer)\nSpain vs Saudi Arabia — 16:00 UTC (Mercedes-Benz Stadium)\nBelgium vs Iran — 19:00 UTC (SoFi Stadium)\nUruguay vs Cape Verde Islands — 22:00 UTC (Hard Rock Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 22),
      "Matchday 2",
      "New Zealand vs Egypt — 01:00 UTC (BC Place)\nArgentina vs Austria — 17:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 23),
      "Matchday 2 closes",
      "Norway vs Senegal — 00:00 UTC (MetLife Stadium)\nJordan vs Algeria — 03:00 UTC\nPortugal vs Uzbekistan — 17:00 UTC (NRG Stadium)\nEngland vs Ghana — 20:00 UTC (Gillette Stadium)\nPanama vs Croatia — 23:00 UTC (BMO Field)",
    ),
  )

  // ── Group Stage Matchday 3 ──────────────────────────────────────────────────

  days.push(
    rwcDay(
      ds(2026, 6, 24),
      "Matchday 3",
      "Switzerland vs Canada — 19:00 UTC (BC Place)\nMorocco vs Haiti — 22:00 UTC (Mercedes-Benz Stadium)\nScotland vs Brazil — 22:00 UTC (Hard Rock Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 25),
      "Matchday 3",
      "South Africa vs South Korea — 01:00 UTC (Estadio BBVA Bancomer)\nCuraçao vs Ivory Coast — 20:00 UTC (Lincoln Financial Field)\nEcuador vs Germany — 20:00 UTC (MetLife Stadium)\nTunisia vs Netherlands — 23:00 UTC (Arrowhead Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 26),
      "Matchday 3",
      "Paraguay vs Australia — 02:00 UTC\nNorway vs France — 19:00 UTC (Gillette Stadium)",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 27),
      "Matchday 3 — Final Group Day",
      "Cape Verde Islands vs Saudi Arabia — 00:00 UTC (NRG Stadium)\nUruguay vs Spain — 00:00 UTC (Estadio Akron)\nEgypt vs Iran — 03:00 UTC (Lumen Field)\nNew Zealand vs Belgium — 03:00 UTC (BC Place)\nCroatia vs Ghana — 21:00 UTC (Lincoln Financial Field)\nPanama vs England — 21:00 UTC (MetLife Stadium)\nColombia vs Portugal — 23:30 UTC (Hard Rock Stadium)",
      "Last group stage matches today. Bracket will be set for the Round of 32.\n\n@onchainworldcup — vote on all 7 real FIFA matches. ETH on the line.\n\n[Personal take on who advances].",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 28),
      "Final Group Day / Round of 32 opens",
      "Algeria vs Austria — 02:00 UTC (Arrowhead Stadium)\nJordan vs Argentina — 02:00 UTC\nRound of 32 #1 — 19:00 UTC",
      "Group stage is over. Knockout starts tonight.\n\nRound of 32 #1 kicks off at 19:00 UTC. @onchainworldcup\n\n[Reaction to group standings / teams eliminated].",
    ),
  )

  // ── Round of 32 ────────────────────────────────────────────────────────────

  days.push(
    rwcDay(
      ds(2026, 6, 29),
      "⚔️ Round of 32",
      "Round of 32 #2 — 17:00 UTC\nRound of 32 #3 — 20:30 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 6, 30),
      "⚔️ Round of 32",
      "Round of 32 #4 — 01:00 UTC\nRound of 32 #5 — 17:00 UTC\nRound of 32 #6 — 21:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 1),
      "⚔️ Round of 32",
      "Round of 32 #7 — 01:00 UTC\nRound of 32 #8 — 16:00 UTC\nRound of 32 #9 — 20:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 2),
      "⚔️ Round of 32",
      "Round of 32 #10 — 00:00 UTC\nRound of 32 #11 — 19:00 UTC\nRound of 32 #12 — 23:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 3),
      "⚔️ Round of 32",
      "Round of 32 #13 — 03:00 UTC\nRound of 32 #14 — 18:00 UTC\nRound of 32 #15 — 22:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 4),
      "⚔️ Round of 32 — Final matches / Round of 16 opens",
      "Round of 32 #16 — 01:30 UTC\nRound of 16 #1 — 17:00 UTC\nRound of 16 #2 — 21:00 UTC",
    ),
  )

  // ── Round of 16 ────────────────────────────────────────────────────────────

  days.push(
    rwcDay(
      ds(2026, 7, 5),
      "⚔️ Round of 16",
      "Round of 16 #3 — 20:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 6),
      "⚔️ Round of 16",
      "Round of 16 #4 — 00:00 UTC\nRound of 16 #5 — 19:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 7),
      "⚔️ Round of 16 — Final matches",
      "Round of 16 #6 — 00:00 UTC\nRound of 16 #7 — 16:00 UTC\nRound of 16 #8 — 20:00 UTC",
      "Round of 16 done after today. Quarter-finalists set.\n\n@onchainworldcup — real FIFA 2026 knockouts. Vote with ETH.\n\n[Personal picks for QF].",
    ),
  )

  // ── Quarter-finals ─────────────────────────────────────────────────────────

  days.push(
    rwcDay(
      ds(2026, 7, 9),
      "⚡ Quarter-finals",
      "Quarter-finals #1 — 20:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 10),
      "⚡ Quarter-finals",
      "Quarter-finals #2 — 19:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 11),
      "⚡ Quarter-finals",
      "Quarter-finals #3 — 21:00 UTC",
    ),
  )
  days.push(
    rwcDay(
      ds(2026, 7, 12),
      "⚡ Quarter-finals — Final match",
      "Quarter-finals #4 — 01:00 UTC",
      "QFs are done. Four teams left.\n\n@onchainworldcup semi-finals incoming.\n\n[Personal reaction / picks for the semis].",
    ),
  )

  // ── Semi-finals ────────────────────────────────────────────────────────────

  days.push({
    dateStr: ds(2026, 7, 14),
    phase: "real-world-cup",
    label: "🏆 Semi-final 1",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "🏆 Real World Cup — Semi-final 1\n\nTBD vs TBD — 19:00 UTC\n\nTwo teams. One spot in the Final.\n\nVote with ETH at [app link]",
        note: "Fill in real teams when bracket is confirmed",
      },
      {
        account: "app",
        channel: "both",
        template:
          "Semi-final 1 result:\n\n[Country A] [score] [Country B]\n\n[Winner] is through to the Final on July 19.\n\nPrize pool: [X.XX] ETH distributed.\n[app link]",
        note: "Post after the match",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Semi-final 1 done. [Country] is in the Final.\n\n@onchainworldcup — see you July 19 for the last match.\n\n[Personal take].",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 7, 15),
    phase: "real-world-cup",
    label: "🏆 Semi-final 2",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "🏆 Real World Cup — Semi-final 2\n\nTBD vs TBD — 19:00 UTC\n\nThe second finalist is decided tonight.\n\nVote with ETH at [app link]",
        note: "Fill in real teams when bracket is confirmed",
      },
      {
        account: "app",
        channel: "both",
        template:
          "Semi-final 2 result:\n\n[Country A] [score] [Country B]\n\n[Winner] completes the Final lineup.\n\n[Finalist A] vs [Finalist B] — July 19.\n\nPrize pool: [X.XX] ETH distributed.\n[app link]",
        note: "Post after the match",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Final is set. [Country A] vs [Country B]. July 19.\n\n@onchainworldcup — vote now before kickoff. Last match. ETH on the line.\n\n[Personal prediction for the Final].",
      },
    ],
  })

  // ── Third Place / Final ────────────────────────────────────────────────────

  days.push({
    dateStr: ds(2026, 7, 18),
    phase: "real-world-cup",
    label: "Third Place Playoff",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Real World Cup — Third place playoff\n\nTBD vs TBD — 21:00 UTC\n\nVote with ETH at [app link]",
        note: "Pull teams from FIFA schedule",
      },
      {
        account: "app",
        channel: "both",
        template:
          "Tomorrow: THE REAL WORLD CUP FINAL.\n\n[Finalist A] vs [Finalist B] — 19:00 UTC\n\nThe last match. Vote with ETH.\n[app link]",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 7, 19),
    phase: "real-world-cup",
    label: "🏆 THE FINAL — Jul 19",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "THE REAL WORLD CUP FINAL.\n\n[Country A] vs [Country B] — 19:00 UTC\n\nSame match as actual FIFA 2026. Vote now. Last chance.\nEarly voters get linear pricing.\n\n[app link]",
      },
      {
        account: "app",
        channel: "both",
        template:
          "FINAL RESULT.\n\n[Country A] [score] [Country B]\n\n🏆 [Winner] are the FIFA World Cup 2026 champions.\n\nPrize pool distributed: [X.XX] ETH to winning voters across Onchain World Cup.\n\nThank you for being part of this. See you in 2030. 🌍\n[app link]",
        note: "Post immediately after the final whistle",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "That's it. @onchainworldcup World Cup 2026 is over.\n\n[Country] won. [X.XX] ETH distributed to voters across both World Cup 1 and the Real World Cup.\n\n[Personal reflection — from building the qualification contract to the Final].\n\nThank you to everyone who voted, shared, and built with us.",
      },
    ],
  })

  return days.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PostCard({ post }: { post: ScheduledPost }) {
  const [expanded, setExpanded] = useState(false)
  const acc = ACCOUNT_CONFIG[post.account]
  return (
    <div className="border border-border/20 bg-background/30">
      <div className="flex items-start gap-2 px-3 py-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 mt-0.5 shrink-0 ${acc.cls}`}>{acc.label}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5 shrink-0">{CHANNEL_LABEL[post.channel]}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {expanded ? "Hide" : "Show template"}
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed border-l-2 border-border/30 pl-3">
            {post.template}
          </pre>
          {post.note && <p className="text-[10px] text-yellow-400/80 italic">⚠ {post.note}</p>}
        </div>
      )}
    </div>
  )
}

function PhaseDivider({ phase }: { phase: Phase }) {
  const meta = PHASE_META[phase]
  return (
    <div className={`px-4 py-3 border-l-4 ${meta.borderCls} bg-background/60`}>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className={`text-sm font-bold ${meta.textColor}`}>{meta.title}</span>
        <span className="text-xs text-muted-foreground font-mono">{meta.dateRange}</span>
        <span className="text-[10px] text-muted-foreground">— {meta.subtitle}</span>
      </div>
    </div>
  )
}

function DayRow({ day, isToday, isPast }: { day: TimelineDay; isToday: boolean; isPast: boolean }) {
  const [open, setOpen] = useState(isToday)
  const meta = PHASE_META[day.phase]
  const appCount = day.posts.filter((p) => p.account === "app").length
  const builderCount = day.posts.filter((p) => p.account === "builder").length

  return (
    <div
      className={`border-l-2 ${
        isToday ? "border-l-[var(--cm-highlight)]" : isPast ? "border-l-border/20 opacity-50" : meta.borderCls
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--nav-purple)]/10 transition-colors text-left"
      >
        <span
          className={`text-xs font-mono w-28 shrink-0 ${
            isToday ? "text-[var(--cm-highlight)] font-bold" : isPast ? "text-muted-foreground/40" : "text-muted-foreground"
          }`}
        >
          {isToday ? "TODAY" : formatDate(day.dateStr)}
        </span>
        {day.label && (
          <span className={`text-[10px] font-semibold shrink-0 ${meta.textColor}`}>{day.label}</span>
        )}
        <span className="flex gap-1 ml-auto shrink-0">
          {appCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[var(--nav-purple)]/40 border border-[var(--cm-highlight)]/30 text-[var(--cm-highlight)]">
              {appCount}× App
            </span>
          )}
          {builderCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400">
              {builderCount}× Builder
            </span>
          )}
        </span>
        <span className="text-muted-foreground/40 text-xs shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {day.posts.map((post, i) => (
            <div key={i}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const ALL_PHASES: Array<Phase | "all"> = [
  "all",
  "pre-launch",
  "qualification",
  "group-draw",
  "world-cup-1",
  "real-world-cup",
]

const FILTER_LABELS: Record<string, string> = {
  all: "All phases",
  "pre-launch": "Pre-Launch",
  qualification: "Phase 1 — Qualification",
  "group-draw": "Phase 2 — Group Draw",
  "world-cup-1": "Phase 3 — World Cup 1",
  "real-world-cup": "Phase 4 — Real World Cup",
}

type RowItem =
  | { type: "divider"; phase: Phase }
  | { type: "day"; day: TimelineDay; isToday: boolean; isPast: boolean }

export function ContentTimeline() {
  const [activePhase, setActivePhase] = useState<Phase | "all">("all")
  const [showPast, setShowPast] = useState(false)

  const timeline = useMemo(() => buildTimeline(), [])
  const todayStr = useMemo(() => getTodayStr(), [])

  const filtered = useMemo(
    () =>
      (timeline as TimelineDay[]).filter((day: TimelineDay) => {
        if (activePhase !== "all" && day.phase !== activePhase) return false
        if (!showPast && day.dateStr < todayStr) return false
        return true
      }),
    [timeline, activePhase, todayStr, showPast]
  )

  const totalDays = (timeline as TimelineDay[]).length
  const postsDue = (timeline as TimelineDay[])
    .filter((d: TimelineDay) => d.dateStr >= todayStr)
    .reduce((s: number, d: TimelineDay) => s + d.posts.length, 0)
  const todayDay = (timeline as TimelineDay[]).find((d: TimelineDay) => d.dateStr === todayStr)
  const nextScheduled = (timeline as TimelineDay[]).find((d: TimelineDay) => d.dateStr > todayStr)

  const rows = useMemo<RowItem[]>(() => {
    const result: RowItem[] = []
    let lastPhase: Phase | null = null
    for (const day of filtered as TimelineDay[]) {
      if (day.phase !== lastPhase) {
        result.push({ type: "divider", phase: day.phase })
        lastPhase = day.phase
      }
      result.push({ type: "day", day, isToday: day.dateStr === todayStr, isPast: day.dateStr < todayStr })
    }
    return result
  }, [filtered, todayStr])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            { label: "Scheduled Days", value: totalDays },
            { label: "Posts Remaining", value: postsDue },
            { label: "Today's Posts", value: todayDay?.posts.length ?? 0 },
            { label: "Next Scheduled", value: nextScheduled ? formatDate(nextScheduled.dateStr) : "—" },
          ] as { label: string; value: string | number }[]
        ).map(({ label, value }) => (
          <div key={label} className="border border-border/20 px-3 py-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">{label}</span>
            <span className="text-base font-bold cm-highlight">{value}</span>
          </div>
        ))}
      </div>

      {/* Phase filter */}
      <div className="flex flex-wrap gap-1 items-center">
        {ALL_PHASES.map((phase) => {
          const meta = phase !== "all" ? PHASE_META[phase] : null
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`text-xs px-3 py-1.5 border transition-colors whitespace-nowrap ${
                activePhase === phase
                  ? "border-[var(--cm-highlight)] text-foreground bg-[var(--nav-purple)]/40"
                  : "border-border/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {meta && activePhase !== phase ? (
                <span className={meta.textColor}>{FILTER_LABELS[phase]}</span>
              ) : (
                FILTER_LABELS[phase]
              )}
            </button>
          )
        })}
        <button
          onClick={() => setShowPast(!showPast)}
          className={`ml-auto text-xs px-3 py-1.5 border transition-colors ${
            showPast
              ? "border-border/50 text-muted-foreground bg-border/10"
              : "border-border/30 text-muted-foreground hover:text-foreground"
          }`}
        >
          {showPast ? "Hide past" : "Show past"}
        </button>
      </div>

      {/* Timeline */}
      <div className="border border-border/20 divide-y divide-border/10">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No scheduled posts for this filter.</p>
        ) : (
          (rows as RowItem[]).map((row: RowItem, i: number) =>
            row.type === "divider" ? (
              <PhaseDivider key={`d-${row.phase}-${i}`} phase={row.phase} />
            ) : (
              <DayRow key={row.day.dateStr} day={row.day} isToday={row.isToday} isPast={row.isPast} />
            )
          )
        )}
      </div>

      {rows.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} day{filtered.length !== 1 ? "s" : ""} shown
          {!showPast && " — past hidden"}
        </p>
      )}
    </div>
  )
}
