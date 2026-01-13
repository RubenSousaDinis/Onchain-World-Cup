# Phase 3: Smart Contract Development

## Overview
Develop and deploy the smart contracts for the Crypto World Cup betting system, including match registry, factory, and individual match contracts with 2-phase pricing.

## Sub-tasks

### 3.1 Set Up Smart Contract Development Environment
- [ ] Install Hardhat or Foundry
- [ ] Configure Solidity compiler version
- [ ] Set up project structure for contracts
- [ ] Install OpenZeppelin contracts (if needed)
- [ ] Configure Base network for deployment

### 3.2 Develop MatchRegistry Contract
File: `contracts/MatchRegistry.sol`

#### Core Functionality
- [ ] Create contract structure with state variables
- [ ] Implement `registerMatch()` function
  - Parameters: `matchId`, `teamACode` (bytes2), `teamBCode` (bytes2), `matchDate`, `phase`, `matchContract`, `votingStart`, `votingDeadline`
  - Store match data on-chain
  - Map match IDs to contract addresses
- [ ] Implement `getMatch()` function to retrieve match data
- [ ] Implement `getMatchContract()` function to get contract address
- [ ] Define `MatchCreated` event with all match details including country codes
- [ ] Add access control (only factory can register matches)

#### Optional Enhancements
- [ ] Store country metadata on-chain (name, flag URL)
- [ ] Add match status tracking
- [ ] Implement getter functions for batch queries

### 3.3 Develop MatchFactory Contract
File: `contracts/MatchFactory.sol`

#### Core Functionality
- [ ] Create factory contract structure
- [ ] Implement `createMatch()` function
  - Parameters: `teamACode` (bytes2), `teamBCode` (bytes2), `matchDate`, `phase`
  - Deploy new MatchContract instance
  - Call MatchRegistry to register the match
  - Return match ID and contract address
- [ ] Emit `MatchCreated` event with country codes
- [ ] Store deployed contract addresses
- [ ] Track match ID counter
- [ ] Add access control (only authorized addresses can create matches)

#### Additional Features
- [ ] Implement batch match creation for efficiency
- [ ] Add match validation logic
- [ ] Implement match template versioning

### 3.4 Develop Match Contract
File: `contracts/MatchContract.sol`

This is the core voting contract with 2-phase pricing.

#### State Variables
- [ ] Define team A and team B country codes (bytes2)
- [ ] Track voting start and deadline timestamps
- [ ] Store phase 1 end timestamp (start + 2 hours)
- [ ] Track total votes per team
- [ ] Track phase 1 vote count and end price
- [ ] Map user addresses to vote counts per team
- [ ] Map user addresses to ETH amounts per team
- [ ] Track claimed payouts per user
- [ ] Store platform fee percentage (10%)

#### Voting Functions
- [ ] Implement `vote(uint8 team)` payable function
  - Accept team index (0 = teamA, 1 = teamB)
  - Calculate current price based on phase
  - Require exact payment amount
  - Update vote counts and totals
  - Emit `VoteCast` event with country code
  - Enforce voting deadline
- [ ] Implement `getCurrentPrice()` view function
  - Determine current phase
  - Calculate price using phase-specific formula
- [ ] Implement `getCurrentPhase()` view function
  - Returns 1 or 2 based on current time

#### Pricing Logic
- [ ] Implement Phase 1 pricing (linear)
  - Formula: `0.001 + (voteCount × 0.0001)`
  - Track votes during first 2 hours
  - Store phase 1 end price
- [ ] Implement Phase 2 pricing (exponential)
  - Formula: `phase1EndPrice × (1.1 ^ phase2VoteCount)`
  - Calculate phase 2 vote count
  - Apply exponential multiplier

#### Getter Functions
- [ ] `getVoteCount()` - total number of votes
- [ ] `getPhase1VoteCount()` - votes in phase 1
- [ ] `getTotalVotes(uint8 team)` - total ETH for team
- [ ] `getTeamACode()` - bytes2 country code for team A
- [ ] `getTeamBCode()` - bytes2 country code for team B
- [ ] `getUserVoteCount(address, uint8 team)` - user's vote count
- [ ] `getUserVoteAmount(address, uint8 team)` - user's total ETH
- [ ] `getTotalVoteCount(uint8 team)` - total votes for team
- [ ] `getWinner()` - winning team after deadline
- [ ] `getWinnerCode()` - winning team's country code
- [ ] `canClaim(address)` - whether user can claim payout
- [ ] `getClaimableAmount(address)` - user's claimable amount

#### Payout Functions
- [ ] Implement `claimPayout()` function
  - Check voting deadline has passed
  - Determine winning team (most ETH)
  - Verify user voted for winner
  - Calculate user's share: `(userVoteCount / totalVoteCount) × winnerPool`
  - Winner pool is 90% of total pool
  - Transfer payout to user
  - Track claimed amounts to prevent double-claiming
  - Emit `PayoutClaimed` event
- [ ] Implement platform fee withdrawal function
  - Only callable by platform address
  - Transfers 10% fee

#### Events
- [ ] Define `VoteCast` event
  - Parameters: voter, countryCode (bytes2), amount, price, phase, voteCount
- [ ] Define `PayoutClaimed` event
  - Parameters: claimer, amount

### 3.5 Create Contract Interfaces
- [ ] Create `contracts/interfaces/IMatchContract.sol`
- [ ] Create `contracts/interfaces/IMatchRegistry.sol`
- [ ] Define all external functions in interfaces

### 3.6 Write Contract Tests
Use Hardhat or Foundry for testing.

#### MatchContract Tests (`test/MatchContract.test.ts`)
- [ ] Test vote function with correct payment
- [ ] Test Phase 1 linear pricing calculation
- [ ] Test Phase 2 exponential pricing calculation
- [ ] Test phase transition at 2 hours
- [ ] Test voting deadline enforcement
- [ ] Test multiple votes from same user
- [ ] Test vote count tracking per user per team
- [ ] Test winner determination
- [ ] Test payout calculation (based on vote count)
- [ ] Test claim payout function
- [ ] Test prevent double-claiming
- [ ] Test only winners can claim
- [ ] Test platform fee collection
- [ ] Test insufficient payment rejection
- [ ] Test voting after deadline rejection

#### MatchFactory Tests (`test/MatchFactory.test.ts`)
- [ ] Test match creation
- [ ] Test match registration in registry
- [ ] Test event emission
- [ ] Test access control
- [ ] Test multiple match creation
- [ ] Test country code storage

#### Integration Tests
- [ ] Test full flow: create match → vote → claim payout
- [ ] Test early voter advantage
- [ ] Test complete match lifecycle

### 3.7 Deploy Contracts
- [ ] Configure deployment scripts (`scripts/deploy.ts`)
- [ ] Deploy to Base testnet (Sepolia or Goerli)
- [ ] Deploy MatchRegistry first
- [ ] Deploy MatchFactory with registry address
- [ ] Verify contracts on Base block explorer
- [ ] Save deployed contract addresses
- [ ] Update `.env` with contract addresses

### 3.8 Generate TypeScript Types
- [ ] Install TypeChain
- [ ] Generate TypeScript types from contract ABIs
- [ ] Export types for frontend use
- [ ] Create contract interaction helpers

### 3.9 Create Match Creation Script
File: `scripts/createMatches.ts`

- [ ] Script to create matches via factory
- [ ] Accept match parameters (teams, date, phase)
- [ ] Call factory's `createMatch()` function
- [ ] Log created match details and contract address

## Acceptance Criteria
- [ ] All three contracts (Registry, Factory, Match) are implemented
- [ ] 2-phase pricing works correctly (linear then exponential)
- [ ] Voting, payout claiming, and fee collection all function
- [ ] All tests pass with >90% coverage
- [ ] Contracts deployed to Base testnet
- [ ] Contract addresses saved and documented
- [ ] TypeScript types generated
- [ ] Events are properly emitted for indexing

## Dependencies
- Phase 1 (for environment setup)

## Estimated Complexity
High - Core smart contract logic with complex pricing and payout calculations

## Security Considerations
- [ ] Reentrancy protection on payout claims
- [ ] Integer overflow protection (use Solidity 0.8+)
- [ ] Access control on critical functions
- [ ] Proper validation of country codes
- [ ] Front-running considerations (pricing favors early voters by design)
- [ ] Gas optimization for frequently called functions

## Notes
- Country codes use ISO 3166-1 alpha-2 format stored as bytes2
- Payout is based on **vote count**, not ETH amount (early voter advantage)
- Phase 1: First 2 hours, linear pricing
- Phase 2: Hours 2-24, exponential pricing
- Platform fee: 10% of total pool
- Winner pool: 90% distributed to winners proportionally
