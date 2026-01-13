# Onchain World Cup – Roadmap & Tournament Specification

This document defines the **official roadmap, mechanics, and rules** for the **Onchain World Cup**.

It is the **single source of truth** for:
- AI coding agents
- Smart contract developers
- Frontend contributors
- Auditors and reviewers

All implementations MUST follow the rules defined here unless explicitly updated.

---

## Vision

The **Onchain World Cup** is a **crypto-native social coordination tournament**.

It is **not a prediction market**.

- Users support countries they like
- Support is expressed via ETH-backed votes
- Countries advance based on onchain commvotey support
- Results are independent of real-world football outcomes
- The Onchain World Cup winner may differ from the real FIFA World Cup winner

The product measures **onchain popularity**, not real-world performance.

---

## Timeline Overview

| Phase | Duration | Purpose |
|---|---|---|
| Qualification (MVP) | ~6–8 weeks | Select top 48 countries |
| Main Tournament | ~6–8 weeks | Determine Onchain World Cup winner |
| Post-Season | ~2 weeks | Claims, analytics, Season reset |

Season mechanics remain **unchanged across seasons**.  
Only the **set of participating teams** may vary.

---

## Phase 1 – Qualification Phase (MVP Launch)

### Objective

Select the **48 most supported countries** to qualify for the Onchain World Cup tournament.

There are **no matches** during this phase.

---

### Teams

- All countries are initially available
- Countries are static entries (ISO list or curated set)
- No country is eliminated until the phase ends

---

### Support votes

- Fixed price per vote: `0.001 ETH`
- 1 vote = 1 support weight
- Users may buy multiple votes per country
- votes are additive and permanent for the phase

There is:
- No dynamic pricing
- No per-team curves
- No per-wallet curves

---

### Fees (Time-Based Only)

Fees increase globally over time to:
- Incentivize early participation
- Reduce late-stage manipulation

Example schedule (configurable):

| Week | Fee |
|---|---|
| Week 0 | 0% |
| Week 1 | 2% |
| Week 2 | 4% |
| Week 3 | 6% |
| Final | 8% |

Fee rules:
- Fee is applied at purchase time
- Fee ETH is excluded from prize pools
- Fee schedule is immutable once the phase starts

---

### Anti-Sybil Constraints

To reduce scripted or Sybil voting:
- Wallets must satisfy minimum eligibility criteria (e.g. age, activity, or balance heuristics)
- Multiple votes per wallet are allowed but always cost ETH
- There are no free ETH-backed votes

The system relies on **economic cost**, not identity.

---

### Qualification Snapshot

At the end of the qualification phase:
1. Total support votes are snapshotted per country
2. Countries are ranked by total support votes
3. The top **48 countries qualify**
4. All others are eliminated

This snapshot is final and immutable.

---

## Qualification Prize Pool

### Prize Pool Formation

- Prize pool = sum of all ETH contributed **after fees**
- Only ETH-backed support votes are counted
- Non-economic signals (if any) do not participate

---

### Reward Distribution

Only users who supported **qualified countries** are eligible for rewards.

Reward formula:

user_reward = (user_votes_on_qualified_teams / total_votes_on_qualified_teams) • qualification_prize_pool

Properties:
- Linear and deterministic
- No dynamic multipliers
- No floating-point math
- Claims are user-initiated

---

## Phase 2 – Onchain World Cup Tournament

### Objective

Determine the **Onchain World Cup Champion** using the 48 qualified countries.

---

### Tournament Structure

- Bracket-based tournament
- Group stages → Knockout rounds (configurable)
- Matches are fully onchain constructs
- Real-world match results are irrelevant

---

### Match Mechanics

For each match:
- Two teams compete
- Users support one team using fixed-price support votes
- Same global time-based fee model applies
- The team with higher total support votes wins

Tie handling:
- Defined explicitly (refunds or deterministic tie-breaker)

---

### Match Prize Pools

- Each match has its own ETH prize pool
- ETH is distributed to supporters of the winning team
- Distribution uses the same proportional logic as qualification

Optional:
- Finals may include boosted pools or sponsorships

---

## Phase 3 – Post-Season

### Claims
- Users claim qualification rewards
- Users claim match rewards
- Claims are permissionless and onchain

### Analytics
- Country rankings
- Participation metrics
- Fee revenue transparency

### Season Reset
- Phase state is cleared
- Historical data remains accessible
- Next season team set is initialized

---

## Design Principles (Strict)

1. **Simplicity over cleverness**
2. **No dynamic pricing curves**
3. **No prediction-market mechanics**
4. **Auditable arithmetic only**
5. **Clear UX in one paragraph**

Any feature that violates these principles must not be implemented.

---

## Summary for AI Agents

- Qualification phase has **no matches**
- Users buy fixed-price support votes
- Fees increase only with time
- Top 48 countries qualify
- ETH is redistributed proportionally
- Tournament phase reuses the same mechanics
- Real-world football results are ignored

This document is authoritative.