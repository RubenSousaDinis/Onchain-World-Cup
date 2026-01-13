# Onchain World Cup - Implementation Plan

## Overview

Full-stack Next.js application for the **Onchain World Cup** - a crypto-native social coordination tournament on Base network. Compatible with **Base network** and **Farcaster** clients.

**This is NOT a prediction market** - it's a social coordination game measuring onchain popularity, independent of real-world football outcomes.

## Two-Phase Architecture

The system has **two distinct phases** with different mechanics:

### Phase 1: Qualification (~6-8 weeks)

**Objective:** Select top 48 countries for the tournament

- **NO MATCHES** during qualification
- Fixed-price voting: **0.001 ETH per vote**
- Time-based fees only (no dynamic pricing curves)
- Countries ranked by total support
- Top 48 qualify
- Prize pool distributed proportionally to supporters of qualified teams

**Smart Contract:** Single global `QualificationContract`

### Phase 2: Tournament (~6-8 weeks)

**Objective:** Determine the Onchain World Cup Champion

- **Match-based structure** (2 teams per match)
- Dynamic 2-phase pricing per match:
  - **Phase 1 (0-2 hours)**: Linear increase
  - **Phase 2 (2-24 hours)**: Exponential increase
- Winner determined by most ETH voted
- 90% of prize pool to winners, 10% platform fee
- Winners advance through bracket

**Smart Contracts:** `MatchFactory` + individual `TournamentMatchContract` per match

## Architecture

### Key Components

1. **Frontend**: Next.js 14+ with App Router
   - Qualification voting interface
   - Tournament match voting interface
   - Live standings and bracket display

2. **Backend**: Next.js API routes
   - Receive transaction hashes
   - Index on-chain data to database
   - Serve qualification standings
   - Serve tournament match data

3. **Database**: Supabase (PostgreSQL) with Prisma ORM
   - Indexed from blockchain events
   - Separate tables for qualification and tournament

4. **Blockchain**: Base network with smart contracts:
   - **QualificationContract**: Qualification phase voting (fixed price)
   - **MatchRegistry**: Stores match data on-chain
   - **MatchFactory**: Deploys match contracts
   - **TournamentMatchContract**: Per-match voting (dynamic pricing)

5. **Event Indexer**: Background service
   - Listens to blockchain events
   - Syncs to database in real-time

6. **Authentication**: Wallet-based auth supporting:
   - MetaMask/WalletConnect (standard web)
   - Farcaster wallets (via Privy or similar)
   - Embedded wallets for Farcaster users

7. **Farcaster Integration**:
   - Farcaster Frame support for in-app voting
   - Farcaster client compatibility
   - Social sharing features

## Pricing Models

### Qualification Phase Pricing (Fixed)

**Base Price:** 0.001 ETH per vote (immutable)

**Time-Based Fees:**
| Week | Fee |
|------|-----|
| Week 0 | 0% |
| Week 1 | 2% |
| Week 2 | 4% |
| Week 3 | 6% |
| Final | 8% |

- Fee applied at purchase time
- Fee ETH excluded from prize pool
- Fee schedule immutable once phase starts

**Payout:** Proportional to votes on qualified teams
```
user_reward = (user_votes_on_qualified / total_votes_on_qualified) × prize_pool
```

### Tournament Phase Pricing (Dynamic)

**Phase 1 (First 2 Hours): Linear**
```
price = 0.001 + (voteCount × 0.0001)
```

**Phase 2 (Hours 2-24): Exponential**
```
phase1EndPrice = 0.001 + (phase1VoteCount × 0.0001)
price = phase1EndPrice × (1.1 ^ phase2VoteCount)
```

**Voting Period:** 24 hours per match

**Payout:** 90% to winners (proportional by vote COUNT), 10% platform fee
```
user_reward = (userVoteCount / winningTeamVoteCount) × winnerPool
```

**Critical:** Payouts based on vote COUNT, not ETH amount. Early voters get more votes at lower prices.

## Database Schema

### Qualification Tables (NEW)

```prisma
model QualificationVote {
  id              String   @id @default(uuid())
  userAddress     String
  countryCode     String   // ISO 3166-1 alpha-2
  amountEth       Decimal
  feePercent      Int
  txHash          String   @unique
  blockNumber     BigInt
  blockTimestamp  DateTime
  createdAt       DateTime @default(now())
}

model QualificationStanding {
  countryCode    String   @id  // ISO 3166-1 alpha-2
  totalVotes     Int      @default(0)
  totalEth       Decimal  @default(0)
  rank           Int?
  isQualified    Boolean  @default(false)
  lastUpdated    DateTime @default(now())
}

model QualifiedCountry {
  countryCode         String   @id  // ISO 3166-1 alpha-2
  finalRank           Int
  totalVotes          Int
  totalEth            Decimal
  qualificationTime   DateTime
  createdAt           DateTime @default(now())
}
```

### Core Tables

```prisma
model User {
  id          String   @id @default(uuid())
  address     String   @unique
  farcasterFid Int?    // Optional Farcaster ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Country {
  code        String   @id  // ISO 3166-1 alpha-2 (e.g., "US", "BR", "FR")
  name        String
  flagEmoji   String
  flagUrl     String?
  region      String?
  createdAt   DateTime @default(now())
}

model Tournament {
  id              String   @id @default(uuid())
  name            String
  year            Int
  hostCountries   String[] // Array of country codes
  totalTeams      Int      // 48 for 2026
  startDate       DateTime
  endDate         DateTime
  status          String   // 'qualification' | 'group_stage' | 'knockout' | 'completed'
  currentPhase    String?
  createdAt       DateTime @default(now())
}

model Match {
  id                  String   @id @default(uuid())
  tournamentId        String
  matchNumber         Int
  team1CountryCode    String   // References QualifiedCountry
  team2CountryCode    String   // References QualifiedCountry
  contractAddress     String   @unique
  matchStartTime      DateTime
  votingDeadline      DateTime
  status              String   // 'upcoming' | 'active' | 'finalized'
  winningTeam         Int?     // 0, 1, or NULL
  team1Votes          Int      @default(0)
  team2Votes          Int      @default(0)
  team1Eth            Decimal  @default(0)
  team2Eth            Decimal  @default(0)
  createdAt           DateTime @default(now())
}

model TournamentVote {
  id              String   @id @default(uuid())
  matchId         String
  userAddress     String
  team            Int      // 0 or 1
  countryCode     String
  price           Decimal
  phase           Int      // 1 or 2
  txHash          String   @unique
  blockNumber     BigInt
  blockTimestamp  DateTime
  createdAt       DateTime @default(now())
}
```

### Groups (Optional - for Group Stage)

```prisma
model Group {
  id              String   @id @default(uuid())
  tournamentId    String
  name            String   // 'A', 'B', etc.
  displayName     String   // 'Group A', etc.
  maxTeams        Int      @default(4)
  createdAt       DateTime @default(now())
}

model GroupStanding {
  id              String   @id @default(uuid())
  groupId         String
  countryCode     String
  matchesPlayed   Int      @default(0)
  wins            Int      @default(0)
  draws           Int      @default(0)
  losses          Int      @default(0)
  votesFor        Int      @default(0)
  votesAgainst    Int      @default(0)
  voteDifference  Int      @default(0)
  points          Int      @default(0)
  position        Int?
  qualified       Boolean  @default(false)
  createdAt       DateTime @default(now())
}
```

## Implementation Phases

### Phase 1: Project Setup & Qualification MVP

**Priority:** Qualification phase is the immediate focus (MVP)

- Initialize Next.js project with TypeScript
- Set up Supabase project (free tier: 500 MB storage)
- Configure Prisma ORM with schema for Supabase PostgreSQL
- Set up environment variables:
  - Supabase connection string
  - Base RPC URL
  - Contract addresses
  - Farcaster manifest domain
- Create database migration scripts
- Install Farcaster Mini App SDK: `@farcaster/miniapp-sdk`

### Phase 2: Qualification Smart Contract Development

**Focus:** Fixed-price voting with time-based fees

- Write `QualificationContract` (Solidity):
  - Fixed-price voting (0.001 ETH)
  - Time-based fee schedule
  - Vote tracking per country (ISO 3166-1 alpha-2 codes as bytes2)
  - Prize pool accumulation
  - Snapshot function to determine top 48
  - Proportional reward distribution
  - Emit `VoteCast` event with country code, amount, fee
  - Emit `QualificationSnapshot` event with top 48 countries
  - Emit `RewardClaimed` event

- Deploy contract to Base network (testnet initially)
- Write contract tests (Hardhat/Foundry)
- Generate TypeScript types from contracts (TypeChain)

**See:** [QUALIFICATION_CONTRACT_SPEC.md](../contracts/QUALIFICATION_CONTRACT_SPEC.md)

### Phase 3: Qualification Frontend & Backend

- Create Qualification voting UI:
  - Display all countries with flags
  - Vote button (0.001 ETH each)
  - Show current fee percentage
  - Display time remaining
  - Real-time standings

- Build qualification standings page:
  - Leaderboard of all countries
  - Top 48 highlighted
  - User's supported countries
  - Projected rewards

- Create API endpoints:
  - `GET /api/qualification/standings` - Live rankings
  - `GET /api/qualification/countries` - All countries with stats
  - `POST /api/qualification/vote` - Index vote transaction
  - `GET /api/qualification/user/:address` - User's votes
  - `GET /api/qualification/rewards/:address` - Claimable rewards
  - `POST /api/qualification/snapshot` - Admin finalize top 48
  - `GET /api/qualification/qualified` - Final top 48

- Create Event Indexer for Qualification:
  - Listen to `VoteCast` events
  - Listen to `QualificationSnapshot` events
  - Listen to `RewardClaimed` events
  - Index to `qualification_votes` table
  - Update `qualification_standings` table
  - Create `qualified_countries` records after snapshot

### Phase 4: Tournament Smart Contract Development

**Focus:** Dynamic pricing for match voting

- Write `MatchRegistry` Contract:
  - Store match data on-chain
  - Map match IDs to contract addresses
  - Emit `MatchCreated` event with team codes, times

- Write `MatchFactory` Contract:
  - Deploy `TournamentMatchContract` instances
  - Create match entries in `MatchRegistry`
  - Emit `MatchCreated` event

- Write `TournamentMatchContract` (Solidity):
  - 2-phase pricing mechanism (linear → exponential)
  - Track vote COUNT separately from ETH
  - Phase 1: `price = 0.001 + (voteCount × 0.0001)`
  - Phase 2: `price = phase1EndPrice × (1.1 ^ phase2VoteCount)`
  - Vote function (accepts ETH, assigns to team A or B)
  - Emit `VoteCast` event with country code, price, phase
  - Track each user's vote count per team
  - Payout function (90% to winners based on vote COUNT, 10% fee)
  - Emit `PayoutClaimed` event
  - 24-hour voting deadline enforcement

**Critical:** Payouts based on vote COUNT, not ETH amount

**See:** [TOURNAMENT_CONTRACT_SPEC.md](../contracts/TOURNAMENT_CONTRACT_SPEC.md)

### Phase 5: Tournament Frontend & Backend

- Create match voting UI:
  - Display two teams with flags
  - Show current vote price (per team, shows phase)
  - Show phase indicator (Phase 1 / Phase 2)
  - Vote buttons
  - Real-time vote counts and ETH totals
  - Phase countdown timer
  - Voting deadline countdown

- Build tournament bracket page:
  - Display match schedule
  - Show match results
  - Bracket progression

- Create API endpoints:
  - `GET /api/matches` - List all matches
  - `GET /api/matches/:id` - Match details
  - `POST /api/matches/:id/vote` - Index vote transaction
  - `GET /api/matches/:id/user/:address` - User's votes for match
  - `GET /api/matches/:id/rewards/:address` - Claimable winnings
  - `POST /api/matches/:id/finalize` - Index match finalization

- Create Event Indexer for Tournament:
  - Listen to `MatchCreated` events from Factory
  - Listen to `VoteCast` events from Match contracts
  - Listen to `MatchFinalized` events
  - Listen to `PayoutClaimed` events
  - Index to `matches` and `tournament_votes` tables

### Phase 6: Wallet Integration & Blockchain Setup

- Set up Base network configuration (wagmi/viem)

- Integrate wallet connection with context detection:
  - **Desktop context**: MetaMask/WalletConnect
  - **Farcaster context**: Farcaster embedded wallets via `@farcaster/miniapp-sdk`
  - Detect context and use appropriate wallet method
  - Support Base network in all wallet types

- Create contract interaction utilities:
  - **Qualification:**
    - Vote on country (returns tx hash)
    - Get current fee
    - Get user's votes
    - Calculate claimable reward
    - Claim reward
  - **Tournament:**
    - Get current vote price per team
    - Submit vote (returns tx hash)
    - Get match state
    - Calculate winnings
    - Claim payout

### Phase 7: Farcaster Mini App Integration

- Create Farcaster Manifest:
  - Create `/.well-known/farcaster.json` file
  - Include `accountAssociation` object (signed)
  - Include `frame` object with app details
  - Version: `"1"` (not `"next"`)
  - Verify manifest accessible

- Add Embed Metadata (`fc:miniapp` meta tags):
  - Add to root layout and shareable pages
  - Use `fc:miniapp` meta tag (NOT `fc:frame`)
  - Include OG image (3:2 aspect ratio)
  - Button with launch action

- Initialize Farcaster SDK:
  - Install `@farcaster/miniapp-sdk`
  - Detect if running in Farcaster context
  - Call `sdk.actions.ready()` after app initialization
  - Handle SDK errors gracefully

- Dual Context Support:
  - Detect environment (desktop vs Farcaster)
  - Conditional rendering based on context
  - Responsive design for embedded views

- Social Features:
  - Share qualification votes on Farcaster
  - Share match results on Farcaster
  - Generate shareable links with proper metadata

### Phase 8: UI/UX & Real-Time Features

- Design responsive voting interfaces:
  - Works in web browsers (desktop)
  - Works in Farcaster clients (embedded)
  - Touch-friendly for mobile

- Create unified dashboard:
  - **Qualification tab:**
    - Countries supported
    - Vote counts per country
    - ETH spent
    - Claimable rewards
    - Claim button (after finalization)
  - **Tournament tab:**
    - Active matches
    - Vote history per match (showing vote count and ETH)
    - Claimable winnings
    - Claim buttons per match

- Add real-time updates:
  - Qualification standings refresh
  - Tournament match vote updates
  - Price changes
  - Phase transitions
  - Works in both desktop and Farcaster contexts

- Create leaderboards:
  - Most successful voters (qualification)
  - Most successful bettors (tournament)
  - Largest single votes

### Phase 9: Testing & Deployment

- Write unit tests for:
  - Qualification contract (vote, fees, snapshot, rewards)
  - Tournament contract (pricing, phases, payouts)
  - Vote count vs ETH tracking

- Test flows end-to-end:
  - Qualification voting → snapshot → claim rewards
  - Tournament match voting → finalization → claim winnings

- Test wallet integration (MetaMask, WalletConnect, Farcaster)

- Test Farcaster Mini App:
  - Verify manifest at `/.well-known/farcaster.json`
  - Test in preview tool
  - Verify meta tags
  - Test SDK initialization and `ready()` call

- Test phase transitions:
  - Qualification end → Tournament start
  - Match Phase 1 → Phase 2

- Set up deployment configuration
- Add error handling and logging

## Smart Contract Details

### QualificationContract

**See:** [QUALIFICATION_CONTRACT_SPEC.md](../contracts/QUALIFICATION_CONTRACT_SPEC.md)

**Key Functions:**
- `vote(bytes2 countryCode) payable` - Cast support vote
- `getCurrentFee() view returns (uint256)` - Get current fee %
- `snapshotQualification()` - Admin finalizes top 48
- `getQualifiedCountries() view returns (bytes2[48])` - Get top 48
- `calculateUserReward(address) view returns (uint256)` - Claimable amount
- `claimReward()` - Claim proportional reward

**Events:**
- `VoteCast(address indexed voter, bytes2 indexed country, uint256 amount, uint256 fee, uint256 timestamp)`
- `QualificationSnapshot(bytes2[48] qualifiedCountries, uint256 timestamp)`
- `RewardClaimed(address indexed user, uint256 amount)`

### TournamentMatchContract

**See:** [TOURNAMENT_CONTRACT_SPEC.md](../contracts/TOURNAMENT_CONTRACT_SPEC.md)

**Key State Variables:**
- `teamAVoteCount`, `teamBVoteCount` - Vote counts (for payouts)
- `teamAETH`, `teamBETH` - ETH totals (for prize pool)
- `userVotesTeamA`, `userVotesTeamB` - User vote counts
- `phase1VoteCount`, `phase1EndPrice` - Phase 1 end state

**Key Functions:**
- `vote(uint8 team) payable` - Vote for team (0=A, 1=B)
- `calculateVotePrice(uint8 team) view returns (uint256)` - Current price
- `getCurrentPhase() view returns (uint8)` - Returns 1 or 2
- `finalizeMatch()` - Determine winner after deadline
- `calculateWinnings(address) view returns (uint256)` - Claimable amount
- `claimPayout()` - Claim winnings

**Events:**
- `VoteCast(address indexed voter, bytes2 indexed country, uint256 price, uint8 phase, uint256 totalVotes)`
- `MatchFinalized(uint8 winningTeam, uint256 teamAETH, uint256 teamBETH, uint256 timestamp)`
- `PayoutClaimed(address indexed claimer, uint256 amount)`

### MatchFactory

**Key Functions:**
- `createMatch(uint256 matchId, bytes2 teamA, bytes2 teamB, uint256 startTime) returns (address)` - Deploy match contract

**Events:**
- `MatchCreated(uint256 indexed matchId, address matchContract, bytes2 teamA, bytes2 teamB, uint256 startTime)`

## Data Flow

### Qualification Voting Flow

```
User connects wallet →
User selects country →
Frontend calls QualificationContract.vote(countryCode) →
Transaction submitted (0.001 ETH + fee) →
Transaction hash returned →
Frontend calls POST /api/qualification/vote with tx hash →
Backend queries transaction receipt →
Backend indexes VoteCast event to database →
Frontend updates qualification standings
```

### Tournament Voting Flow

```
User connects wallet →
User selects match and team →
Frontend calls TournamentMatch.vote(team) →
Transaction submitted (dynamic price) →
Transaction hash returned →
Frontend calls POST /api/matches/:id/vote with tx hash →
Backend queries transaction receipt →
Backend indexes VoteCast event to database →
Frontend updates match state
```

### Phase Transition Flow

```
Qualification deadline passes →
Admin calls QualificationContract.snapshotQualification() →
Top 48 countries determined and stored on-chain →
QualificationSnapshot event emitted →
Backend indexes qualified countries →
Users can claim qualification rewards →
Admin creates tournament structure →
MatchFactory creates match contracts →
Tournament phase begins
```

## Key Files to Create

### Smart Contracts

- `contracts/QualificationContract.sol` - Qualification voting (fixed price)
- `contracts/TournamentMatchContract.sol` - Per-match voting (dynamic pricing)
- `contracts/MatchFactory.sol` - Factory to deploy match contracts
- `contracts/MatchRegistry.sol` - On-chain match data storage
- `contracts/interfaces/IQualificationContract.sol`
- `contracts/interfaces/ITournamentMatch.sol`
- `contracts/interfaces/IMatchRegistry.sol`
- `scripts/deploy-qualification.ts` - Deploy qualification contract
- `scripts/deploy-tournament.ts` - Deploy tournament contracts
- `scripts/create-matches.ts` - Script to create matches via factory
- `test/QualificationContract.test.ts` - Qualification tests
- `test/TournamentMatchContract.test.ts` - Tournament tests
- `test/MatchFactory.test.ts` - Factory tests

### Backend/API

- `prisma/schema.prisma` - Database schema definition
- `lib/db.ts` - Database connection and Prisma client
- `lib/blockchain.ts` - Base network configuration
- `lib/contracts.ts` - Contract ABIs and interaction helpers
- `lib/indexer.ts` - Event indexer service
- `lib/txProcessor.ts` - Process transaction hashes

**Qualification API:**
- `app/api/qualification/standings/route.ts` - Get live rankings
- `app/api/qualification/countries/route.ts` - Get all countries
- `app/api/qualification/vote/route.ts` - Index vote transaction
- `app/api/qualification/user/[address]/route.ts` - User stats
- `app/api/qualification/rewards/[address]/route.ts` - Claimable rewards
- `app/api/qualification/snapshot/route.ts` - Admin finalize
- `app/api/qualification/qualified/route.ts` - Get top 48

**Tournament API:**
- `app/api/matches/route.ts` - List matches
- `app/api/matches/[id]/route.ts` - Match details
- `app/api/matches/[id]/vote/route.ts` - Index vote
- `app/api/matches/[id]/user/[address]/route.ts` - User's match votes
- `app/api/matches/[id]/rewards/[address]/route.ts` - Claimable winnings
- `app/api/matches/[id]/finalize/route.ts` - Index finalization

**Farcaster:**
- `public/.well-known/farcaster.json` - Farcaster manifest

### Frontend Components

**Qualification:**
- `components/qualification/VotingInterface.tsx` - Main voting UI
- `components/qualification/CountryCard.tsx` - Country display with vote button
- `components/qualification/StandingsTable.tsx` - Live rankings
- `components/qualification/RewardCalculator.tsx` - Show projected rewards
- `components/qualification/ClaimRewards.tsx` - Claim interface

**Tournament:**
- `components/tournament/MatchCard.tsx` - Match display with voting
- `components/tournament/VoteButton.tsx` - Vote transaction component
- `components/tournament/PayoutClaim.tsx` - Claim winnings component
- `components/tournament/PriceDisplay.tsx` - Current price with phase indicator
- `components/tournament/PhaseIndicator.tsx` - Shows Phase 1 or 2
- `components/tournament/Bracket.tsx` - Tournament bracket display

**Shared:**
- `components/WalletConnect.tsx` - Wallet connection (MetaMask, WalletConnect, Farcaster)
- `components/FarcasterProvider.tsx` - Farcaster SDK provider
- `components/FarcasterDetector.tsx` - Detect Farcaster context
- `components/FarcasterShare.tsx` - Share to Farcaster

### Utilities

- `utils/qualificationHelpers.ts` - Qualification logic
- `utils/matchScheduler.ts` - Match scheduling logic
- `utils/pricingCalculation.ts` - Tournament pricing formulas
- `utils/countryCodes.ts` - Country code utilities
- `utils/farcaster.ts` - Farcaster SDK utilities
- `utils/miniappMetadata.ts` - Generate Farcaster metadata

## Important Dates

- Qualification phase: Starts immediately, ends ~6-8 weeks later
- Main tournament: Starts after qualification, runs ~6-8 weeks
- Voting period per match: **24 hours**

## Considerations

### Two-Phase System

- Completely separate contracts and mechanics
- Qualification contract deployed once per season
- Tournament contracts deployed individually per match
- Different pricing models (fixed vs dynamic)
- Different payout models (proportional to qualified support vs winner-take-most)

### Gas Costs

- Base network has lower fees than Ethereum mainnet
- Qualification contract must handle 200+ countries efficiently
- Snapshot function must be gas-optimized
- Tournament factory pattern reduces costs

### Pricing

- Qualification: Fixed 0.001 ETH, simple to understand
- Tournament Phase 1: Linear, accessible prices
- Tournament Phase 2: Exponential, creates urgency

**Critical:** Tournament payouts based on vote COUNT, not ETH amount

### Database

- Separate tables for qualification and tournament
- Supabase free tier (500 MB) sufficient initially
- Can upgrade to Pro ($25/month) for 8 GB if needed

### Farcaster

- Use Mini App SDK (NOT Frame SDK)
- Call `sdk.actions.ready()` after initialization
- Manifest must be accessible at `/.well-known/farcaster.json`
- Use `fc:miniapp` meta tag (NOT `fc:frame`)

### Security

- Use `ReentrancyGuard` on claim functions
- Qualification snapshot only callable by owner
- Tournament match finalization is permissionless
- Platform fee withdrawal restricted to platform wallet

## Related Documents

- [ROADMAP.md](../ROADMAP.md) - Official specification
- [TWO_PHASE_SYSTEM.md](../architecture/TWO_PHASE_SYSTEM.md) - System architecture
- [QUALIFICATION_CONTRACT_SPEC.md](../contracts/QUALIFICATION_CONTRACT_SPEC.md) - Qualification contract
- [TOURNAMENT_CONTRACT_SPEC.md](../contracts/TOURNAMENT_CONTRACT_SPEC.md) - Tournament contract
- [TOURNAMENT_STRUCTURE.md](../database/TOURNAMENT_STRUCTURE.md) - Database design
- [pricing_analysis.md](./pricing_analysis.md) - Tournament pricing analysis
