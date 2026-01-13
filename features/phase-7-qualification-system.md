# Phase 7: Qualification Phase System

## Overview
Implement the qualification phase system where countries compete in groups. Create the group stage generator, match scheduler, and standings calculation to determine the top 48 teams that advance to the main tournament.

## Sub-tasks

### 7.1 Design Group Stage Structure
File: `utils/qualifierLogic.ts`

- [ ] Define number of groups
- [ ] Define countries per group
- [ ] Define qualification rules (e.g., top 2 from each group)
- [ ] Calculate total qualifiers needed (48 teams)
- [ ] Document qualification format

### 7.2 Create Country Assignment Logic
File: `utils/qualifierLogic.ts`

- [ ] Get list of all participating countries
- [ ] Implement random or seeded group assignment
- [ ] Ensure balanced groups
- [ ] Assign country codes to groups
- [ ] Validate group assignments

### 7.3 Create Group Data in Database
- [ ] Seed groups table with group names
- [ ] Assign countries to groups
- [ ] Initialize group standings with 0 points
- [ ] Verify data integrity

### 7.4 Create On-Chain Match Generator
File: `scripts/createQualifierMatches.ts`

This script creates all qualifier matches on-chain.

#### Match Generation Logic
- [ ] Generate round-robin matches for each group
- [ ] Calculate match schedule (each team plays every other team in group)
- [ ] Set match dates (all ending by June 7, 2026)
- [ ] Distribute matches over time for voting periods
- [ ] Convert country codes to bytes2 format

#### On-Chain Match Creation
- [ ] Connect to MatchFactory contract
- [ ] For each match:
  - Call `createMatch(teamACode, teamBCode, matchDate, phase)`
  - Pass country codes as bytes2
  - Set phase = "qualifier"
  - Wait for transaction confirmation
- [ ] Log created match details
- [ ] Store transaction hashes
- [ ] Handle creation errors

#### Batch Processing
- [ ] Create matches in batches to optimize gas
- [ ] Add delays between batches if needed
- [ ] Track creation progress
- [ ] Resume from failure point if interrupted

### 7.5 Event Indexing for Qualifier Matches
- [ ] Ensure event indexer is running
- [ ] Monitor `MatchCreated` events from qualifier matches
- [ ] Index all qualifier matches to database
- [ ] Verify all matches are indexed correctly
- [ ] Check match data completeness

### 7.6 Create Match Scheduler
File: `utils/matchScheduler.ts`

- [ ] Calculate optimal match schedule
- [ ] Ensure 24-hour voting periods don't overlap excessively
- [ ] Distribute matches across dates
- [ ] Respect June 7th deadline
- [ ] Export match schedule

### 7.7 Implement Group Standings Calculation
File: `utils/qualifierLogic.ts`

#### Standings Calculation
- [ ] Query completed qualifier matches from database
- [ ] For each match:
  - Determine winner (team with more ETH)
  - Award points (3 for win, 1 for draw, 0 for loss)
  - Update win/loss/draw counts
- [ ] Calculate standings for each group
- [ ] Update `group_standings` table
- [ ] Order by points, then tiebreakers

#### On-Chain vs Off-Chain
- [ ] Decide: calculate on-chain or off-chain
- [ ] If on-chain: create smart contract for standings
- [ ] If off-chain: create backend service
- [ ] Ensure calculations match match results

#### Tiebreaker Logic
- [ ] Implement tiebreaker rules:
  - Primary: Most points
  - Secondary: Goal difference (or vote difference)
  - Tertiary: Head-to-head result
  - Quaternary: Random or other criteria
- [ ] Document tiebreaker rules

### 7.8 Create Qualification API Endpoints

#### Get Groups
File: `app/api/groups/route.ts`

- [ ] GET endpoint to list all groups
- [ ] Return group names and assigned countries
- [ ] Include group metadata

#### Get Group Standings
File: `app/api/groups/[id]/standings/route.ts`

- [ ] GET endpoint for group standings
- [ ] Query `group_standings` table
- [ ] Order by points (with tiebreakers)
- [ ] Return: country code, points, wins, losses, draws
- [ ] Highlight qualified teams

#### Get Group Matches
File: `app/api/groups/[id]/matches/route.ts`

- [ ] GET endpoint for all matches in a group
- [ ] Query database for group's matches
- [ ] Return match details and results
- [ ] Include voting statistics

#### Get Qualified Teams
File: `app/api/qualifiers/route.ts`

- [ ] GET endpoint for all qualified teams
- [ ] Calculate top teams from each group
- [ ] Return list of 48 qualified countries
- [ ] Include qualification criteria

### 7.9 Build UI for Qualifier Phase

#### Groups Overview Page
File: `app/qualifiers/page.tsx`

- [ ] Display all groups in grid layout
- [ ] Show countries in each group
- [ ] Link to detailed group view
- [ ] Show qualification status

#### Group Detail Page
File: `app/qualifiers/[groupId]/page.tsx`

- [ ] Display group standings table
- [ ] Show matches for the group
- [ ] Highlight qualified teams
- [ ] Show remaining matches
- [ ] Include voting interface for active matches

#### Group Standings Component
File: `components/GroupStandings.tsx`

- [ ] Table with columns: Position, Country, Points, Wins, Draws, Losses
- [ ] Highlight top teams (qualified)
- [ ] Update in real-time as matches complete
- [ ] Responsive design

#### Group Matches Component
File: `components/GroupMatches.tsx`

- [ ] List all matches in group
- [ ] Show match status (upcoming, active, completed)
- [ ] Display results for completed matches
- [ ] Link to voting interface for active matches
- [ ] Show voting deadline countdown

### 7.10 Standings Update System
File: `lib/standingsUpdater.ts`

- [ ] Create service to update standings
- [ ] Trigger on match completion (voting deadline passed)
- [ ] Calculate new standings after each match
- [ ] Update database
- [ ] Can run as cron job or event-driven

### 7.11 Qualification Finalization
File: `scripts/finalizeQualifiers.ts`

- [ ] Script to determine final qualified teams
- [ ] Run after all qualifier matches complete (June 7, 2026)
- [ ] Calculate final standings for all groups
- [ ] Select top teams from each group (48 total)
- [ ] Store qualified teams in database
- [ ] Prepare data for main tournament seeding

### 7.12 Testing
- [ ] Test group assignment logic
- [ ] Test match generation for all groups
- [ ] Test standings calculation
- [ ] Test tiebreaker scenarios
- [ ] Test qualification determination
- [ ] Test UI displays correctly
- [ ] Test with sample match results

## Acceptance Criteria
- [ ] Groups are created and countries assigned
- [ ] All qualifier matches are created on-chain
- [ ] Matches are indexed to database
- [ ] Standings calculation works correctly
- [ ] UI displays groups, standings, and matches
- [ ] Qualified teams are determined accurately
- [ ] All qualifier matches complete by June 7, 2026

## Dependencies
- Phase 1 (database with groups tables)
- Phase 3 (smart contracts deployed)
- Phase 4 (event indexer and API endpoints)

## Estimated Complexity
Medium-High - Involves complex scheduling and standings logic

## Important Dates
- Qualification phase starts: Immediately
- Qualification phase ends: **June 7, 2026**
- All matches must complete by this date

## Notes
- Each match has 24-hour voting period
- Consider time zones when scheduling
- Standings can be calculated on-chain or off-chain
- Top teams from each group advance (48 total)
- Tiebreaker rules must be clearly defined
- Country codes must be in ISO 3166-1 alpha-2 format (bytes2)
- Match creation should be done in batches for gas efficiency
- Monitor event indexing to ensure all matches are recorded
