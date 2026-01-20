# Onchain World Cup — Implementation Overview & Task Breakdown

## Project Status (Current)
- ✅ Landing page live at https://onchainworldcup.xyz
- ✅ Demo / feedback app live at https://app.onchainworldcup.xyz
- ✅ Qualification smart contract implemented (ETH prize pool, voting, fees)
- ❌ Qualification phase not live yet
- ❌ No waitlist mechanics or Farcaster notification hooks yet
- ❌ "Add App & Get Notified" CTA not deployed to `/app` yet
- ❌ Social accounts started from zero reach

This document defines the **clear execution path** to go from current state → qualification launch → growth flywheel.

---

## Core Product Vision (Reminder)
Onchain World Cup is a **global onchain competition** where:
- Users back real countries
- Votes cost ETH
- ETH forms a prize pool
- Only top 48 countries qualify
- Users who backed qualified countries share the prize pool
- The final happens 1 week before the real World Cup

---

# PHASE 0 — REFRAME WHAT EXISTS (NO PROTOCOL CHANGES)

## Goal
Turn the existing demo into an intentional **pre-launch + waitlist experience**.

### Tasks
- Update landing page hero copy:
  - Replace “Demo / Feedback” language
  - Message should clearly say:
    > “Qualification Phase opens soon. Early supporters shape the tournament.”

- Add a simple timeline section:
  - Qualification opens (mid-February)
  - Qualification ends
  - Onchain World Cup Final (1 week before real World Cup)
  - Real World Cup follows after

### Implementation Notes
- Text-only changes
- No wallet connection required
- No contract interaction

---

# PHASE 1 — WAITLIST MECHANICS (CRITICAL)

## Goal
Turn early visitors into **reachable users** before launch by enabling Farcaster Mini App installation and Farcaster notifications.

### Tasks
- Deploy **"Add App & Get Notified"** primary CTA to `/app`
- Implement Farcaster Mini App installation:
  - Use Farcaster SDK `sdk.actions.addMiniApp()` to prompt users to add the Mini App
  - Detect if app is already added (check if running in Farcaster context)
  - Display installation status to user

- Implement Farcaster notifications:
  - Enable Farcaster notification permissions (via Farcaster SDK)
  - Request notification permission when user adds app
  - Set up notification hooks infrastructure for qualification launch alerts
  - Detect and display notification status

- Display status badge:
  - "Founding Supporter" (for early app installers)
  - "Early Qualification Insider" (for notification opt-ins)

### Implementation Notes
- Deploy CTA to `/app` (main app, not landing page)
- Use Farcaster SDK for Mini App installation (`@farcaster/miniapp-sdk`)
- Use Farcaster SDK for notification permissions
- Client-side state is acceptable initially for tracking install status
- No token / NFT required
- Wallet connection optional (soft prompt)
- App must be deployed to production domain (not tunnel/localhost) for `addMiniApp()` to work

---

# PHASE 2 — SHAREABILITY & VIRAL LOOPS

## Goal
Make every interaction promotable on Farcaster / X.

### Tasks
#### Static Share Preview
- Define OG image for:
  - Landing page
  - App root

**Must include**
- Trophy
- “Onchain World Cup”
- “ETH Prize Pool”
- “Qualification Opens Soon”

#### Dynamic Share Moments (prepare now)
- “I’m backing my country in the Onchain World Cup”
- “Qualification opens in X days”
- “Top 48 countries qualify”

### Implementation Notes
- Pre-composed share text
- Share button only (no forced posting)
- Dynamic images can be stubbed initially

---

# PHASE 3 — APP UX BEFORE QUALIFICATION

## Goal
Make the app emotionally engaging before money is involved.

### Tasks
#### Countdown
- Qualification countdown timer
- Visible on:
  - App home
  - Country pages
  - Landing page

#### Country Discovery
- Country list with:
  - Flag
  - Name
  - “Support this country” CTA
- Search + filter

### Implementation Notes
- Static country list initially
- Contract integration later

---

# PHASE 4 — READ-ONLY ONCHAIN TRANSPARENCY

## Goal
Build trust before users spend ETH.

### Tasks
- Display read-only data:
  - Total ETH prize pool (net of fees)
  - Votes per country
- Label clearly:
  - “Live onchain data”

### Implementation Notes
- Use contract read methods only
- No transactions yet
- Cache reads where possible

---

# PHASE 5 — QUALIFICATION PHASE LAUNCH

## Goal
Activate the core game loop.

### Tasks
- Enable voting UI:
  - Vote count selector
  - ETH cost preview
  - Platform fee disclosure
- Show:
  - Increasing vote price per country
  - Live leaderboard

### Implementation Notes
- Match smart contract logic exactly
- Always show net prize pool (fees excluded)
- Strong warning copy about ETH spending

---

# PHASE 6 — SHAREABLE MOMENTS DURING QUALIFICATION

## Goal
Turn users into distribution.

### Tasks
Trigger share prompts on:
- First vote
- Country enters top 48
- Qualification ends
- Prize pool milestones (e.g. 5 ETH, 10 ETH)

### Implementation Notes
- One-click share
- Auto-generated copy
- Dynamic preview image per event

---

# PHASE 7 — POST-QUALIFICATION

## Goal
Reward users and transition to main tournament.

### Tasks
- Claim UI:
  - Show claimable ETH
  - Show formula clearly:
    ```
    userQualifiedVotes / totalQualifiedVotes * totalPrizePool
    ```
- Post-qualification summary page:
  - Qualified countries
  - Total ETH distributed
  - Transition message:
    > “Main Onchain World Cup tournament coming next”

---

# PHASE 8 — MARKETING & DISTRIBUTION (NON-CODE)

## Channels
- Twitter (X)
- Farcaster
- Zora
- Paragraph (to be created)

### Content Pillars
- Build in public
- Explain fairness & mechanics
- Highlight ETH prize pool
- Country pride narratives
- Countdown urgency

### Timeline
- 2–3 posts/week pre-launch
- Daily light updates during qualification
- Heavy sharing prompts at milestones

---

# KEY PRINCIPLES (DO NOT BREAK)

- ETH prize pool must always be net of fees
- Qualification has **no matches**, only votes
- Admin can add countries if missing
- Users can vote multiple times
- Simplicity > clever math
- Trust > complexity
- Shareability is part of the product

---

# SUCCESS METRICS (EARLY)

- Farcaster Mini App adds (via `addMiniApp()`)
- Farcaster notification opt-ins
- Unique voters
- ETH in prize pool
- Share events per user

---

## Final Note
This project succeeds if:
> People feel they are participating in a real global event — not just using an app.

Everything above serves that goal.