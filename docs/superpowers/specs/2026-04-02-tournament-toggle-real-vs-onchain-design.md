# Tournament Page — Real vs Onchain World Cup Toggle

**Date:** 2026-04-02

## Overview

Replace the current "Groups / Schedule" tabs on the tournament page with a top-level toggle between two modes: **Real World Cup** and **Onchain World Cup**. The Real WC view shows group tables + full fixture schedule with clickable matches. The Onchain WC view shows the existing qualification-based groups content unchanged.

## Toggle

`RetroNavTabs` component with two entries:
- `{ label: "Real World Cup", value: "real" }`
- `{ label: "Onchain World Cup", value: "onchain" }`

Default active tab: `"real"` (the tournament is imminent; real WC is the primary draw).

## Real World Cup Tab (`components/real-wc-tab.tsx`)

Replaces and supersedes `components/schedule-tab.tsx` (which is deleted).

### Layout (top to bottom)

1. **Countdown timer** — `CountdownTimerLarge` targeting `2026-06-11T19:00:00Z` (Mexico vs South Africa, first match). Title: `"First Match Kicks Off In"`. Hidden once that date passes (`Date.now() >= target`).

2. **Group tables** — 12 group cards in a responsive grid (same `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` layout as the onchain groups). Each card shows the group name (e.g. "Group A") and its 4 teams as plain text rows (no links, no points — just team name). Teams are derived from the schedule JSON by collecting unique teams per `group` field.

3. **Schedule** — matches grouped by `date` (ISO string), sorted chronologically. Each date gets a header row. Each match row shows: local time | team1 vs team2 | group badge | venue. Match rows are `<Link href="/matches/[matchId]">` when an onchain match exists, plain `<div>` otherwise (no visual difference, just non-clickable).

### Data Fetching

Two parallel fetches on mount:
- `fetch("/data/worldcup-2026.json")` — static fixture data
- `fetch("/api/matches?limit=200")` — all onchain matches for ID lookup

**Match linking:** Build a `Set` or `Map` keyed by `normalize(team1) + "|" + normalize(team2)` → `matchId`. Normalization: lowercase, trim. Try both orderings (team1|team2 and team2|team1) when looking up, since the real WC JSON and onchain DB may not agree on home/away order.

### Error/Loading States

- Loading: `InlineLoader` (existing component)
- Schedule fetch error: inline error message ("Failed to load schedule.")
- Onchain matches fetch failure: silently degrade — all match rows become non-clickable

## Onchain World Cup Tab

Identical to the current "Groups" tab content. No changes:
- Refreshing indicator
- Cache status (last updated, next update countdown)
- Seeding legend (Pot 1–4)
- Groups grid (dynamically calculated from qualification)
- Info footer (snake draft, dynamic updates, TBD teams explanation)

## Files Changed

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `apps/app/app/tournament/page.tsx` | Replace tab state with `"real" \| "onchain"` toggle, import `RealWorldCupTab`, remove `ScheduleTab` import |
| Create | `apps/app/components/real-wc-tab.tsx` | Groups + schedule + match linking for Real WC view |
| Delete | `apps/app/components/schedule-tab.tsx` | Superseded by `real-wc-tab.tsx` |

## What Is NOT in Scope

- No score/result display (real WC hasn't started)
- No filtering or search on the schedule
- No changes to the onchain groups logic
- No external links to FIFA or other sites
- No standings within real WC groups (just team lists, no W/D/L/Pts)
