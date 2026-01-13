# Phase 3: Smart Contract Development

## Overview
Develop and deploy the smart contracts for the Onchain World Cup **two-phase system** on the Base network:

**Phase 1 - Qualification Contract** (Priority):
- Fixed-price support voting (0.001 ETH per vote)
- Time-based fee schedule (0% → 10%)
- Rankings-based, top 48 countries qualify
- Proportional prize distribution

**Phase 2 - Tournament Match Contracts**:
- Match registry and factory pattern
- Individual match contracts with 2-phase dynamic pricing (linear → exponential)
- Vote count-based payouts

**Critical**: These are TWO SEPARATE contract systems with different mechanics. Qualification contract should be deployed FIRST as it's needed for the MVP.

## Sub-tasks

### 3.1 Set Up Smart Contract Development Environment
- [ ] Install Hardhat or Foundry
- [ ] Configure Solidity compiler version
- [ ] Set up project structure for contracts
- [ ] Install OpenZeppelin contracts (if needed)
- [ ] Configure Base network for deployment

---

## **QUALIFICATION CONTRACT** (Deploy First - MVP Priority)

### 3.2 Develop QualificationContract
File: `contracts/QualificationContract.sol`

**This contract handles the qualification phase with fixed-price support voting.**

#### State Variables
- [ ] Define `VOTE_PRICE` constant (0.001 ETH, immutable)
- [ ] Store `qualificationDeadline` (timestamp when voting ends)
- [ ] Store `platformAddress` (for fee collection)
- [ ] Map `countryVotes`: `bytes2 → uint256` (vote count per country)
- [ ] Map `countryETH`: `bytes2 → uint256` (total ETH after fees per country)
- [ ] Map `userVotes`: `address → bytes2 → uint256` (user's votes per country)
- [ ] Map `userETH`: `address → bytes2 → uint256` (user's ETH per country)
- [ ] Store `totalPrizePool` (sum of all ETH after fees)
- [ ] Store `qualifiedCountries`: `bytes2[48]` (top 48 countries, set at snapshot)
- [ ] Track `snapshotTaken` boolean
- [ ] Store fee schedule (time-based: Week 0=0%, Week 1=2%, Week 2=4%, etc.)

#### Voting Functions
- [ ] Implement `vote(bytes2 countryCode)` payable function
  - Require `msg.value == VOTE_PRICE` (exactly 0.001 ETH)
  - Require `block.timestamp < qualificationDeadline`
  - Calculate current fee percentage based on time
  - Calculate fee amount: `feeAmount = (msg.value × feePercent) / 100`
  - Calculate prize pool amount: `prizePoolAmount = msg.value - feeAmount`
  - Update `countryVotes[countryCode] += 1`
  - Update `countryETH[countryCode] += prizePoolAmount`
  - Update `userVotes[msg.sender][countryCode] += 1`
  - Update `userETH[msg.sender][countryCode] += prizePoolAmount`
  - Update `totalPrizePool += prizePoolAmount`
  - Emit `VoteCast` event
- [ ] Implement `getCurrentFee()` view function
  - Calculate fee percentage based on time elapsed
  - Returns current fee percentage (0-10%)

#### Admin Functions
- [ ] Implement `snapshotQualification()` function
  - Only callable after `qualificationDeadline`
  - Only callable once
  - Calculate top 48 countries by `countryETH`
  - Store in `qualifiedCountries` array
  - Set `snapshotTaken = true`
  - Emit `QualificationSnapshot` event with top 48
- [ ] Implement `withdrawPlatformFees()` function
  - Only callable by platform address
  - Transfer collected fees to platform

#### Payout Functions
- [ ] Implement `calculateUserReward(address user)` view function
  - Require `snapshotTaken == true`
  - Sum user's ETH on qualified countries only
  - Calculate `userQualifiedETH / totalQualifiedETH × totalPrizePool`
  - Returns claimable amount
- [ ] Implement `claimReward()` function
  - Require `snapshotTaken == true`
  - Calculate user's reward
  - Require reward > 0
  - Track claimed amounts to prevent double-claiming
  - Transfer reward to user
  - Emit `RewardClaimed` event

#### Getter Functions
- [ ] `getCountryVotes(bytes2 country)` - vote count for country
- [ ] `getCountryETH(bytes2 country)` - total ETH for country
- [ ] `getUserVotes(address user, bytes2 country)` - user's votes for country
- [ ] `getUserETH(address user, bytes2 country)` - user's ETH for country
- [ ] `getQualifiedCountries()` - returns top 48 countries array
- [ ] `isQualified(bytes2 country)` - check if country is in top 48
- [ ] `getAllCountryStandings()` - return all countries sorted by ETH

#### Events
- [ ] Define `VoteCast` event
  - Parameters: `voter`, `countryCode` (bytes2), `amount`, `feePercent`, `timestamp`
- [ ] Define `QualificationSnapshot` event
  - Parameters: `qualifiedCountries` (bytes2[48]), `timestamp`
- [ ] Define `RewardClaimed` event
  - Parameters: `claimer`, `amount`

---

## **TOURNAMENT CONTRACTS** (Deploy After Qualification)

### 3.3 Develop MatchRegistry Contract
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

### 3.4 Develop MatchFactory Contract
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

### 3.5 Develop TournamentMatchContract
File: `contracts/TournamentMatchContract.sol`

**This is for Tournament phase only** - match-based betting with 2-phase dynamic pricing.

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

### 3.6 Create Contract Interfaces
- [ ] Create `contracts/interfaces/IQualificationContract.sol`
- [ ] Create `contracts/interfaces/ITournamentMatchContract.sol`
- [ ] Create `contracts/interfaces/IMatchRegistry.sol`
- [ ] Define all external functions in interfaces

### 3.7 Write Contract Tests
Use Hardhat or Foundry for testing.

#### QualificationContract Tests (`test/QualificationContract.test.ts`)
- [ ] Test vote function with exact payment (0.001 ETH)
- [ ] Test vote function rejects incorrect payment amounts
- [ ] Test time-based fee calculation (0%, 2%, 4%, etc.)
- [ ] Test fee deduction and prize pool accumulation
- [ ] Test multiple votes from same user for same country
- [ ] Test votes for different countries
- [ ] Test voting after deadline (should fail)
- [ ] Test snapshot function (top 48 selection)
- [ ] Test snapshot can only be called once
- [ ] Test snapshot can only be called after deadline
- [ ] Test reward calculation for qualified country supporters
- [ ] Test reward calculation excludes non-qualified countries
- [ ] Test proportional reward distribution
- [ ] Test claim reward function
- [ ] Test prevent double-claiming rewards
- [ ] Test platform fee withdrawal
- [ ] Test getter functions for standings
- [ ] Test edge case: tie in ETH amount for 48th place

#### TournamentMatchContract Tests (`test/TournamentMatchContract.test.ts`)
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

### 3.8 Deploy Contracts

**Deployment Strategy**: Deploy Qualification contract FIRST for MVP, Tournament contracts later.

#### Qualification Contract Deployment (Priority 1)
- [ ] Configure deployment script (`scripts/deployQualification.ts`)
- [ ] Deploy QualificationContract to Base testnet
- [ ] Set qualification deadline (e.g., 6-8 weeks from deployment)
- [ ] Verify contract on Base block explorer
- [ ] Save deployed contract address
- [ ] Update `.env` with `QUALIFICATION_CONTRACT_ADDRESS`
- [ ] Test voting on testnet
- [ ] Deploy to Base mainnet when ready

#### Tournament Contracts Deployment (Priority 2)
- [ ] Configure deployment script (`scripts/deployTournament.ts`)
- [ ] Deploy to Base testnet (after qualification tested)
- [ ] Deploy MatchRegistry first
- [ ] Deploy MatchFactory with registry address
- [ ] Verify contracts on Base block explorer
- [ ] Save deployed contract addresses
- [ ] Update `.env` with tournament contract addresses
- [ ] Deploy to Base mainnet after qualification ends

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

### Qualification Contract (Priority 1)
- [ ] QualificationContract is implemented with fixed-price voting
- [ ] Time-based fee schedule works correctly (0%-10%)
- [ ] Snapshot function correctly selects top 48 countries
- [ ] Proportional reward calculation works
- [ ] All qualification tests pass with >90% coverage
- [ ] Deployed to Base testnet and mainnet
- [ ] Contract address saved and documented
- [ ] TypeScript types generated
- [ ] Events properly emitted for indexing

### Tournament Contracts (Priority 2)
- [ ] All three tournament contracts (Registry, Factory, TournamentMatch) are implemented
- [ ] 2-phase dynamic pricing works correctly (linear → exponential)
- [ ] Vote count-based payouts work correctly
- [ ] All tournament tests pass with >90% coverage
- [ ] Contracts deployed to Base testnet
- [ ] Contract addresses saved and documented
- [ ] TypeScript types generated for all contracts

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

### Two-Phase System Architecture
- **Phase 1 - Qualification**: Fixed-price support voting, NO matches, rankings-based
- **Phase 2 - Tournament**: Match-based betting with dynamic pricing

### Qualification Contract Notes
- Fixed price: 0.001 ETH per vote (immutable)
- Time-based fees: Week 0=0%, Week 1=2%, Week 2=4%, ..., Week 5+=10%
- Fees excluded from prize pool (collected by platform)
- Top 48 countries qualify based on total ETH (after fees)
- Rewards proportional to ETH contributed to qualified countries only
- Economic cost acts as Sybil resistance
- Snapshot can only be taken once, after deadline

### Tournament Contract Notes
- Country codes use ISO 3166-1 alpha-2 format stored as bytes2
- Payout based on **vote count**, not ETH amount (early voter advantage)
- Match Phase 1: First 2 hours, linear pricing (0.001 + count × 0.0001)
- Match Phase 2: Hours 2-24, exponential pricing (phase1Price × 1.1^count)
- Platform fee: 10% of total pool per match
- Winner pool: 90% distributed to winners proportionally by vote count

### Deployment Strategy
- Deploy QualificationContract FIRST (MVP priority)
- Test qualification phase thoroughly before launching
- Deploy Tournament contracts AFTER qualification ends
- This allows staged rollout and reduces initial complexity

### References
- See `/docs/contracts/QUALIFICATION_CONTRACT_SPEC.md` for complete qualification specs
- See `/docs/contracts/TOURNAMENT_CONTRACT_SPEC.md` for complete tournament specs
- See `/docs/ROADMAP.md` for overall system architecture
