"use client"

import { useState, useMemo } from "react"

type Phase = "pre-launch" | "launch-week" | "mid-qualification" | "final-push" | "post-qualification"

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

const PHASE_CONFIG: Record<Phase, { label: string; textColor: string; badgeCls: string }> = {
  "pre-launch": {
    label: "Pre-Launch",
    textColor: "text-blue-400",
    badgeCls: "bg-blue-500/10 border border-blue-500/30 text-blue-400",
  },
  "launch-week": {
    label: "Launch Week",
    textColor: "text-green-400",
    badgeCls: "bg-green-500/10 border border-green-500/30 text-green-400",
  },
  "mid-qualification": {
    label: "Mid-Qual",
    textColor: "text-yellow-400",
    badgeCls: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
  },
  "final-push": {
    label: "Final Push",
    textColor: "text-orange-400",
    badgeCls: "bg-orange-500/10 border border-orange-500/30 text-orange-400",
  },
  "post-qualification": {
    label: "Post-Qual",
    textColor: "text-purple-400",
    badgeCls: "bg-purple-500/10 border border-purple-500/30 text-purple-400",
  },
}

const ACCOUNT_CONFIG: Record<"app" | "builder", { label: string; cls: string }> = {
  app: { label: "APP", cls: "bg-[var(--nav-purple)]/60 border border-[var(--cm-highlight)]/40 text-[var(--cm-highlight)]" },
  builder: { label: "BUILDER", cls: "bg-blue-500/10 border border-blue-500/30 text-blue-400" },
}

const CHANNEL_LABEL: Record<string, string> = {
  farcaster: "Farcaster",
  twitter: "Twitter/X",
  both: "Farcaster + Twitter/X",
}

// Helpers
function pad(n: number) {
  return String(n).padStart(2, "0")
}
function dateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`
}
function dayCount(dt: Date, origin: Date) {
  return Math.floor((dt.getTime() - origin.getTime()) / 86_400_000) + 1
}

function buildTimeline(): TimelineDay[] {
  const days: TimelineDay[] = []
  const qualStart = new Date(2026, 3, 1) // April 1

  // ── PRE-LAUNCH: Week 1 (March 1–7) ──────────────────────────────────────
  days.push({
    dateStr: dateStr(2026, 3, 1),
    phase: "pre-launch",
    label: "Pre-launch Week 1",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Qualification opens April 1.\n\n48 countries will qualify for the Onchain World Cup.\nVotes cost ETH. Prize pool goes to winners.\n\nMark the date. 🏆\n\n[app link]",
        note: "Adjust opener date if launch is delayed past April 1",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 2),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Been building @onchainworldcup for the past few months.\n\nQualification opens April 1. Up to 8 weeks. 48 spots.\n\nThe thing I'm most excited about: early voters get linear pricing.\nLate voters pay exponential. It rewards conviction over hype.\n\nSharing more on how we built it this week.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 4),
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
    dateStr: dateStr(2026, 3, 6),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "The hardest part of building @onchainworldcup wasn't the contract.\n\nIt was deciding: unified prize pool or per-country pools?\n\nWe went unified. Here's why:\n→ Everyone backs the same pool\n→ Your payout = your qualified votes / total qualified votes × prize pool\n→ Simpler math, more trust\n\nShips April 1.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 7),
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

  // ── PRE-LAUNCH: Week 2 (March 8–14) ─────────────────────────────────────
  days.push({
    dateStr: dateStr(2026, 3, 8),
    phase: "pre-launch",
    label: "Pre-launch Week 2",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Why does vote price increase?\n\nEarly supporters take more risk. The country might not qualify.\nEarly voters are rewarded with linear pricing.\n\nAs a country gets more votes, each additional vote costs more.\nLate voters pay a premium. Early conviction is rewarded.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 9),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "Something I've been thinking about with @onchainworldcup:\n\nThe prize pool formula is public. The contract is on Base.\nAnyone can verify they'll get paid before spending a single ETH.\n\nThat's the point of building onchain. Trust isn't asked for — it's earned.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 11),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "How is the prize pool split?\n\nFormula:\n(Your qualified votes / Total qualified votes) × Total prize pool\n\nIf you backed 3 qualified countries with 10 votes each (30 total),\nand the total qualified votes across everyone is 30,000,\nyou receive: 30/30,000 × [prize pool]\n\nAll onchain. Verifiable. No trust required.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 13),
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
    dateStr: dateStr(2026, 3, 14),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template: "24 days until qualification opens.\n\nWhich country are you backing?",
      },
    ],
  })

  // ── PRE-LAUNCH: Week 3 (March 15–21) ────────────────────────────────────
  days.push({
    dateStr: dateStr(2026, 3, 15),
    phase: "pre-launch",
    label: "Pre-launch Week 3",
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
    dateStr: dateStr(2026, 3, 16),
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
    dateStr: dateStr(2026, 3, 18),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Some rivalries we expect to see in qualification:\n\n🇧🇷 Brazil vs 🇦🇷 Argentina — CONMEBOL pride\n🇫🇷 France vs 🇩🇪 Germany — UEFA dominance\n🇯🇵 Japan vs 🇰🇷 South Korea — Asian rivalry\n\nVotes decide who qualifies. ETH decides the prize pool.\n\nStarts April 1.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 20),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "11 days to launch.\n\nWorking on the final UI pass for qualification voting.\nThe leaderboard updates live. You can watch your country's rank shift in real time.\n\nThat part is really cool to watch. Build in public means showing the rough edges too.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 21),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Qualification runs up to 8 weeks — but prices start at the floor on day one.\n\nWeek 1: Price is lowest. Lock in early.\nFinal weeks: Price surges. Late voters pay more.\n\nBest strategy: pick your country early.",
      },
    ],
  })

  // ── PRE-LAUNCH: Final Countdown (March 22–31) ────────────────────────────
  days.push({
    dateStr: dateStr(2026, 3, 22),
    phase: "pre-launch",
    label: "Final Countdown",
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
    dateStr: dateStr(2026, 3, 23),
    phase: "pre-launch",
    posts: [
      {
        account: "builder",
        channel: "farcaster",
        template:
          "9 days until @onchainworldcup qualification opens.\n\nHonestly, launching something with real ETH at stake is a different feeling.\nThe contract is audited. The math is right. But still — it's real money.\n\nThat pressure is good. Makes you build carefully.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 25),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "6 days until Onchain World Cup qualification.\n\nHere's the full timeline:\n→ April 1: Voting opens\n→ End of May: Qualification closes\n→ Top 48 countries are locked in\n→ Prize pool distributed to backers of qualified countries\n→ June 11: Main tournament begins\n\n48 countries. 163 eliminated.",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 3, 28),
    phase: "pre-launch",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "3 days.\n\nThe qualification smart contract is deployed, verified, and ready.\nPrize pool starts at 0 ETH and grows with every vote.\n\nEvery ETH in the pool is yours to share — if your country qualifies.",
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
    dateStr: dateStr(2026, 3, 31),
    phase: "pre-launch",
    label: "Eve of Launch",
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

  // ── LAUNCH WEEK ──────────────────────────────────────────────────────────
  days.push({
    dateStr: dateStr(2026, 4, 1),
    phase: "launch-week",
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
          "We're live.\n\n@onchainworldcup qualification just opened.\nUp to 8 weeks. 48 spots. Prize pool starts at 0 ETH right now.\n\nGo back your country.\n[app link]",
      },
    ],
  })
  for (let day = 2; day <= 7; day++) {
    const n = dayCount(new Date(2026, 3, day), qualStart)
    const isBuilderDay = day === 3 || day === 5 || day === 7
    days.push({
      dateStr: dateStr(2026, 4, day),
      phase: "launch-week",
      label: `Day ${n}`,
      posts: [
        {
          account: "app",
          channel: "both",
          template: `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nUnique voters: [XXX]\nTop country: [Country] 🏳️ with [X,XXX] votes\n\n[Leaderboard link]\n\n---\n\nCountry callout (rotate by region):\n🇧🇷 [Country] is leading qualification with [X] votes.\n🇫🇷 [Country] supporters: currently at rank #[X]. [X] votes to top 48.\n\nIs your country in the top 48? Check the live leaderboard.\n[link]`,
        },
        ...(isBuilderDay
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template:
                  "[Personal observation about voter behavior / early results / community reaction].\n\n@onchainworldcup [app link]",
              },
            ]
          : []),
      ],
    })
  }

  // ── MID-QUALIFICATION (April 8 – May 16) ────────────────────────────────
  // App: daily. Builder: Mon / Wed / Fri.
  const midEnd = new Date(2026, 4, 16)
  for (let dt = new Date(2026, 3, 8); dt <= midEnd; dt.setDate(dt.getDate() + 1)) {
    const ds = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
    const n = dayCount(new Date(dt), qualStart)
    const dow = dt.getDay()
    const builderDay = dow === 1 || dow === 3 || dow === 5
    days.push({
      dateStr: ds,
      phase: "mid-qualification",
      posts: [
        {
          account: "app",
          channel: "both",
          template: `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nUnique voters: [XXX]\nTop country: [Country] 🏳️ with [X,XXX] votes\n\n[Leaderboard link]\n\n---\n\nCountry callout (rotate by region):\n[Country] supporters: currently at rank #[X]. [X] votes to top 48.\n\nIs your country in the top 48? Check the live leaderboard.\n[link]`,
        },
        ...(builderDay
          ? [
              {
                account: "builder" as const,
                channel: "farcaster" as const,
                template:
                  "[Personal reflection / voter behavior insight / community observation from Day " +
                  n +
                  "].\n\n@onchainworldcup",
              },
            ]
          : []),
      ],
    })
  }

  // ── FINAL PUSH (May 17–30) ───────────────────────────────────────────────
  // 2 app posts/day + daily builder
  const finalEnd = new Date(2026, 4, 30)
  for (let dt = new Date(2026, 4, 17); dt <= finalEnd; dt.setDate(dt.getDate() + 1)) {
    const ds = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
    const n = dayCount(new Date(dt), qualStart)
    const daysLeft = Math.floor((new Date(2026, 4, 31).getTime() - dt.getTime()) / 86_400_000) + 1

    let label: string | undefined
    if (dt.getDate() === 17) label = "14 Days Left"
    else if (dt.getDate() === 24) label = "7 Days Left"
    else if (dt.getDate() === 29) label = "2 Days Left"
    else if (dt.getDate() === 30) label = "⏰ 24 Hours Left"

    days.push({
      dateStr: ds,
      phase: "final-push",
      label,
      posts: [
        {
          account: "app",
          channel: "both",
          template:
            dt.getDate() === 30
              ? "24 HOURS LEFT.\n\nCountries ranked #46–#52 are separated by [X] votes.\n\nIf your country is on the bubble: now is the time.\n[app link]"
              : `📊 Qualification Update — Day ${n}\n\nPrize pool: [X.XX] ETH\nTotal votes: [X,XXX]\nUnique voters: [XXX]\nTop country: [Country] 🏳️ with [X,XXX] votes\n\n[Leaderboard link]`,
        },
        {
          account: "app",
          channel: "both",
          template:
            dt.getDate() === 30
              ? "24 HOURS LEFT. (evening reminder)\n\nAfter tonight, these rankings are locked forever.\n\n[X] countries still fighting for the last spots.\nCheck the live leaderboard.\n[app link]"
              : `⚠️ DANGER ZONE — ${daysLeft} days left\n\nCountries on the bubble:\n#46 [Country] — [X] votes\n#47 [Country] — [X] votes\n#48 [Country] — [X] votes (IN)\n#49 [Country] — [X] votes (OUT)\n#50 [Country] — [X] votes\n\n[X] votes separate qualification from elimination.\nEvery vote counts.\n[app link]`,
          note: dt.getDate() === 30 ? "Post again in the evening" : undefined,
        },
        {
          account: "builder",
          channel: "farcaster",
          template:
            dt.getDate() === 30
              ? "24 hours until @onchainworldcup qualification closes.\n\n[Personal take on the drama / standings / what's at stake for the final day]."
              : `${daysLeft} days left. [Urgency post / personal take on the standings / what's at stake].\n\n@onchainworldcup [app link]`,
        },
      ],
    })
  }

  // May 31 — Last day
  days.push({
    dateStr: dateStr(2026, 5, 31),
    phase: "final-push",
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

  // ── POST-QUALIFICATION (June 1–10) ───────────────────────────────────────
  days.push({
    dateStr: dateStr(2026, 6, 1),
    phase: "post-qualification",
    label: "Claim Opens",
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
    dateStr: dateStr(2026, 6, 3),
    phase: "post-qualification",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Winners: claim is live.\n\n[X] ETH waiting to be claimed by voters who backed qualified countries.\n\nCheck your claimable amount at [claim link].",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 6, 7),
    phase: "post-qualification",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "[X] ETH claimed so far.\n[X] wallets have claimed their share.\n\nIf you backed a qualified country and haven't claimed yet — don't leave ETH on the table.\n\nClaim at [link]. Open until [date].",
      },
    ],
  })
  days.push({
    dateStr: dateStr(2026, 6, 10),
    phase: "post-qualification",
    label: "Eve of Main Tournament",
    posts: [
      {
        account: "app",
        channel: "both",
        template:
          "Main tournament starts tomorrow.\n\n48 countries. Knockout matches. ETH on the line.\n\nJune 11. Same day as the real World Cup kicks off.\n[app link]",
      },
      {
        account: "builder",
        channel: "farcaster",
        template:
          "The qualification phase is behind us. Tomorrow @onchainworldcup launches the main tournament — same day as the real World Cup.\n\n[Personal reflection on the journey from qualification to main event].",
      },
    ],
  })

  return days.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ds: string) {
  const [y, m, d] = ds.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

function getTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
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
          {post.note && (
            <p className="text-[10px] text-yellow-400/80 italic">⚠ {post.note}</p>
          )}
        </div>
      )}
    </div>
  )
}

function DayRow({ day, isToday, isPast }: { day: TimelineDay; isToday: boolean; isPast: boolean }) {
  const [open, setOpen] = useState(isToday)
  const phase = PHASE_CONFIG[day.phase]
  const appCount = day.posts.filter((p) => p.account === "app").length
  const builderCount = day.posts.filter((p) => p.account === "builder").length

  return (
    <div
      className={`border-l-2 ${
        isToday
          ? "border-l-[var(--cm-highlight)]"
          : isPast
          ? "border-l-border/20 opacity-50"
          : "border-l-border/30"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--nav-purple)]/10 transition-colors text-left"
      >
        {/* Date */}
        <span
          className={`text-xs font-mono w-28 shrink-0 ${
            isToday ? "text-[var(--cm-highlight)] font-bold" : isPast ? "text-muted-foreground/50" : "text-muted-foreground"
          }`}
        >
          {isToday ? "TODAY — " : ""}{formatDate(day.dateStr)}
        </span>

        {/* Special label */}
        {day.label && (
          <span className={`text-[10px] font-semibold shrink-0 ${phase.textColor}`}>{day.label}</span>
        )}

        {/* Post count badges */}
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

        <span className="text-muted-foreground/50 text-xs shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {day.posts.map((post, i) => (
            <PostCard key={i} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const ALL_PHASES: (Phase | "all")[] = [
  "all",
  "pre-launch",
  "launch-week",
  "mid-qualification",
  "final-push",
  "post-qualification",
]
const PHASE_FILTER_LABEL: Record<string, string> = {
  all: "All",
  "pre-launch": "Pre-Launch",
  "launch-week": "Launch Week",
  "mid-qualification": "Mid-Qual",
  "final-push": "Final Push",
  "post-qualification": "Post-Qual",
}

export function ContentTimeline() {
  const [activePhase, setActivePhase] = useState<Phase | "all">("all")
  const [showPast, setShowPast] = useState(false)
  const [expandAll, setExpandAll] = useState(false)

  const timeline = useMemo(() => buildTimeline(), [])
  const todayStr = useMemo(() => getTodayStr(), [])

  const filtered = useMemo(() => {
    return (timeline as TimelineDay[]).filter((day: TimelineDay) => {
      if (activePhase !== "all" && day.phase !== activePhase) return false
      if (!showPast && day.dateStr < todayStr) return false
      return true
    })
  }, [timeline, activePhase, todayStr, showPast])

  // Stats
  const totalDays = (timeline as TimelineDay[]).length
  const postsDue = (timeline as TimelineDay[])
    .filter((d: TimelineDay) => d.dateStr >= todayStr)
    .reduce((s: number, d: TimelineDay) => s + d.posts.length, 0)
  const todayDay = (timeline as TimelineDay[]).find((d: TimelineDay) => d.dateStr === todayStr)
  const nextScheduled = (timeline as TimelineDay[]).find((d: TimelineDay) => d.dateStr > todayStr)

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Scheduled Days", value: totalDays },
          { label: "Posts Remaining", value: postsDue },
          { label: "Today's Posts", value: todayDay?.posts.length ?? 0 },
          { label: "Next Scheduled", value: nextScheduled ? formatDate(nextScheduled.dateStr) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border/20 px-3 py-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">{label}</span>
            <span className="text-lg font-bold cm-highlight">{value}</span>
          </div>
        ))}
      </div>

      {/* Phase filter */}
      <div className="flex flex-wrap gap-1">
        {ALL_PHASES.map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              activePhase === phase
                ? "border-[var(--cm-highlight)] text-foreground bg-[var(--nav-purple)]/40"
                : "border-border/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {PHASE_FILTER_LABEL[phase]}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowPast(!showPast)}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              showPast
                ? "border-border/50 text-muted-foreground bg-border/10"
                : "border-border/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {showPast ? "Hide past" : "Show past"}
          </button>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="text-xs px-3 py-1.5 border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expandAll ? "Collapse all" : "Expand all"}
          </button>
        </div>
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(PHASE_CONFIG) as [Phase, (typeof PHASE_CONFIG)[Phase]][]).map(([phase, cfg]) => (
          <span key={phase} className={`text-[10px] px-2 py-0.5 ${cfg.badgeCls}`}>
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0 border border-border/20 divide-y divide-border/10">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No scheduled posts for this filter.</p>
        ) : (
          (filtered as TimelineDay[]).map((day: TimelineDay) => (
            <DayRow
              key={day.dateStr}
              day={day}
              isToday={day.dateStr === todayStr}
              isPast={day.dateStr < todayStr}
            />
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} day{filtered.length !== 1 ? "s" : ""} shown
          {!showPast && " (past hidden — toggle to show)"}
        </p>
      )}
    </div>
  )
}
