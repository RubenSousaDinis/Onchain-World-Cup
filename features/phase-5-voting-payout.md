# Phase 5: Voting Interface & Payout System

## Overview
Build the core voting interface with real-time price updates, phase indicators, and comprehensive payout claiming system. This is the primary user interaction layer for the betting application.

## Sub-tasks

### 5.1 Create Voting UI Component
File: `components/VotingInterface.tsx`

#### Core Voting Features
- [ ] Display match information (teams, date, phase)
- [ ] Show current vote price from contract
- [ ] Display which phase is active (Phase 1 or Phase 2)
- [ ] Show phase-specific pricing details
- [ ] Display total ETH voted per team
- [ ] Show voting deadline with countdown
- [ ] Display time remaining in current phase

#### Voting Controls
- [ ] Team selection (Team A or Team B)
- [ ] Display exact ETH cost for vote
- [ ] Vote button with current price
- [ ] Wallet connection check
- [ ] Network validation (must be on Base)
- [ ] Disable voting after deadline
- [ ] Show user's previous votes on this match

#### Transaction Flow
- [ ] Connect wallet if not connected
- [ ] Request transaction approval
- [ ] Display transaction pending state
- [ ] Show transaction hash
- [ ] Wait for confirmation
- [ ] Submit tx hash to indexer API
- [ ] Display success/error messages
- [ ] Update UI after vote

### 5.2 Create Price Display Component
File: `components/PriceDisplay.tsx`

- [ ] Display current vote price in ETH
- [ ] Show price in USD (optional, with exchange rate)
- [ ] Indicate which pricing formula is active
- [ ] Show next price after vote
- [ ] Display price history chart (optional)
- [ ] Real-time price updates

### 5.3 Create Phase Indicator Component
File: `components/PhaseIndicator.tsx`

- [ ] Display current phase (1 or 2)
- [ ] Show phase description:
  - "Phase 1: Linear Pricing"
  - "Phase 2: Exponential Pricing"
- [ ] Display phase timeline
- [ ] Show time until next phase (if in Phase 1)
- [ ] Show time remaining in voting (if in Phase 2)
- [ ] Visual indicator (progress bar or timeline)

### 5.4 Real-Time Price Updates
File: `lib/priceUpdater.ts`

- [ ] Poll contract for current price
- [ ] Update price on each vote (listen to events)
- [ ] Subscribe to VoteCast events via websocket
- [ ] Update UI when new votes occur
- [ ] Handle multiple simultaneous updates
- [ ] Debounce updates to prevent UI flicker

### 5.5 Create Vote Button Component
File: `components/VoteButton.tsx`

- [ ] Display team name and flag
- [ ] Show current price for vote
- [ ] Handle click to initiate vote
- [ ] Disabled states:
  - Before voting starts
  - After voting deadline
  - Wallet not connected
  - Insufficient balance
  - Wrong network
- [ ] Loading state during transaction
- [ ] Success/error feedback

### 5.6 Implement Payout Claiming System

#### Payout Claim Component
File: `components/PayoutClaim.tsx`

- [ ] Check if voting deadline has passed
- [ ] Determine match winner (team with most ETH)
- [ ] Check if user voted for winning team
- [ ] Display claimable status
- [ ] Show user's vote count for winning team
- [ ] Show total votes for winning team
- [ ] Calculate and display user's share:
  - Formula: `(userVoteCount / totalVoteCount) × winnerPool`
- [ ] Show user's ETH contribution (for reference)
- [ ] Display claim button
- [ ] Handle claim transaction
- [ ] Show claimed status if already claimed

#### Claim Transaction Flow
- [ ] Validate user can claim
- [ ] Call contract's `claimPayout()` function
- [ ] Display transaction pending state
- [ ] Wait for confirmation
- [ ] Update claimed status
- [ ] Display success message with amount
- [ ] Handle errors (already claimed, not winner, etc.)

#### Claimable Amount Display
- [ ] Show exact ETH amount user can claim
- [ ] Break down calculation:
  - Your votes: X
  - Total votes for winner: Y
  - Your share: (X/Y) × 90% of pool
  - Amount: Z ETH
- [ ] Show USD value (optional)
- [ ] Highlight early voter advantage

### 5.7 Create User Dashboard
File: `app/dashboard/page.tsx`

#### Active Votes Section
- [ ] List all matches user has voted on
- [ ] Show match details and status
- [ ] Display user's vote count per team
- [ ] Show user's ETH contribution per team
- [ ] Indicate match status (active, completed)
- [ ] Link to match page

#### Vote History Section
- [ ] List all user's votes across all matches
- [ ] Show: Match, Team, ETH amount, Price, Phase, Timestamp
- [ ] Filter by match or team
- [ ] Sort by date or amount
- [ ] Pagination for many votes

#### Claimable Payouts Section
- [ ] List matches where user can claim
- [ ] Show claimable amount per match
- [ ] Display claim buttons
- [ ] Track claim status
- [ ] Show total claimable across all matches

#### Statistics Section
- [ ] Total ETH wagered
- [ ] Total votes cast
- [ ] Number of matches participated in
- [ ] Total ETH won
- [ ] Total ETH lost
- [ ] Win rate
- [ ] Best win (highest payout)

### 5.8 Create Vote History Component
File: `components/VoteHistory.tsx`

- [ ] Table with vote details
- [ ] Columns: Match, Team, Amount, Price, Phase, Time
- [ ] Filter controls
- [ ] Sort controls
- [ ] Export to CSV (optional)

### 5.9 Create Payout History Component
File: `components/PayoutHistory.tsx`

- [ ] List all claimed payouts
- [ ] Show: Match, Amount claimed, Vote count, Claim date
- [ ] Display total claimed
- [ ] Show unclaimed payouts
- [ ] Link to claim interface

### 5.10 Create Admin Tools
File: `app/admin/page.tsx`

Protected admin interface for managing matches.

#### Manual Match Finalization
- [ ] List all completed matches
- [ ] Show winner for each match
- [ ] Option to manually trigger finalization if needed
- [ ] Update match status

#### Emergency Controls
- [ ] Contract pause functionality (if implemented)
- [ ] Emergency withdrawal (if needed)
- [ ] Access restricted to admin addresses

#### Platform Fee Withdrawal
- [ ] Display total platform fees collected
- [ ] Show fees per match
- [ ] Withdraw button to claim platform fees
- [ ] Transaction confirmation

### 5.11 Real-Time Updates
File: `lib/realtime.ts`

Implement real-time updates for voting interface.

#### WebSocket/Polling
- [ ] Subscribe to vote events
- [ ] Update price when new votes occur
- [ ] Update total ETH per team
- [ ] Update vote count
- [ ] Update phase if transition occurs

#### Supabase Real-Time (Optional)
- [ ] Use Supabase real-time subscriptions
- [ ] Subscribe to votes table
- [ ] Update UI on new vote records
- [ ] Subscribe to matches table for status updates

### 5.12 Vote Validation
File: `lib/voteValidation.ts`

- [ ] Validate voting is allowed:
  - Voting period is active
  - Before deadline
  - User has sufficient balance
  - On correct network
- [ ] Validate price matches contract
- [ ] Prevent front-running issues
- [ ] Handle race conditions

### 5.13 Pricing Calculation Utilities
File: `utils/pricingCalculation.ts`

Match contract logic exactly:

#### Phase 1 Calculation
- [ ] Implement linear pricing formula
- [ ] `price = 0.001 + (voteCount × 0.0001)`
- [ ] Calculate for display purposes

#### Phase 2 Calculation
- [ ] Implement exponential pricing formula
- [ ] `price = phase1EndPrice × (1.1 ^ phase2VoteCount)`
- [ ] Handle large numbers (exponentials)
- [ ] Match contract calculation exactly

#### Price Prediction
- [ ] Show what price will be after current vote
- [ ] Display price progression chart
- [ ] Estimate future prices

### 5.14 Testing
- [ ] Test voting flow end-to-end
- [ ] Test price calculations match contract
- [ ] Test phase transitions
- [ ] Test real-time updates
- [ ] Test payout calculations
- [ ] Test claim functionality
- [ ] Test with multiple users
- [ ] Test edge cases (deadline, phase boundary)
- [ ] Test dashboard displays
- [ ] Test admin tools

## Acceptance Criteria
- [ ] Users can vote on matches with ETH
- [ ] Current price is displayed accurately
- [ ] Phase indicator shows correct phase
- [ ] Real-time updates work
- [ ] Payout claiming is functional
- [ ] Dashboard shows user's activity
- [ ] Admin tools are functional
- [ ] All transactions are confirmed and indexed
- [ ] UI is responsive and user-friendly

## Dependencies
- Phase 1 (database)
- Phase 3 (smart contracts with voting and payout)
- Phase 4 (blockchain integration and wallet)

## Estimated Complexity
High - Core user interaction with complex state management

## Key Features
- **2-Phase Pricing**: Linear then exponential
- **Real-Time Updates**: Price and votes update live
- **Vote Count Based Payout**: Early voters get more votes, larger share
- **Transparent Calculations**: Users see exactly how payout is calculated
- **Comprehensive Dashboard**: All user activity in one place

## Important Notes
- Price must match contract exactly (use same formulas)
- Payout based on **vote count**, not ETH amount
- Early voters benefit (more votes at lower prices)
- Display vote count prominently in claim interface
- Real-time updates enhance user experience
- Handle concurrent votes gracefully
- Ensure transaction confirmations before updating UI
- Platform fee (10%) is separate from user payouts
