# Phase 7: Qualification Phase System

## Overview
Implement the qualification phase system where countries compete for support votes (NO MATCHES). This is a **rankings-based system with fixed-price voting** (0.001 ETH per vote). Users support countries directly, and the top 48 countries by total ETH qualify for the tournament.

**Critical**: There are NO matches during qualification. This is purely support-based voting with live rankings.

## Sub-tasks

### 7.1 Set Up Qualification Data
File: `lib/qualificationData.ts`

- [ ] Get list of all eligible countries (ISO 3166-1 alpha-2 codes)
- [ ] Create country reference data (names, flags, regions)
- [ ] Seed countries table in database
- [ ] Validate country codes
- [ ] Define qualification rules (top 48 qualify)

### 7.2 Implement Qualification Voting Interface
File: `app/qualification/page.tsx`

**Main qualification voting page**:
- [ ] Display all countries in grid/table layout
- [ ] Show current rankings (sorted by total ETH)
- [ ] Highlight top 48 (qualified status)
- [ ] Show for each country:
  - Country name and flag
  - Current rank
  - Total votes received
  - Total ETH (after fees)
  - Qualification status
- [ ] Fixed-price vote button (0.001 ETH)
- [ ] Display current time-based fee percentage
- [ ] Qualification deadline countdown
- [ ] Search/filter countries
- [ ] Real-time updates as votes come in

### 7.3 Create Voting Transaction Handler
File: `lib/qualificationVoting.ts`

- [ ] Connect to QualificationContract
- [ ] Implement `voteForCountry(bytes2 countryCode)` function
  - Get current price (always 0.001 ETH)
  - Get current fee percentage
  - Call contract's `vote(countryCode)` with exact value
  - Wait for transaction confirmation
  - Return transaction hash
- [ ] Handle transaction errors
- [ ] Display fee breakdown to user before voting

### 7.4 Event Indexing for Qualification Votes
File: `lib/indexer/qualificationIndexer.ts`

**This indexes qualification votes to the database**:
- [ ] Ensure event indexer is running
- [ ] Listen to `VoteCast` events from QualificationContract
- [ ] Parse event data:
  - Voter address
  - Country code
  - Amount (0.001 ETH)
  - Fee percentage
  - Block number and timestamp
  - Transaction hash
- [ ] Create record in `qualification_votes` table
- [ ] Update `qualification_standings` table:
  - Increment `total_votes` for country
  - Add to `total_eth` for country (after fees)
  - Recalculate rankings
  - Update `rank` for all countries
  - Mark top 48 as `is_qualified = true`
- [ ] Handle duplicate events (check tx_hash uniqueness)
- [ ] Emit real-time updates to frontend

### 7.5 Implement Live Standings Calculation
File: `lib/qualificationStandings.ts`

**Calculate and update rankings in real-time**:
- [ ] Query all countries from `qualification_standings` table
- [ ] Sort by `total_eth` (descending)
- [ ] Assign ranks (1-based)
- [ ] Mark top 48 as qualified (`is_qualified = true`)
- [ ] Handle ties (same ETH amount):
  - Option 1: Use vote count as tiebreaker
  - Option 2: Use timestamp of first vote
  - Option 3: Alphabetical by country code
- [ ] Update database with new rankings
- [ ] Trigger frontend updates

### 7.6 Create Qualification API Endpoints

#### Get Qualification Standings
File: `app/api/qualification/standings/route.ts`

- [ ] GET endpoint for live qualification standings
- [ ] Query `qualification_standings` table
- [ ] Order by `rank` (ascending)
- [ ] Return: country code, rank, total votes, total ETH, is_qualified
- [ ] Cache for 1 minute (live data)
- [ ] Support pagination (optional)

#### Get Country Stats
File: `app/api/qualification/countries/[code]/route.ts`

- [ ] GET endpoint for individual country stats
- [ ] Query `qualification_standings` for specific country
- [ ] Return detailed stats for that country
- [ ] Include vote history (optional)

#### Get User's Qualification Votes
File: `app/api/qualification/user/[address]/route.ts`

- [ ] GET endpoint for user's qualification votes
- [ ] Query `qualification_votes` table filtered by user address
- [ ] Group by country code
- [ ] Return: country code, vote count, total ETH contributed
- [ ] Include which countries are qualified

#### Post Qualification Vote (Indexing)
File: `app/api/qualification/vote/route.ts`

- [ ] POST endpoint to index a vote transaction
- [ ] Body: `{ txHash: "0x..." }`
- [ ] Process transaction using tx processor
- [ ] Query chain for vote data
- [ ] Create vote record in database
- [ ] Update standings
- [ ] Return vote details

#### Get Qualified Countries (Final)
File: `app/api/qualification/qualified/route.ts`

- [ ] GET endpoint for final qualified countries
- [ ] Only available after qualification ends and snapshot taken
- [ ] Query `qualified_countries` table
- [ ] Return top 48 countries with final ranks
- [ ] Cache for 1 hour (static after snapshot)

### 7.7 Build Qualification UI Components
**See Phase 2 for detailed UI component specs. This section focuses on data/logic integration.**

#### Qualification Standings Page
File: `app/qualification/page.tsx`

- [ ] Integrate with qualification API endpoints
- [ ] Display live standings from database
- [ ] Real-time updates via polling or WebSocket
- [ ] Country support cards with vote buttons
- [ ] Top 48 highlighted
- [ ] Fee percentage display
- [ ] Deadline countdown

#### User Qualification Dashboard
File: `app/qualification/my-votes/page.tsx`

- [ ] Display user's votes from `qualification_votes` table
- [ ] Group votes by country
- [ ] Show total ETH contributed per country
- [ ] Indicate which supported countries are qualified
- [ ] Calculate potential rewards
- [ ] Link to claim rewards (after snapshot)

### 7.8 Implement Snapshot Function
File: `lib/qualificationSnapshot.ts`

**Admin function to finalize top 48 after deadline**:
- [ ] Connect to QualificationContract
- [ ] Verify qualification deadline has passed
- [ ] Call contract's `snapshotQualification()` function
- [ ] Wait for transaction confirmation
- [ ] Contract determines top 48 on-chain
- [ ] Event indexer captures `QualificationSnapshot` event
- [ ] Update `qualified_countries` table with top 48
- [ ] Mark snapshot as complete in database
- [ ] Frontend shows final qualified countries
- [ ] Enable reward claiming for users

### 7.9 Implement Rewards System
File: `lib/qualificationRewards.ts`

**Calculate and allow users to claim qualification rewards**:
- [ ] Verify snapshot has been taken
- [ ] Query user's votes on qualified countries only
- [ ] Sum user's ETH on qualified countries
- [ ] Calculate proportional share of prize pool
- [ ] Display claimable amount to user
- [ ] Implement claim transaction function
  - Call contract's `claimReward()`
  - Wait for confirmation
  - Update claimed status in database
- [ ] Handle already claimed (prevent double-claim)

### 7.10 Testing
- [ ] Test voting transaction with 0.001 ETH
- [ ] Test fee calculation at different time periods
- [ ] Test standings update after each vote
- [ ] Test ranking calculation (sort by total ETH)
- [ ] Test tiebreaker scenarios (same ETH amount)
- [ ] Test qualification status (top 48 marking)
- [ ] Test real-time updates on frontend
- [ ] Test snapshot function
- [ ] Test reward calculation
- [ ] Test claim rewards function
- [ ] Test event indexing for qualification votes
- [ ] Test API endpoints
- [ ] Test UI displays correctly
- [ ] Test with multiple countries and voters

## Acceptance Criteria
- [ ] All countries are seeded in database
- [ ] Qualification voting interface is functional
- [ ] Fixed-price voting (0.001 ETH) works
- [ ] Time-based fees calculate correctly
- [ ] Votes are indexed to database in real-time
- [ ] Live standings update correctly
- [ ] Top 48 countries are highlighted
- [ ] Snapshot function works (finalizes top 48)
- [ ] Reward calculation is accurate
- [ ] Users can claim rewards after snapshot
- [ ] UI is responsive and real-time
- [ ] All tests pass

## Dependencies
- Phase 1 (database with qualification tables)
- Phase 3 (QualificationContract deployed)
- Phase 4 (event indexer and API endpoints)

## Estimated Complexity
Medium - Simpler than tournament phase (no matches, fixed pricing)

## Important Dates
- Qualification phase starts: Contract deployment
- Qualification phase duration: **6-8 weeks**
- Qualification phase ends: Contract deadline
- Snapshot must be taken after deadline

## Notes
- **NO MATCHES during qualification** - this is purely support-based voting
- Fixed price: 0.001 ETH per vote (no dynamic pricing)
- Time-based fees: 0% → 10% over qualification period
- Fees excluded from prize pool (platform revenue)
- Rankings based on total ETH (after fees), not vote count
- Top 48 countries qualify for tournament
- Tiebreaker: Use vote count, timestamp, or alphabetical
- Country codes in ISO 3166-1 alpha-2 format (bytes2)
- Snapshot can only be called once, by admin, after deadline
- Rewards distributed proportionally to supporters of qualified countries only
- Real-time standings updates enhance engagement
- See `/docs/contracts/QUALIFICATION_CONTRACT_SPEC.md` for contract details
- See `/docs/ROADMAP.md` for qualification phase overview
