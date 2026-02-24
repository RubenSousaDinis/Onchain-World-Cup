"use client"

import { useState, useMemo } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "pre-launch" | "qualification" | "group-stage" | "knockout"

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
  { title: string; subtitle: string; dateRange: string; textColor: string; badgeCls: string; borderCls: string }
> = {
  "pre-launch": {
    title: "Pre-Launch",
    subtitle: "Building hype before qualification opens",
    dateRange: "Mar 1 – Mar 31, 2026",
    textColor: "text-sky-400",
    badgeCls: "bg-sky-500/10 border border-sky-500/30 text-sky-400",
    borderCls: "border-l-sky-500/40",
  },
  qualification: {
    title: "Phase 1 — Qualification",
    subtitle: "48 countries qualify from 211 FIFA members",
    dateRange: "Apr 1 – May 31, 2026",
    textColor: "text-[var(--cm-highlight)]",
    badgeCls: "bg-[var(--nav-purple)]/50 border border-[var(--cm-highlight)]/40 text-[var(--cm-highlight)]",
    borderCls: "border-l-[var(--cm-highlight)]/40",
  },
  "group-stage": {
    title: "Phase 2 — Group Stage",
    subtitle: "12 groups of 4 teams, top 2 advance",
    dateRange: "Jun 11 – Jun 26, 2026",
    textColor: "text-emerald-400",
    badgeCls: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
    borderCls: "border-l-emerald-500/40",
  },
  knockout: {
    title: "Phase 3 — Knockout",
    subtitle: "Round of 16 through the Final",
    dateRange: "Jun 27 – Jul 19, 2026",
    textColor: "text-orange-400",
    badgeCls: "bg-orange-500/10 border border-orange-500/30 text-orange-400",
    borderCls: "border-l-orange-500/40",
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
          "Been building @onchainworldcup for the past few months.\n\nQualification opens April 1. Up to 8 weeks. 48 spots.\n\nEarly voters get linear pricing. Late voters pay exponential. It rewards conviction over hype.\n\nSharing more on how we built it this week.",
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
          "10 days.\n\nQualification opens April 1.\nUp to 8 weeks. 48 spots. ETH prize pool.\n\nAdd the app to get notified the moment voting goes live.\n[app link]",
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
          "6 days. Here's the full timeline:\n\n→ April 1: Qualification opens\n→ End of May: Qualification closes — top 48 locked\n→ June 1–10: Claim your ETH\n→ June 11: Group stage begins\n→ July 19: The Final\n\n48 countries. 163 eliminated. All onchain.",
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
  // PHASE 1 — QUALIFICATION  Apr 1 – May 31  (+ claim period Jun 1–10)
  // ────────────────────────────────────────────────────────────────────────────

  const qualOrigin = new Date(2026, 3, 1)

  // Launch Day
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
          "We're live.\n\n@onchainworldcup qualification just opened.\nUp to 8 weeks. 48 spots. Prize pool at 0 ETH right now.\n\nGo back your country.\n[app link]",
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

  // Mid-qualification Apr 8 – May 16 (App daily, Builder Mon/Wed/Fri)
  const midEnd = new Date(2026, 4, 16)
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
          template: `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nUnique voters: [XXX]\nTop country: [Country] 🏳️ with [X,XXX] votes\n\n[Leaderboard link]\n\n---\nCountry callout (rotate by region):\n[Country] supporters: currently at rank #[X]. [X] votes to top 48.\n\nIs your country in the top 48? Check the live leaderboard.\n[link]`,
        },
        ...(builderDay
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template: `[Personal reflection / voter behavior insight / community observation — Day ${n}].\n\n@onchainworldcup`,
              },
            ]
          : []),
      ],
    })
  }

  // Final Push May 17–31 (2× App + 1× Builder daily)
  days.push({
    dateStr: ds(2026, 5, 17),
    phase: "qualification",
    label: "⚠️ Final Push — 14 days left",
    posts: [
      {
        account: "app",
        channel: "both",
        template: `📊 Qualification Update — Day ${daysBetween(qualOrigin, new Date(2026, 4, 17)) + 1}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nUnique voters: [XXX]\nTop country: [Country] 🏳️\n\n[Leaderboard link]`,
      },
      {
        account: "app",
        channel: "both",
        template:
          "⚠️ 14 DAYS LEFT.\n\nCountries on the bubble:\n#46 [Country] — [X] votes\n#47 [Country] — [X] votes\n#48 [Country] — [X] votes (IN)\n#49 [Country] — [X] votes (OUT)\n\n[X] votes between qualification and elimination.\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "14 days left. @onchainworldcup qualification closes May 31.\n\n[Personal take on the standings / what's at stake in the final weeks].",
      },
    ],
  })
  for (let i = 18; i <= 30; i++) {
    const daysLeft = 31 - i
    const n = daysBetween(qualOrigin, new Date(2026, 4, i)) + 1
    let label: string | undefined
    if (i === 24) label = "7 Days Left"
    if (i === 29) label = "2 Days Left"
    if (i === 30) label = "⏰ 24 Hours Left"
    days.push({
      dateStr: ds(2026, 5, i),
      phase: "qualification",
      label,
      posts:
        i === 30
          ? [
              {
                account: "app" as const,
                channel: "both" as const,
                template:
                  "24 HOURS LEFT.\n\nCountries ranked #46–#52 are separated by [X] votes.\n\nIf your country is on the bubble: now is the time.\n[app link]",
              },
              {
                account: "app" as const,
                channel: "both" as const,
                template:
                  "24 HOURS LEFT. (evening reminder)\n\nAfter tonight, these rankings are locked forever.\n\n[X] countries still fighting for the last spots. Check the live leaderboard.\n[app link]",
                note: "Post again in the evening",
              },
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template:
                  "24 hours until @onchainworldcup qualification closes.\n\n[Personal take on the drama / standings / what's at stake for the final day].",
              },
            ]
          : [
              {
                account: "app" as const,
                channel: "both" as const,
                template: `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nTop country: [Country] 🏳️\n\n[Leaderboard link]`,
              },
              {
                account: "app" as const,
                channel: "both" as const,
                template: `⚠️ ${daysLeft} days left\n\nBubble countries:\n#46 [Country] — [X] votes\n#47 [Country] — [X] votes\n#48 [Country] — [X] votes (IN)\n#49 [Country] — [X] votes (OUT)\n\n[X] votes between qualification and elimination.\n[app link]`,
              },
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template: `${daysLeft} days left. [Urgency post / personal take on standings].\n\n@onchainworldcup [app link]`,
              },
            ],
    })
  }

  // Qualification closes May 31
  days.push({
    dateStr: ds(2026, 5, 31),
    phase: "qualification",
    label: "🔒 Qualification Closes",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "6 HOURS.\n\nAfter this, qualification closes and the top 48 are locked forever.\n\nIf your country is close to the bubble — this is your last window.\n[app link]",
        note: "Post 6 hours before voting deadline",
      },
      {
        account: "app",
        channel: "both",
        template:
          "Qualification is closed.\n\nThe top 48 are locked. No more votes. No more changes.\n\nPrize pool: [X.XX] ETH\nUnique voters: [X,XXX]\nTotal votes: [X,XXX]\n\n[Qualified countries list]\n\nIf you backed a qualified country: claim your share at [link].",
        note: "Post immediately when voting closes",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "It's done. @onchainworldcup qualification is closed.\n\n[X.XX] ETH in the prize pool. 48 countries qualified.\n\n[Personal reflection on the qualification phase].",
      },
    ],
  })

  // Claim period Jun 1–10 (bridge between Phase 1 and Phase 2)
  days.push({
    dateStr: ds(2026, 6, 1),
    phase: "qualification",
    label: "Claim Period Opens",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Qualification is over. Here are your 48 qualified countries.\n\n[List of 48 with flags]\n\nIf your country qualified: claim your ETH at [link].\nFormula: (your qualified votes / total qualified votes) × [prize pool] ETH",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 6, 3),
    phase: "qualification",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Claim is live.\n\n[X] ETH waiting to be claimed by voters who backed qualified countries.\n\nCheck your claimable amount at [claim link].",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 6, 7),
    phase: "qualification",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "[X] ETH claimed so far. [X] wallets have claimed their share.\n\nIf you backed a qualified country and haven't claimed yet — don't leave ETH on the table.\n\nClaim at [link]. Open until [date].",
      },
    ],
  })
  days.push({
    dateStr: ds(2026, 6, 10),
    phase: "qualification",
    label: "Eve of Group Stage",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Group stage starts tomorrow.\n\n48 countries. 12 groups. ETH on every match.\n\nJune 11. Same day as the real World Cup kicks off.\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Qualification is behind us. Tomorrow @onchainworldcup launches the group stage — same day as the real World Cup.\n\n[Personal reflection on the journey from qualification to group stage].",
      },
    ],
  })

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 2 — GROUP STAGE  Jun 11 – Jun 26
  // 48 teams · 12 groups of 4 · top 2 from each group advance
  // ────────────────────────────────────────────────────────────────────────────

  days.push({
    dateStr: ds(2026, 6, 11),
    phase: "group-stage",
    label: "🏟️ Group Stage Opens",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "IT BEGINS.\n\nGroup stage is live. 48 countries. 12 groups. 36 matches.\n\nVote on today's matches with ETH. Prize pools form per match.\nEarly votes get linear pricing.\n\n[Today's matches]\n[app link]",
      },
      {
        account: "app",
        channel: "both",
        template:
          "🗓️ Today's Group Stage Matches:\n\n[Group A] [Country] vs [Country] — [Time] UTC\n[Group B] [Country] vs [Country] — [Time] UTC\n[Group C] [Country] vs [Country] — [Time] UTC\n[Group D] [Country] vs [Country] — [Time] UTC\n\nVote on each match at [app link]",
        note: "Pull from live FIFA match schedule",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Group stage day one. @onchainworldcup is live for the World Cup.\n\n[Personal observation about first matches, voter behavior, prize pool growth].",
      },
    ],
  })

  // Match days Jun 12–26
  for (let i = 12; i <= 26; i++) {
    const matchDay = i - 10
    const isLastDay = i === 26
    const builderDay = i % 3 === 0
    days.push({
      dateStr: ds(2026, 6, i),
      phase: "group-stage",
      label: isLastDay ? "🏁 Final Group Stage Day" : undefined,
      posts: [
        {
          account: "app",
          channel: "both",
          template: isLastDay
            ? "Final group stage matches today.\n\nAfter today, the top 2 from each group advance.\n24 countries through. 24 eliminated.\n\n[Today's matches — decisive group results]\n[app link]"
            : `🗓️ Match Day ${matchDay}\n\n[Group X] [Country] vs [Country] — [Time] UTC\n[Group Y] [Country] vs [Country] — [Time] UTC\n[Group Z] [Country] vs [Country] — [Time] UTC\n\nVote on each match at [app link]`,
          note: isLastDay ? undefined : "Pull today's fixtures from FIFA schedule",
        },
        {
          account: "app",
          channel: "both",
          template: isLastDay
            ? "🏆 Group Stage Complete — 24 qualifiers confirmed:\n\n[Group A: 1st, 2nd]\n[Group B: 1st, 2nd]\n...\n\nKnockout stage begins June 27.\nVote on Round of 16 matches starting tomorrow.\n[app link]"
            : `📊 Yesterday's results + standings\n\nGroup [X] after [Y] matches:\n1. [Country] — [pts]\n2. [Country] — [pts]\n3. [Country] — [pts]\n4. [Country] — [pts]\n\nPrize pool from yesterday's matches: [X.XX] ETH distributed.\n[app link]`,
        },
        ...(builderDay
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template: `Match Day ${matchDay} thoughts. [Personal observation — surprising results, community reactions, ETH prize pools].\n\n@onchainworldcup`,
              },
            ]
          : []),
      ],
    })
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PHASE 3 — KNOCKOUT  Jun 27 – Jul 19
  // Round of 16 → Quarter-finals → Semi-finals → Third place → Final
  // ────────────────────────────────────────────────────────────────────────────

  // Round of 16: Jun 27–28, Jun 30, Jul 1
  const r16 = [
    { date: ds(2026, 6, 27), label: "Round of 16 — Day 1", builder: true },
    { date: ds(2026, 6, 28), label: undefined, builder: false },
    { date: ds(2026, 6, 30), label: undefined, builder: false },
    { date: ds(2026, 7, 1), label: undefined, builder: false },
  ]
  r16.forEach(({ date, label, builder }, idx) => {
    days.push({
      dateStr: date,
      phase: "knockout",
      label,
      posts: [
        {
          account: "app",
          channel: "both",
          template: `🔥 Round of 16 — Day ${idx + 1}\n\nToday's knockout matches:\n[Country A] vs [Country B] — [Time] UTC\n[Country C] vs [Country D] — [Time] UTC\n\nSingle elimination. One loss and you're out.\n\nVote with ETH on each match.\n[app link]`,
          note: "Pull fixtures from FIFA schedule",
        },
        {
          account: "app",
          channel: "both",
          template: `Round of 16 results:\n\n[Country A] [score] [Country B] ✅\n[Country C] [score] [Country D] ✅\n\nPrize pool distributed: [X.XX] ETH to voters who picked correctly.\n\nRemaining fixtures → [link]\n[app link]`,
          note: "Post after matches finish",
        },
        ...(builder
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template:
                  "Knockout stage is here. @onchainworldcup Round of 16.\n\nSingle elimination. One wrong pick and your ETH is gone.\n\n[Personal pick / reaction for today's matches].",
              },
            ]
          : []),
      ],
    })
  })

  // Quarter-finals: Jul 3–4
  ;[
    { d: 3, label: "⚡ Quarter-finals — Day 1" },
    { d: 4, label: "⚡ Quarter-finals — Day 2" },
  ].forEach(({ d: day, label }) => {
    days.push({
      dateStr: ds(2026, 7, day),
      phase: "knockout",
      label,
      posts: [
        {
          account: "app",
          channel: "both",
          template: `⚡ Quarter-final\n\n[Country A] vs [Country B] — [Time] UTC\n[Country C] vs [Country D] — [Time] UTC\n\nThe last 8 standing. Four winners advance to the semi-finals.\n\nVote with ETH at [app link]`,
          note: "Pull fixtures from FIFA schedule",
        },
        {
          account: "app",
          channel: "both",
          template: `Quarter-final results:\n\n[Country A] [score] [Country B] ✅\n[Country C] [score] [Country D] ✅\n\nPrize pool distributed: [X.XX] ETH to correct voters.\n\nSemi-finalists confirmed → [link]\n[app link]`,
          note: "Post after matches finish",
        },
        {
          account: "builder",
          channel: "farcaster",
          template: `Quarter-finals. @onchainworldcup\n\n[Personal reaction to QF results — surprises, elimination of favorites, semi-final predictions].`,
        },
      ],
    })
  })

  // Semi-finals: Jul 8–9
  ;[
    { d: 8, label: "🏆 Semi-final 1" },
    { d: 9, label: "🏆 Semi-final 2" },
  ].forEach(({ d: day, label }) => {
    days.push({
      dateStr: ds(2026, 7, day),
      phase: "knockout",
      label,
      posts: [
        {
          account: "app",
          channel: "both",
          template: `🏆 Semi-final\n\n[Country A] vs [Country B] — [Time] UTC\n\nOne match. Two countries fighting for the Final.\n\nVote with ETH at [app link]`,
          note: "Pull fixture from FIFA schedule",
        },
        {
          account: "app",
          channel: "both",
          template: `Semi-final result:\n\n[Country A] [score] [Country B]\n\n[Winner] advances to the Final on July 19.\n\nPrize pool distributed: [X.XX] ETH to correct voters.\n[app link]`,
          note: "Post after the match",
        },
        {
          account: "builder",
          channel: "farcaster",
          template: `Semi-final done. [Country] is through to the Final.\n\n[Personal reaction / prediction for the Final].\n\n@onchainworldcup`,
        },
      ],
    })
  })

  // Third place playoff: Jul 18
  days.push({
    dateStr: ds(2026, 7, 18),
    phase: "knockout",
    label: "Third Place Playoff",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Third place playoff today.\n\n[Country A] vs [Country B] — [Time] UTC\n\nVote with ETH at [app link]",
        note: "Pull fixture from FIFA schedule",
      },
      {
        account: "app",
        channel: "both",
        template:
          "Tomorrow: The Final.\n\n[Finalist A] vs [Finalist B] — [Time] UTC\n\nThe last match of Onchain World Cup 2026.\n\nVote with ETH at [app link]",
      },
    ],
  })

  // The Final: Jul 19
  days.push({
    dateStr: ds(2026, 7, 19),
    phase: "knockout",
    label: "🏆 THE FINAL — Jul 19",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "THE FINAL.\n\n[Country A] 🏳️ vs 🏳️ [Country B]\nKickoff: [Time] UTC\n\nVote now. This is the last match.\nEarly voters get linear pricing.\n\n[app link]",
      },
      {
        account: "app",
        channel: "both",
        template:
          "FINAL RESULT.\n\n[Country A] [score] [Country B]\n\n🏆 [Winner] are the Onchain World Cup 2026 champions.\n\nPrize pool distributed: [X.XX] ETH to winning voters.\n\nThank you for being part of this. See you in 2030. 🌍\n[app link]",
        note: "Post immediately after the final whistle",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "That's it. @onchainworldcup 2026 is over.\n\n[Country] won. [X.XX] ETH distributed to voters across all phases.\n\n[Personal reflection — from building the qualification contract to the Final].\n\nThank you to everyone who voted, shared, and built with us.",
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
            isToday
              ? "text-[var(--cm-highlight)] font-bold"
              : isPast
              ? "text-muted-foreground/40"
              : "text-muted-foreground"
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

const ALL_PHASES: Array<Phase | "all"> = ["all", "pre-launch", "qualification", "group-stage", "knockout"]

const FILTER_LABELS: Record<string, string> = {
  all: "All phases",
  "pre-launch": "Pre-Launch",
  qualification: "Phase 1 — Qualification",
  "group-stage": "Phase 2 — Group Stage",
  knockout: "Phase 3 — Knockout",
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

  // Insert phase divider rows whenever phase changes
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
