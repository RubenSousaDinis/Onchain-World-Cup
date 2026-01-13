# Phase 4: Blockchain Integration & Event Indexing

## Overview
Integrate blockchain interactions with the frontend, set up wallet connections for both desktop and Farcaster contexts, and create an event indexer to sync on-chain data to the database.

## Sub-tasks

### 4.1 Set Up Base Network Configuration
File: `lib/blockchain.ts`

- [ ] Install wagmi and viem libraries
- [ ] Configure Base network (mainnet and testnet)
- [ ] Set up RPC providers
- [ ] Create network configuration
- [ ] Export Base chain config for app

### 4.2 Configure Wallet Connection - Desktop Context
File: `components/WalletConnect.tsx`

#### Desktop Wallet Support
- [ ] Install and configure WalletConnect
- [ ] Set up MetaMask connector
- [ ] Set up WalletConnect connector
- [ ] Create wallet connection UI component
- [ ] Handle wallet connection state
- [ ] Display connected address
- [ ] Add disconnect functionality
- [ ] Handle network switching to Base
- [ ] Handle connection errors

### 4.3 Configure Wallet Connection - Farcaster Context
File: `components/FarcasterProvider.tsx`

#### Farcaster Wallet Support
- [ ] Install `@farcaster/miniapp-sdk`
- [ ] Create Farcaster context provider
- [ ] Implement context detection (desktop vs Farcaster)
- [ ] Integrate Farcaster embedded wallets
- [ ] Handle Farcaster wallet connection
- [ ] Support Base network in Farcaster wallets
- [ ] Create fallback for unsupported wallets

#### Context Detection
File: `components/FarcasterDetector.tsx`

- [ ] Detect if app is running in Farcaster client
- [ ] Detect if app is running in desktop browser
- [ ] Create context state management
- [ ] Export context for conditional rendering

### 4.4 Create Unified Wallet Interface
File: `lib/wallet.ts`

- [ ] Create abstraction layer for wallet operations
- [ ] Support both desktop and Farcaster wallets
- [ ] Unified API for connecting/disconnecting
- [ ] Unified API for getting address
- [ ] Unified API for signing transactions
- [ ] Handle wallet switching between contexts

### 4.5 Create Contract Interaction Utilities
File: `lib/contracts.ts`

#### Read Functions
- [ ] Get current vote price from match contract
- [ ] Get match state (votes, deadline, phase)
- [ ] Get user's vote status per match
- [ ] Get user's vote count per team
- [ ] Get user's ETH amount per team
- [ ] Get match winner
- [ ] Get claimable amount for user
- [ ] Get total votes per team

#### Write Functions
- [ ] Submit vote transaction
  - Accept match address, team, ETH amount
  - Call contract's `vote()` function
  - Return transaction hash
- [ ] Create match transaction
  - Call factory's `createMatch()` function
  - Return transaction hash
- [ ] Claim payout transaction
  - Call contract's `claimPayout()` function
  - Return transaction hash

#### Helper Functions
- [ ] Load contract ABIs
- [ ] Create contract instances
- [ ] Handle transaction confirmations
- [ ] Parse contract events
- [ ] Convert country codes (string ↔ bytes2)

### 4.6 Create Event Indexer Service
File: `lib/indexer.ts`

This service listens to blockchain events and syncs them to the database.

#### Core Indexer Setup
- [ ] Create event listener service
- [ ] Configure Base network provider for events
- [ ] Set up block range polling
- [ ] Implement graceful shutdown handling

#### Listen to MatchCreated Events
- [ ] Listen to MatchRegistry/Factory events
- [ ] Parse event data:
  - Match ID
  - Team A and Team B country codes
  - Match date
  - Contract address
  - Voting start and deadline
- [ ] Create match record in database
- [ ] Store creation transaction hash
- [ ] Mark event as indexed

#### Listen to VoteCast Events
- [ ] Listen to Match contract events
- [ ] Parse event data:
  - Voter address
  - Country code voted for
  - Amount paid
  - Price at time
  - Phase
  - Vote count
  - Transaction hash
  - Block number and timestamp
- [ ] Create vote record in database
- [ ] Update match statistics
- [ ] Mark event as indexed

#### Listen to PayoutClaimed Events
- [ ] Listen to Match contract events
- [ ] Parse event data:
  - Claimer address
  - Amount claimed
  - Transaction hash
- [ ] Update user's claim status
- [ ] Mark event as indexed

#### Indexer Features
- [ ] Handle blockchain reorganizations (reorgs)
- [ ] Handle missed blocks (catch-up logic)
- [ ] Track last indexed block
- [ ] Prevent duplicate event processing
- [ ] Use `indexed_transactions` table to track processed events
- [ ] Implement retry logic for failed indexing
- [ ] Add logging for all indexed events

#### Run Indexer
- [ ] Can run as background job
- [ ] Can run as Next.js API route
- [ ] Add start/stop controls
- [ ] Add health check endpoint

### 4.7 Create Transaction Processor
File: `lib/txProcessor.ts`

This processes individual transaction hashes submitted by users.

#### Process Match Creation Transaction
- [ ] Accept transaction hash
- [ ] Wait for transaction confirmation
- [ ] Query MatchRegistry for match data
- [ ] Extract match details from event logs
- [ ] Create match record in database
- [ ] Return match data

#### Process Vote Transaction
- [ ] Accept transaction hash and optional match ID
- [ ] Wait for transaction confirmation
- [ ] Query Match contract for vote data
- [ ] Extract vote details from event logs
- [ ] Create vote record in database
- [ ] Update match statistics
- [ ] Return vote data

### 4.8 Create API Endpoints

#### Match Indexing
File: `app/api/matches/index/route.ts`

- [ ] POST endpoint to receive match creation tx hash
- [ ] Body: `{ txHash: "0x...", matchId?: number }`
- [ ] Process transaction using txProcessor
- [ ] Query chain for match data
- [ ] Create match record in database
- [ ] Return match details

#### Vote Indexing
File: `app/api/votes/index/route.ts`

- [ ] POST endpoint to receive vote tx hash
- [ ] Body: `{ txHash: "0x...", matchId?: number }`
- [ ] Process transaction using txProcessor
- [ ] Query chain for vote data
- [ ] Create vote record in database
- [ ] Return vote details

#### List Matches
File: `app/api/matches/route.ts`

- [ ] GET endpoint to list all matches
- [ ] Query database for matches
- [ ] Support filtering by status, phase, date
- [ ] Support pagination
- [ ] Return match list with basic details

#### Get Match Details
File: `app/api/matches/[id]/route.ts`

- [ ] GET endpoint for specific match
- [ ] Query database for match
- [ ] Query on-chain for current state (votes, price, phase)
- [ ] Combine database and on-chain data
- [ ] Return comprehensive match details

#### Get Voting Statistics
File: `app/api/matches/[id]/votes/route.ts`

- [ ] GET endpoint for match voting stats
- [ ] Query database for all votes on match
- [ ] Calculate statistics:
  - Total ETH per team
  - Total vote count per team
  - Number of unique voters
  - Vote distribution over time
- [ ] Return statistics

#### Get Current Vote Price
File: `app/api/matches/[id]/price/route.ts`

- [ ] GET endpoint for current price
- [ ] Query match contract's `getCurrentPrice()`
- [ ] Query current phase
- [ ] Return price and phase info

#### Get Claimable Amount
File: `app/api/matches/[id]/claimable/[address]/route.ts`

- [ ] GET endpoint for user's claimable amount
- [ ] Check if voting deadline has passed
- [ ] Determine winner
- [ ] Check if user voted for winner
- [ ] Calculate claimable amount based on vote count
- [ ] Return: vote count, total votes, calculated share

#### Claim Payout
File: `app/api/matches/[id]/claim/route.ts`

- [ ] POST endpoint to initiate claim
- [ ] Validate deadline has passed
- [ ] Validate user voted for winner
- [ ] Validate not already claimed
- [ ] Return transaction hash for claim transaction
- [ ] Frontend executes transaction

#### Manual Indexer Trigger (Optional)
File: `app/api/indexer/route.ts`

- [ ] POST endpoint to manually trigger indexer
- [ ] Run indexer for specific block range
- [ ] Return indexing results

### 4.9 Create Country Code Utilities
File: `utils/countryCodes.ts`

- [ ] Convert string country code to bytes2
- [ ] Convert bytes2 to string country code
- [ ] Validate ISO 3166-1 alpha-2 codes
- [ ] Get country name from code
- [ ] Get flag URL from code

### 4.10 Error Handling
- [ ] Handle RPC errors gracefully
- [ ] Handle transaction failures
- [ ] Handle network disconnections
- [ ] Handle wallet connection errors
- [ ] Add proper error messages for users
- [ ] Log errors for debugging

### 4.11 Testing
- [ ] Test wallet connection in desktop browser
- [ ] Test wallet connection in Farcaster context
- [ ] Test contract read functions
- [ ] Test contract write functions
- [ ] Test event indexer
- [ ] Test transaction processor
- [ ] Test all API endpoints
- [ ] Test error handling

## Acceptance Criteria
- [ ] Base network is configured
- [ ] Wallet connection works in both desktop and Farcaster contexts
- [ ] Contract interactions work (read and write)
- [ ] Event indexer successfully indexes all events
- [ ] Transaction processor handles tx hashes correctly
- [ ] All API endpoints are functional
- [ ] Database is synced with on-chain data
- [ ] Error handling is robust

## Dependencies
- Phase 1 (database setup)
- Phase 3 (smart contracts deployed)

## Estimated Complexity
High - Complex integration between blockchain, backend, and database

## Technical Considerations
- [ ] Consider using The Graph for production indexing
- [ ] Wait for transaction confirmations before indexing
- [ ] Handle blockchain reorganizations properly
- [ ] Implement retry logic for missed events
- [ ] Optimize RPC calls to reduce API costs
- [ ] Cache on-chain data when appropriate

## Notes
- Event indexer can run as background service or API route
- Transaction processor is called by frontend after transactions
- API endpoints combine database and on-chain data
- Wallet support varies by context (desktop vs Farcaster)
- Country codes converted between string and bytes2 as needed
