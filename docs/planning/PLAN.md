# Crypto World Cup Betting App - Implementation Plan

## Overview

Full-stack Next.js application for ETH-based voting/betting on World Cup matches on Base network. Compatible with **Base network** and **Farcaster** clients. Each match has its own smart contract with **2-phase time-based pricing**:
- **Phase 1 (First 2 hours)**: Linear increase
- **Phase 2 (Hours 2-24)**: Exponential increase

Winner determined by most ETH voted. 90% of prize pool to winners, 10% platform fee.

## Architecture

### Key Components

1. **Frontend**: Next.js 14+ with App Router, React components for voting interface
2. **Backend**: Next.js API routes that receive transaction hashes and index on-chain data to database
3. **Database**: Supabase (PostgreSQL) with Prisma ORM (indexed from blockchain)
4. **Blockchain**: Base network with smart contracts:
   - **MatchRegistry**: Stores match data on-chain
   - **MatchFactory**: Deploys match contracts and creates matches
   - **MatchContract**: Per-match voting contract
5. **Event Indexer**: Background service that listens to blockchain events and syncs to database
6. **Authentication**: Wallet-based auth supporting:
   - MetaMask/WalletConnect (standard web)
   - Farcaster wallets (via Privy or similar)
   - Embedded wallets for Farcaster users
7. **Farcaster Integration**: 
   - Farcaster Frame support for in-app voting
   - Farcaster client compatibility (Warpcast, etc.)
   - Social sharing features

### Pricing Model (FINALIZED)

**Phase 1 (First 2 Hours): Linear**
\`\`\`
price = 0.001 + (voteCount × 0.0001)
\`\`\`

**Phase 2 (Hours 2-24): Exponential**
\`\`\`
phase1EndPrice = 0.001 + (phase1VoteCount × 0.0001)
price = phase1EndPrice × (1.1 ^ phase2VoteCount)
\`\`\`

**Voting Period**: 24 hours per match

**Payout**: 90% to winners (proportional), 10% platform fee

## Database Schema

### Core Tables

- `users`: Wallet addresses, voting history, optional Farcaster FID (Farcaster ID)
- `countries`: Country data (name, code (ISO 3166-1 alpha-2), flag, etc.) - reference data
- `matches`: Match details (indexed from on-chain):
  - `match_id` (on-chain ID)
  - `team_a_code`, `team_b_code` (ISO 3166-1 alpha-2 country codes, e.g., "US", "BR", "FR")
  - `match_date`, `phase` (qualifier/main)
  - `contract_address`
  - `voting_start`, `voting_deadline`
  - `status`, `result`
  - `creation_tx_hash` (transaction that created the match)
- `votes`: User votes (indexed from on-chain events):
  - `match_id`, `user_id` (wallet address)
  - `amount_eth`, `voted_country_code` (ISO 3166-1 alpha-2 code)
  - `vote_price_at_time`, `phase`
  - `transaction_hash` (vote transaction)
  - `block_number`, `block_timestamp`
- `groups`: Qualification groups (name, countries) - can be on-chain or off-chain
- `group_standings`: Points, wins, losses per country per group - calculated from on-chain match results
- `indexed_transactions`: Track which transactions/events have been indexed (prevent duplicates)

## Implementation Phases

### Phase 1: Project Setup & Database

- Initialize Next.js project with TypeScript
- Set up Supabase project (free tier: 500 MB storage)
- Configure Prisma ORM with schema for Supabase PostgreSQL
- Set up environment variables:
  - Supabase connection string
  - Base RPC URL
  - Contract addresses
  - Farcaster manifest domain (for signing)
- Create database migration scripts
- Integrate Supabase client for real-time features (optional)
- Install Farcaster Mini App SDK: `@farcaster/miniapp-sdk`

### Phase 2: Smart Contract Development

- Write MatchRegistry Contract (Solidity):
  - Store match data on-chain (teamA, teamB as bytes2 country codes, date, phase, etc.)
  - Country codes: ISO 3166-1 alpha-2 format (e.g., "US", "BR", "FR") stored as bytes2
  - Emit `MatchCreated` event with all match details including country codes
  - Map match IDs to contract addresses
  - Optional: Store country metadata on-chain (name, flag URL, etc.)

- Write MatchFactory Contract:
  - Deploy match contracts on demand
  - Create match entries in MatchRegistry
  - Emit `MatchCreated` event with:
    - Match ID
    - Team A and Team B (bytes2 country codes, e.g., "US", "BR")
    - Match date
    - Phase (qualifier/main)
    - Contract address
    - Voting start and deadline timestamps
  - Store deployed contract addresses

- Write Match Contract (Solidity):
  - 2-phase pricing mechanism
  - Phase 1: Linear (0.001 + voteCount × 0.0001)
  - Phase 2: Exponential (phase1EndPrice × 1.1^phase2VoteCount)
  - Track phase1VoteCount and phase1EndPrice
  - Vote function (accepts ETH, assigns to team A or B)
  - Emit `VoteCast` event with:
    - Voter address
    - Team voted for (bytes2 country code)
    - Amount paid
    - Current price
    - Phase
    - Vote count
  - Track total votes per team
  - Calculate current vote price based on phase
  - Track each user's vote count per team (mapping: address => team => vote count)
  - Track each user's total ETH contribution per team (for display/statistics)
  - Payout function (90% to winners, 10% fee to platform)
    - Only callable after voting deadline has passed
    - Calculates user's share based on their **number of votes** for winning team (not ETH amount)
    - Proportionally distributes 90% of prize pool based on vote count
    - Rewards early voters who can vote more times at lower prices
  - Emit `PayoutClaimed` event
  - 24-hour voting deadline enforcement

- Deploy contracts to Base network (testnet initially)

- Write contract tests (Hardhat/Foundry)

- Generate TypeScript types from contracts (TypeChain)

### Phase 3: Blockchain Integration & Event Indexing

- Set up Base network configuration (wagmi/viem)

- Integrate wallet connection with context detection:
  - **Desktop context**: MetaMask/WalletConnect
  - **Farcaster context**: Farcaster embedded wallets via `@farcaster/miniapp-sdk`
  - Detect context and use appropriate wallet connection method
  - Support for Base network in all wallet types
  - Handle wallet connection errors gracefully in both contexts

- Create contract interaction utilities:
  - Read current vote price from match contract (handles phase logic)
  - Submit vote transaction (ETH + team selection) - returns tx hash
  - Create match transaction (via factory) - returns tx hash
  - Check user's vote status per match (read from contract)
  - Read match state (total votes per team, voting deadline, current phase)
  - Claim payout function - returns tx hash

- Create Event Indexer Service:
  - Listen to `MatchCreated` events from MatchRegistry/Factory
  - Listen to `VoteCast` events from Match contracts
  - Listen to `PayoutClaimed` events
  - Index events to database:
    - Parse event data
    - Create/update match records
    - Create vote records
    - Update match statistics
  - Handle reorgs and missed blocks
  - Track indexed transactions (prevent duplicates)
  - Can run as background job or API route

- Create API endpoints (receive tx hashes, query chain, update DB):
  - `POST /api/matches/index` - Receive match creation tx hash, query chain, index to DB
    - Body: `{ txHash: "0x...", matchId?: number }`
    - Queries MatchRegistry/Factory for match data
    - Creates match record in database
  - `POST /api/votes/index` - Receive vote tx hash, query chain, index to DB
    - Body: `{ txHash: "0x...", matchId?: number }`
    - Queries Match contract for vote data
    - Creates vote record in database
  - `GET /api/matches` - List matches (from database)
  - `GET /api/matches/:id` - Get match details (from database + on-chain state)
  - `GET /api/matches/:id/votes` - Get voting statistics (from database)
  - `GET /api/matches/:id/price` - Get current vote price (from contract)
  - `POST /api/matches/:id/claim` - Initiate claim transaction, returns tx hash

### Phase 4: Qualification Phase System

- Create on-chain group stage generator:
  - Smart contract or script that creates matches on-chain
  - Divide all countries into groups (using country codes)
  - Generate match schedule for qualifiers (ending June 7th)
  - Call MatchFactory to create matches on-chain (passing country codes as bytes2)
  - Emit events that get indexed

- Build match scheduler for qualifiers (ending June 7th):
  - Can be off-chain script that calls factory
  - Or on-chain contract that generates matches

- Implement group standings calculation:
  - Read match results from on-chain contracts
  - Calculate standings (can be on-chain or off-chain)
  - Determine top 48 teams that advance

- Build UI for viewing groups and qualifier matches:
  - Display matches from database (indexed from chain)
  - Show voting interface
  - Display standings calculated from on-chain results

### Phase 5: Main Tournament Phase

- Parse `world_cup_2026_matches_per_day.csv` for match scheduling

- Generate match schedule starting June 11th:
  - Create matches on-chain via MatchFactory
  - Each match creation emits event
  - Events get indexed to database

- Create bracket/knockout system for later rounds:
  - Can be calculated from on-chain match results
  - Or stored on-chain in registry

- Build match display components with voting interface:
  - Display matches from database
  - Show on-chain voting state
  - Allow users to vote (returns tx hash)

### Phase 6: Voting Interface & Payout System

- Create voting UI component:
  - Display current vote price (from contract, shows phase)
  - Show which phase is active (Phase 1 or Phase 2)
  - Show total ETH voted per team
  - Real-time price updates as votes come in
  - Vote transaction flow (connect wallet → confirm → submit)
  - Display time remaining in current phase

- Implement payout claiming:
  - Check if voting deadline has passed
  - Detect match winner (team with more ETH)
  - Calculate user's share (proportional to their **number of votes** for winning team)
  - Display claimable amount (only if user voted for winner and deadline passed)
  - Show user's vote count per team (not just ETH amount)
  - Claim payout button (calls contract's claimPayout function)
  - Display pending/claimed payouts
  - Show user's vote count and ETH contribution to each team

- Add vote history and active votes views

- Create admin tools:
  - Manually finalize match results (if needed)
  - Emergency contract pause (if needed)

### Phase 7: Farcaster Mini App Integration

- Create Farcaster Manifest:
  - Create `/.well-known/farcaster.json` file
  - Include `accountAssociation` object (signed via Farcaster tool)
  - Include `frame` object with:
    - `version: "1"` (not "next")
    - `name`: App name
    - `iconUrl`: App icon (200x200px)
    - `homeUrl`: App home URL
  - For Vercel: Set up redirect if using hosted manifest
  - Verify manifest is accessible at `https://{domain}/.well-known/farcaster.json`

- Add Embed Metadata (fc:miniapp meta tags):
  - Add to root layout and all shareable pages
  - Use `fc:miniapp` meta tag (NOT `fc:frame` - that's legacy)
  - Structure:
    \`\`\`typescript
    {
      version: "1",
      imageUrl: "https://...", // 3:2 aspect ratio OG image
      button: {
        title: "Open App", // Max 32 characters
        action: {
          type: "launch_frame",
          name: "Crypto World Cup",
          url: "https://...", // Optional
          splashImageUrl: "https://...", // 200x200px
          splashBackgroundColor: "#f7f7f7"
        }
      }
    }
    \`\`\`
  - Implement in Next.js `generateMetadata()` function

- Initialize Farcaster SDK:
  - Install `@farcaster/miniapp-sdk` package
  - Detect if running in Farcaster context
  - Call `sdk.actions.ready()` after app initialization
  - Handle SDK initialization errors gracefully
  - Ensure app works in both desktop and Farcaster contexts

- Dual Context Support:
  - Detect environment (desktop browser vs Farcaster client)
  - Conditional rendering based on context
  - Responsive design for embedded contexts (Farcaster)
  - Full-featured UI for desktop
  - Handle wallet connections appropriately:
    - Desktop: MetaMask, WalletConnect
    - Farcaster: Farcaster embedded wallets via SDK

- Social Features:
  - Share match results on Farcaster
  - Share voting activity
  - Display Farcaster user info (if connected via SDK)
  - Generate shareable links with proper embed metadata

### Phase 8: UI/UX & App Initialization

- App Initialization (Critical for Farcaster):
  - Create root layout that detects context (desktop vs Farcaster)
  - Initialize Farcaster SDK if in Farcaster context:
    \`\`\`typescript
    import { sdk } from '@farcaster/miniapp-sdk'
    
    // After app is ready to display
    if (isFarcasterContext) {
      await sdk.actions.ready()
    }
    \`\`\`
  - Handle infinite splash screen issue (must call `ready()` after initialization)
  - Show appropriate loading states for both contexts

- Design responsive voting interface:
  - Works seamlessly in web browsers (desktop)
  - Works in Farcaster clients (embedded context)
  - Responsive design that adapts to container size
  - Touch-friendly for mobile Farcaster clients

- Create match cards with:
  - Team names and flags
  - Current vote price (with phase indicator)
  - Total ETH per team (real-time)
  - Vote button (shows exact ETH cost)
  - Voting deadline countdown
  - Phase indicator (Phase 1: Linear / Phase 2: Exponential)
  - Winner display (after voting closes)
  - Responsive layout for both desktop and Farcaster contexts

- Build dashboard for:
  - User's active votes
  - Vote history (with vote count and amounts per match)
  - Vote count per match (for each team) - this determines payout share
  - Total ETH contributed per match (for each team) - for reference
  - Claimable payouts (only after match deadline, only if voted for winner)
  - Payout calculation breakdown (vote count / total votes × winner pool)
  - Total ETH won/lost
  - Claim status per match

- Add real-time updates for:
  - Vote price changes
  - Total ETH per team
  - Phase transitions
  - New votes (optional: live feed)
  - Works in both desktop and Farcaster contexts

- Create leaderboards and statistics:
  - Most successful voters
  - Largest single votes
  - Total ETH in prize pools

### Phase 9: Testing & Deployment

- Write unit tests for core logic

- Test betting flows end-to-end

- Test wallet integration (MetaMask, WalletConnect, Farcaster embedded wallets)

- Test Farcaster Mini App:
  - Verify manifest at `/.well-known/farcaster.json`
  - Test in Farcaster preview tool: `https://farcaster.xyz/~/developers/mini-apps/preview?url={url}`
  - Verify `fc:miniapp` meta tags on all pages
  - Test SDK initialization and `ready()` call
  - Test in Farcaster clients (Warpcast, etc.)
  - Verify app works in both desktop and Farcaster contexts

- Test phase transitions (Phase 1 → Phase 2)

- Test pricing calculations (linear and exponential)

- Set up deployment configuration

- Add error handling and logging

## Key Files to Create

### Smart Contracts
- `contracts/MatchRegistry.sol`: On-chain match data storage and events
- `contracts/MatchContract.sol`: Per-match voting contract with 2-phase pricing
- `contracts/MatchFactory.sol`: Factory to deploy match contracts and create matches
- `contracts/interfaces/IMatchContract.sol`: Interface definitions
- `contracts/interfaces/IMatchRegistry.sol`: Registry interface
- `scripts/deploy.ts`: Deployment scripts
- `scripts/createMatches.ts`: Script to create matches on-chain
- `test/MatchContract.test.ts`: Contract tests
- `test/MatchFactory.test.ts`: Factory tests

### Backend/API
- `prisma/schema.prisma`: Database schema definition
- `lib/db.ts`: Database connection and Prisma client
- `lib/blockchain.ts`: Base network configuration and utilities
- `lib/contracts.ts`: Contract ABIs and interaction helpers
- `lib/pricing.ts`: Pricing calculation utilities (matches contract logic)
- `lib/indexer.ts`: Event indexer service (listens to blockchain events)
- `lib/txProcessor.ts`: Process transaction hashes and index to DB
- `app/api/matches/index/route.ts`: Index match creation from tx hash
- `app/api/votes/index/route.ts`: Index vote from tx hash
- `app/api/matches/route.ts`: List matches (from database)
- `app/api/matches/[id]/route.ts`: Get match details (database + on-chain)
- `app/api/matches/[id]/votes/route.ts`: Get voting statistics
- `app/api/matches/[id]/price/route.ts`: Get current vote price (from contract)
- `GET /api/matches/[id]/claimable/:address`: Get claimable amount for user (checks deadline, winner, user's vote count)
  - Returns: vote count, total votes for winner, calculated share
- `app/api/matches/[id]/claim/route.ts`: Initiate claim transaction (returns tx hash)
  - Validates: deadline passed, user voted for winner, not already claimed
- `app/api/indexer/route.ts`: Manual trigger for event indexer (optional)
- `public/.well-known/farcaster.json`: Farcaster manifest file (or redirect config for Vercel)
- `app/api/farcaster/manifest/route.ts`: Serve manifest if needed (alternative to static file)

### Frontend Components
- `components/VotingInterface.tsx`: Main voting UI
- `components/MatchCard.tsx`: Individual match display with voting
- `components/WalletConnect.tsx`: Wallet connection component (supports MetaMask, WalletConnect, Farcaster)
- `components/FarcasterProvider.tsx`: Farcaster SDK provider and context
- `components/FarcasterDetector.tsx`: Detect if running in Farcaster context
- `components/FarcasterShare.tsx`: Share to Farcaster component
- `components/ContextAwareUI.tsx`: Conditional UI based on desktop/Farcaster context
- `components/VoteButton.tsx`: Vote transaction component
- `components/PayoutClaim.tsx`: Claim payout component
  - Shows claimable amount (if user voted for winner and deadline passed)
  - Displays user's vote count for winning team (this determines share)
  - Displays total votes for winning team
  - Shows calculated share: (user votes / total votes) × winner pool
  - Shows user's ETH contribution (for reference, not used in calculation)
  - Claim button (disabled if already claimed or can't claim)
- `components/PriceDisplay.tsx`: Current vote price display with phase indicator
- `components/PhaseIndicator.tsx`: Shows current phase (1 or 2)

### Utilities
- `utils/matchScheduler.ts`: Match scheduling logic
- `utils/qualifierLogic.ts`: Group stage and qualification calculations
- `utils/contractHelpers.ts`: Contract interaction utilities
- `utils/pricingCalculation.ts`: Pricing calculation (Phase 1 linear, Phase 2 exponential)
- `utils/countryCodes.ts`: Country code utilities (convert between string and bytes2, validate ISO 3166-1 alpha-2 codes)
- `utils/farcaster.ts`: Farcaster utilities (SDK initialization, context detection, user info)
- `utils/miniappMetadata.ts`: Generate Farcaster Mini App embed metadata
- `utils/manifest.ts`: Generate and validate Farcaster manifest

## Data Flow

### Match Creation Flow
\`\`\`
User/Admin calls MatchFactory.createMatch(bytes2 teamACode, bytes2 teamBCode, ...) → 
Factory deploys MatchContract (with country codes) → 
Factory calls MatchRegistry.registerMatch() with country codes → 
MatchCreated event emitted (includes country codes) → 
Event Indexer listens to event → 
Indexer queries contract for match data → 
Indexer creates match record in database (with country codes) → 
Frontend displays match from database (looks up country names/flags from country codes)
\`\`\`

### Voting Flow
\`\`\`
User connects wallet → 
User clicks vote button (selects country) → 
Frontend calls MatchContract.vote(teamIndex) → 
Transaction submitted → 
Transaction hash returned to frontend → 
Frontend calls POST /api/votes/index with tx hash → 
Backend queries transaction receipt → 
Backend queries MatchContract for vote details (gets country code from event) → 
Backend creates vote record in database (with country code) → 
VoteCast event emitted with country code (indexed automatically) → 
Frontend updates UI
\`\`\`

### Complete Match Lifecycle
\`\`\`
Match created on-chain → Event indexed → Database updated → 
Voting starts (Phase 1: Linear pricing) → 
Users vote with ETH (tx hash indexed) → 
2 hours pass → Phase 2 begins (Exponential pricing) → 
Users continue voting (tx hash indexed) → 
24 hours complete → Voting deadline → 
Winner determined on-chain (team with more ETH) → 
Users can now claim payouts (only if they voted for winner) → 
Each user's payout = (their vote count for winner / winner's total vote count) × 90% of pool → 
Early voters benefit (more votes at lower prices = larger share) → 
Users call claimPayout() to receive their share → 
Platform receives 10% fee (can be claimed separately)
\`\`\`

## Smart Contract Details

### MatchRegistry Contract
- `registerMatch(uint256 matchId, bytes2 teamACode, bytes2 teamBCode, uint256 matchDate, uint8 phase, address matchContract, uint256 votingStart, uint256 votingDeadline)`: Register a new match
  - `teamACode` and `teamBCode`: ISO 3166-1 alpha-2 country codes (e.g., "US", "BR", "FR") stored as bytes2
- `getMatch(uint256 matchId)`: Returns match data including country codes
- `getMatchContract(uint256 matchId)`: Returns match contract address
- **Event**: `MatchCreated(uint256 indexed matchId, bytes2 teamACode, bytes2 teamBCode, uint256 matchDate, uint8 phase, address matchContract, uint256 votingStart, uint256 votingDeadline)`

### MatchFactory Contract
- `createMatch(bytes2 teamACode, bytes2 teamBCode, uint256 matchDate, uint8 phase)`: Deploy contract and register match
  - `teamACode` and `teamBCode`: ISO 3166-1 alpha-2 country codes (e.g., "US", "BR", "FR") as bytes2
- Returns: match ID and contract address
- Emits `MatchCreated` event with country codes

### Match Contract Functions
- `vote(uint8 team)`: Pay current price in ETH, vote for team (0 = teamA, 1 = teamB)
  - Internally maps to country codes stored in contract (teamA = bytes2 country code, teamB = bytes2 country code)
- **Event**: `VoteCast(address indexed voter, bytes2 countryCode, uint256 amount, uint256 price, uint8 phase, uint256 voteCount)`
  - `countryCode`: The country code (bytes2) that was voted for
- `getCurrentPrice()`: Returns current vote price (handles phase logic)
- `getCurrentPhase()`: Returns 1 or 2
- `getVoteCount()`: Returns total number of votes cast
- `getPhase1VoteCount()`: Returns votes cast in Phase 1
- `getTotalVotes(uint8 team)`: Returns total ETH voted for team (0 = teamA, 1 = teamB)
- `getTeamACode()`: Returns bytes2 country code for team A
- `getTeamBCode()`: Returns bytes2 country code for team B
- `getUserVoteCount(address user, uint8 team)`: Returns number of votes user cast for team
- `getUserVoteAmount(address user, uint8 team)`: Returns total ETH amount user voted for team (for display)
- `getTotalVoteCount(uint8 team)`: Returns total number of votes cast for team
- `claimPayout()`: Allows winning voters to claim their share
  - Only callable after voting deadline has passed
  - Calculates: (user's vote count for winning team / winning team's total vote count) × winnerPool
  - Transfers user's share of 90% prize pool
  - Prevents double-claiming (tracks claimed amounts)
- **Event**: `PayoutClaimed(address indexed claimer, uint256 amount)`
- `getWinner()`: Returns winning team (0 or 1) after voting closes
- `getWinnerCode()`: Returns bytes2 country code of winning team
- `canClaim(address user)`: Returns whether user can claim (voted for winner, deadline passed, not yet claimed)
- `getClaimableAmount(address user)`: Returns claimable amount for user (0 if didn't vote for winner)
  - Based on vote count, not ETH amount

### Pricing Formula (Contract Logic)

**Phase 1 (first 2 hours):**
\`\`\`
initialPrice = 0.001 ETH
linearIncrement = 0.0001 ETH
currentPrice = initialPrice + (voteCount × linearIncrement)
\`\`\`

**Phase 2 (hours 2-24):**
\`\`\`
phase1EndPrice = initialPrice + (phase1VoteCount × linearIncrement)
phase2VoteCount = totalVoteCount - phase1VoteCount
exponentialMultiplier = 1.1
currentPrice = phase1EndPrice × (exponentialMultiplier ^ phase2VoteCount)
\`\`\`

### Payout Calculation

**After voting deadline ends:**

\`\`\`
totalPool = totalVotesTeamA + totalVotesTeamB (in ETH)
platformFee = totalPool × 0.10
winnerPool = totalPool × 0.90

// For each user who voted for the winning team:
userVoteCount = number of votes user cast for winning team
winningTeamVoteCount = total number of votes cast for winning team
userShare = (userVoteCount / winningTeamVoteCount) × winnerPool
\`\`\`

**Key Points:**
- Users can vote multiple times (at increasing prices)
- Each user's payout is proportional to their **number of votes** for the winning team (not ETH amount)
- **Early voters benefit**: They can vote more times at lower prices, so they get more votes and thus a larger share
- Example: User A votes 10 times early (0.01 ETH total) vs User B votes 5 times late (0.05 ETH total)
  - User A gets: (10 / totalVotes) × winnerPool
  - User B gets: (5 / totalVotes) × winnerPool
  - User A gets 2x the payout despite voting less ETH
- Users can only claim after the voting deadline has passed
- Users who voted for the losing team receive nothing
- Platform receives 10% fee (can be claimed by platform wallet)

## Important Dates

- Qualification phase: Starts immediately, ends **June 7, 2026**
- Main tournament: Starts **June 11, 2026** (matches per day from CSV)
- Total matches in main phase: Sum of matches column in CSV
- Voting period per match: **24 hours**

## Considerations

- **Timezone handling**: Match dates and voting deadlines need proper timezone management
- **Gas costs**: Base network has lower fees than Ethereum mainnet, but still need to optimize contract gas usage
- **Phase transition**: Contract must accurately track when Phase 1 ends and Phase 2 begins
- **Price calculation**: Must match exactly between frontend display and contract logic
- **Multiple votes per user**: Users can vote multiple times (at increasing prices)
- **Vote changes**: Users cannot change votes once cast (ETH locked in contract)
- **Contract deployment costs**: Factory pattern reduces costs, but still need to budget for ~100+ match contracts
- **Payout claiming**: 
  - Users can only claim after voting deadline has passed
  - Payout is proportional to user's **number of votes** for winning team (not ETH amount)
  - **Early voters benefit**: They can vote more times at lower prices, getting more votes and thus a larger share
  - Example: User votes 10 times early (0.01 ETH) gets 2x payout of user who votes 5 times late (0.05 ETH)
  - Users who voted multiple times: their vote count for winning team is summed
  - Users who voted for losing team receive nothing
  - Contract tracks claimed amounts to prevent double-claiming
- **Platform fee collection**: 10% fee goes to platform wallet (needs secure management)
- **Front-running protection**: Early voters get better prices (by design)
- **Supabase**: Free tier (500 MB) should be sufficient initially; can upgrade to Pro ($25/month) for 8 GB if needed
- **Supabase integration**: Can be managed through Vercel marketplace for unified billing
- **Contract upgrades**: Match contracts are immutable once deployed. Factory can deploy new versions for future matches
- **Event indexing**: Backend must reliably index all on-chain events. Consider using The Graph or similar indexing service for production
- **Transaction confirmation**: API endpoints should wait for transaction confirmation before indexing (or use event listeners)
- **Reorgs**: Handle blockchain reorganizations - may need to re-index events
- **Missed events**: Event indexer should handle missed blocks and catch up
- **Gas optimization**: Match creation and voting should be gas-efficient since they happen frequently
- **Country codes**: Use ISO 3166-1 alpha-2 format (2-letter codes like "US", "BR", "FR") stored as bytes2 in contracts for gas efficiency
- **Country code validation**: Consider adding validation in contracts to ensure valid country codes
- **Country metadata**: Country names, flags, etc. can be stored off-chain or in a separate on-chain registry
- **Farcaster Mini App Requirements**: 
  - **Manifest**: Must be accessible at `/.well-known/farcaster.json`
  - **Signed Domain**: Manifest must include signed `accountAssociation` (use Farcaster tool)
  - **Embed Metadata**: Use `fc:miniapp` meta tag (NOT `fc:frame` - that's legacy)
  - **SDK Initialization**: Must call `sdk.actions.ready()` after app loads
  - **Version**: Use `"version": "1"` in manifest and metadata (NOT `"next"`)
  - **Images**: OG images must be 3:2 aspect ratio, icons 200x200px
  - **Button Title**: Max 32 characters
  - **Dual Context**: App must work in both desktop browsers and Farcaster clients
  - **Wallet Support**: Desktop uses MetaMask/WalletConnect, Farcaster uses embedded wallets via SDK
  - **Testing**: Use preview tool at `https://farcaster.xyz/~/developers/mini-apps/preview`
  - **Important**: Do NOT mix Frame and Mini App terminology - this is a Mini App, not a Frame
- **Base network**: All contracts and transactions use Base network (L2 for lower gas costs)
- **Multi-platform**: App should work seamlessly in both web browsers and Farcaster clients

## Farcaster Mini App Verification Checklist

Before deployment, verify:

1. **Manifest Configuration:**
   - [ ] Manifest accessible at `https://{domain}/.well-known/farcaster.json`
   - [ ] Returns HTTP 200 with valid JSON
   - [ ] Contains `accountAssociation` object (signed)
   - [ ] Contains `frame` object with `version: "1"` (not "next")
   - [ ] Domain in signed payload matches hosting domain exactly

2. **Embed Metadata:**
   - [ ] `fc:miniapp` meta tag present on root URL
   - [ ] `fc:miniapp` meta tag present on all shareable pages
   - [ ] Valid JSON in meta tag content
   - [ ] Image URL returns 200 and is 3:2 aspect ratio
   - [ ] Button title ≤ 32 characters
   - [ ] Splash image is 200x200px

3. **App Initialization:**
   - [ ] App calls `sdk.actions.ready()` after initialization
   - [ ] No infinite splash screen
   - [ ] Works in desktop browser
   - [ ] Works in Farcaster preview tool
   - [ ] Works in Farcaster clients (Warpcast, etc.)

4. **Testing:**
   - [ ] Test in preview: `https://farcaster.xyz/~/developers/mini-apps/preview?url={url}`
   - [ ] Share link in Farcaster client
   - [ ] Verify embed preview appears
   - [ ] Confirm app launches on click
   - [ ] Check browser console for SDK errors
   - [ ] Verify no CORS issues
   - [ ] Ensure all assets load (splash image, icon)

5. **Wallet Integration:**
   - [ ] Desktop: MetaMask/WalletConnect works
   - [ ] Farcaster: Embedded wallets work via SDK
   - [ ] Base network supported in all wallet types
   - [ ] Transactions execute successfully in both contexts
