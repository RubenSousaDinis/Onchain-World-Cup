# Phase 8: Main Tournament Phase

## Overview
Implement the main tournament phase starting June 11, 2026. Parse the match schedule from CSV, create matches on-chain, and build the knockout/bracket system for the World Cup finals.

## Sub-tasks

### 8.1 Parse Match Schedule CSV
File: `utils/csvParser.ts`

- [ ] Read `world_cup_2026_matches_per_day.csv`
- [ ] Parse CSV data:
  - Date
  - Number of matches per day
  - Round/stage information
- [ ] Validate CSV format
- [ ] Convert dates to proper format
- [ ] Export parsed schedule

### 8.2 Create Main Tournament Match Generator
File: `scripts/createMainTournamentMatches.ts`

#### Match Generation Logic
- [ ] Use parsed CSV schedule
- [ ] Get list of 48 qualified teams from qualifiers
- [ ] Implement tournament seeding logic
- [ ] Generate Round of 48 matchups
- [ ] Generate knockout bracket structure:
  - Round of 48 → Round of 24
  - Round of 24 → Round of 12
  - Round of 12 → Round of 6
  - Semi-finals (or appropriate for 48 teams)
  - Finals
- [ ] Convert country codes to bytes2

#### Scheduling Logic
- [ ] Distribute matches according to CSV (matches per day)
- [ ] Start from June 11, 2026
- [ ] Ensure 24-hour voting periods
- [ ] Account for time between rounds
- [ ] Set appropriate match dates

#### On-Chain Match Creation
- [ ] Connect to MatchFactory contract
- [ ] For each match:
  - Call `createMatch(teamACode, teamBCode, matchDate, "main")`
  - Pass country codes as bytes2
  - Set phase = "main"
  - Wait for transaction confirmation
- [ ] Log created match details
- [ ] Store transaction hashes
- [ ] Handle creation errors

#### Batch Processing
- [ ] Create matches in batches
- [ ] Optimize gas costs
- [ ] Track creation progress
- [ ] Resume on failure

### 8.3 Implement Tournament Seeding
File: `utils/tournamentSeeding.ts`

- [ ] Get qualified teams with their final standings
- [ ] Implement seeding algorithm:
  - Top teams from groups get better seeds
  - Fair distribution across bracket
- [ ] Create initial Round of 48 matchups
- [ ] Ensure competitive balance
- [ ] Document seeding methodology

### 8.4 Create Bracket/Knockout System
File: `utils/bracketLogic.ts`

#### Bracket Structure
- [ ] Define tournament bracket structure
- [ ] Map match relationships (winner of Match A vs winner of Match B)
- [ ] Create bracket tree
- [ ] Handle advancement logic

#### Advancement Logic
- [ ] Determine match winners after voting deadline
- [ ] Automatically create next round matches
- [ ] Or: Pre-create matches with TBD teams
- [ ] Update bracket as matches complete

#### On-Chain vs Off-Chain
- [ ] Option 1: Store bracket structure on-chain
  - Create BracketRegistry contract
  - Store match relationships
  - Update on match completion
- [ ] Option 2: Store bracket off-chain
  - Calculate in backend
  - Store in database
  - Read match results from chain
- [ ] Choose and implement approach

### 8.5 Create Tournament Data Structures
File: `utils/tournamentStructure.ts`

- [ ] Define tournament rounds
- [ ] Create round metadata:
  - Round name (Round of 48, Round of 24, etc.)
  - Start date
  - Number of matches
  - Next round
- [ ] Create match progression map
- [ ] Export tournament structure

### 8.6 Event Indexing for Main Tournament
- [ ] Ensure event indexer is running
- [ ] Monitor `MatchCreated` events for main tournament
- [ ] Index all main tournament matches
- [ ] Verify all matches indexed correctly
- [ ] Track match completions

### 8.7 Create Tournament API Endpoints

#### Get Tournament Bracket
File: `app/api/tournament/bracket/route.ts`

- [ ] GET endpoint for tournament bracket
- [ ] Return bracket structure with all matches
- [ ] Include match results for completed matches
- [ ] Show TBD for future matches
- [ ] Return winner paths

#### Get Round Matches
File: `app/api/tournament/rounds/[round]/route.ts`

- [ ] GET endpoint for matches in specific round
- [ ] Return all matches for that round
- [ ] Include match status and results
- [ ] Show voting deadlines

#### Get Match Progression
File: `app/api/tournament/matches/[id]/progression/route.ts`

- [ ] GET endpoint showing where match winner advances
- [ ] Return next match in bracket
- [ ] Show potential opponents

### 8.8 Build UI for Main Tournament

#### Tournament Bracket Page
File: `app/tournament/bracket/page.tsx`

- [ ] Display full tournament bracket
- [ ] Visual bracket tree structure
- [ ] Show all rounds
- [ ] Highlight completed matches
- [ ] Show match results
- [ ] Display TBD for upcoming matches
- [ ] Link to individual match voting pages
- [ ] Responsive design for mobile

#### Bracket Component
File: `components/TournamentBracket.tsx`

- [ ] Visual bracket tree component
- [ ] SVG or HTML/CSS bracket
- [ ] Show team flags and names
- [ ] Highlight winners
- [ ] Clickable matches for details
- [ ] Update in real-time
- [ ] Responsive/scrollable for small screens

#### Round View Component
File: `components/RoundView.tsx`

- [ ] Display matches for a specific round
- [ ] Card layout for matches
- [ ] Show match status
- [ ] Link to voting interface
- [ ] Display results
- [ ] Show next round advancement

### 8.9 Match Display Components
File: `components/MatchCard.tsx`

Enhance for tournament phase:
- [ ] Display round information
- [ ] Show advancement path
- [ ] Indicate if teams are qualified or TBD
- [ ] Show tournament context
- [ ] Display bracket position

### 8.10 Automatic Match Advancement
File: `lib/matchAdvancement.ts`

#### Advancement Service
- [ ] Monitor match completions (voting deadlines)
- [ ] Determine winners
- [ ] Update next round matches with winners
- [ ] Or: Use pre-created TBD matches
- [ ] Update bracket structure
- [ ] Trigger notifications

#### Automation Options
- [ ] Option 1: Cron job to check deadlines
- [ ] Option 2: Event-driven on VoteCast events
- [ ] Option 3: Manual admin trigger
- [ ] Choose and implement

### 8.11 Finals and Winner Determination
File: `utils/tournamentWinner.ts`

- [ ] Logic for final match
- [ ] Determine tournament champion
- [ ] Store winner in database
- [ ] Display champion on UI
- [ ] Special UI for finals
- [ ] Championship celebration component

### 8.12 Testing
- [ ] Test CSV parsing
- [ ] Test match generation for all rounds
- [ ] Test bracket structure
- [ ] Test advancement logic
- [ ] Test seeding algorithm
- [ ] Test UI bracket display
- [ ] Test match progression
- [ ] Test with simulated results

## Acceptance Criteria
- [ ] CSV schedule is parsed correctly
- [ ] All main tournament matches created on-chain
- [ ] Tournament bracket is structured correctly
- [ ] Matches advance properly round by round
- [ ] UI displays bracket and matches clearly
- [ ] Tournament starts June 11, 2026
- [ ] All matches respect 24-hour voting periods
- [ ] Champion is determined correctly

## Dependencies
- Phase 1 (database)
- Phase 3 (smart contracts)
- Phase 4 (blockchain integration)
- Phase 7 (qualified teams from qualifiers)

## Estimated Complexity
Medium-High - Complex bracket logic and match progression

## Important Dates
- Main tournament starts: **June 11, 2026**
- Schedule based on: `world_cup_2026_matches_per_day.csv`
- Each match: 24-hour voting period
- Time between rounds: Account for voting periods

## Data Files
- Input: `world_cup_2026_matches_per_day.csv`
- Contains: Date and number of matches per day

## Technical Considerations
- [ ] Bracket can be stored on-chain or off-chain
- [ ] Match advancement can be automatic or manual
- [ ] Consider gas costs for creating many matches
- [ ] Handle TBD teams gracefully in UI
- [ ] Ensure bracket updates in real-time
- [ ] Optimize for large bracket visualization

## Notes
- Tournament format depends on 48 qualified teams
- Bracket structure needs careful planning
- Match progression must be accurate
- Consider timezone handling for global audience
- UI should be intuitive and engaging
- Mobile experience is critical for Farcaster users
- Country codes remain in ISO 3166-1 alpha-2 format (bytes2)
