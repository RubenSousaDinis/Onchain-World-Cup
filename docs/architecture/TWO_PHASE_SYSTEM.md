# Two-Phase System Architecture

## Overview

The Onchain World Cup is built on a **two-phase architecture** where each phase has distinct mechanics, smart contracts, and user experiences. This document explains how the phases interact and how the system transitions between them.

**This is NOT a prediction market** - it's a social coordination tournament measuring onchain popularity.

## System Phases

### Phase 1: Qualification (~6-8 weeks)

**Purpose:** Select the top 48 countries for the tournament

**Mechanics:**
- **NO MATCHES** during qualification
- Users support countries via fixed-price votes (0.001 ETH)
- Time-based fees incentivize early participation
- Top 48 countries by total support qualify
- Prize pool distributed to supporters of qualified teams

**Smart Contract:**
- Single global `QualificationContract`
- All countries in one contract
- Deployed once per season

**User Experience:**
- Vote for any country
- See live rankings
- Track personal support across countries
- Claim rewards after top 48 are determined

### Phase 2: Tournament (~6-8 weeks)

**Purpose:** Determine the Onchain World Cup Champion

**Mechanics:**
- **MATCHES between qualified countries**
- Users support one team per match via dynamic-price votes
- 2-phase pricing (linear → exponential) per match
- 24-hour voting window per match
- Team with more ETH wins match
- Winners advance through bracket

**Smart Contracts:**
- Individual `TournamentMatchContract` per match
- Factory pattern deploys ~100+ match contracts
- Each match is independent

**User Experience:**
- Vote on individual matches
- Choose between two teams
- See price increase in real-time
- Claim winnings per match

## Architectural Comparison

| Aspect | Qualification | Tournament |
|--------|---------------|------------|
| **Contract Architecture** | Single global contract | Factory + per-match contracts |
| **Voting Structure** | All countries, no matches | 2 teams per match |
| **Pricing Model** | Fixed (0.001 ETH) | Dynamic (linear → exponential) |
| **Fee Model** | Time-based only | None (or could add time-based) |
| **Voting Period** | ~6-8 weeks total | 24 hours per match |
| **Winner Determination** | Top 48 by votes | Team with more ETH per match |
| **Prize Distribution** | Proportional to support of qualified | 90% to winning team supporters |
| **Number of Winners** | All who voted for top 48 | Only those who voted for match winner |

## Phase Transition

### Qualification End → Tournament Start

```
┌─────────────────────┐
│ Qualification Phase │
│   (6-8 weeks)       │
└──────────┬──────────┘
           │
           ▼
    [Qualification Deadline]
           │
           ▼
   ┌───────────────┐
   │ Admin calls   │
   │ snapshot()    │
   └───────┬───────┘
           │
           ▼
   ┌─────────────────────┐
   │ Top 48 Determined   │
   │ (On-chain snapshot) │
   └──────────┬──────────┘
           │
           ├──> Users claim qualification rewards
           │
           ├──> Backend indexes qualified countries
           │
           ├──> Group stage created (optional)
           │
           ▼
   ┌──────────────────┐
   │ Tournament Phase │
   │   Begins         │
   └──────────────────┘
```

### Transition Steps

1. **Qualification deadline passes**
2. **Admin finalizes qualification**
   - Calls `QualificationContract.snapshotQualification()`
   - Top 48 countries locked on-chain
   - Event emitted with qualified countries
3. **Backend indexes qualified countries**
   - Listens to `QualificationSnapshot` event
   - Updates database with qualified status
   - Creates tournament structure
4. **Users claim qualification rewards**
   - Calculate based on votes for qualified countries
   - Permissionless claiming (users initiate)
5. **Tournament structure created**
   - Group stage matches OR direct bracket
   - MatchFactory deploys individual match contracts
   - Match schedule published
6. **Tournament voting begins**
   - Users can vote on active matches
   - Each match has 24-hour window
   - Matches progress through bracket

## Smart Contract Architecture

### Contract Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                    Season Timeline                   │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│ QUALIFICATION   │              │   TOURNAMENT    │
└─────────────────┘              └─────────────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│ Qualification   │              │  MatchFactory   │
│   Contract      │              │                 │
│                 │              └────────┬────────┘
│ - All countries │                       │
│ - Fixed price   │              ┌────────┴────────┐
│ - Time fees     │              │                 │
│ - Top 48 select │              ▼                 ▼
└─────────────────┘     ┌────────────┐    ┌────────────┐
                        │   Match 1  │    │   Match 2  │
                        │  BR vs AR  │    │  US vs MX  │
                        └────────────┘    └────────────┘
                               │                  │
                               ▼                  ▼
                        [100+ match contracts]
```

### Contract Deployment Sequence

**Season Start:**
1. Deploy `QualificationContract`
   - Set phase start/end times
   - Configure fee schedule
   - Set platform wallet

**After Qualification:**
2. Deploy `MatchRegistry`
   - Stores match metadata on-chain
3. Deploy `MatchFactory`
   - Links to MatchRegistry
   - Has permission to register matches
4. Create matches via factory
   - `factory.createMatch(teamA, teamB, startTime)`
   - Deploys `TournamentMatchContract`
   - Registers in `MatchRegistry`
   - Emits `MatchCreated` event

## Database Schema

### Qualification Phase Tables

```sql
-- Users who voted during qualification
qualification_votes (
  id                UUID PRIMARY KEY,
  user_address      VARCHAR(42) NOT NULL,
  country_code      CHAR(2) NOT NULL,
  amount_eth        DECIMAL NOT NULL,
  fee_percent       INTEGER NOT NULL,
  tx_hash           VARCHAR(66) NOT NULL,
  block_number      BIGINT NOT NULL,
  block_timestamp   TIMESTAMP NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);

-- Live standings during qualification
qualification_standings (
  country_code      CHAR(2) PRIMARY KEY,
  total_votes       INTEGER NOT NULL DEFAULT 0,
  total_eth         DECIMAL NOT NULL DEFAULT 0,
  rank              INTEGER,
  is_qualified      BOOLEAN DEFAULT FALSE,
  last_updated      TIMESTAMP DEFAULT NOW()
);

-- Final top 48 after snapshot
qualified_countries (
  country_code          CHAR(2) PRIMARY KEY,
  final_rank            INTEGER NOT NULL,
  total_votes           INTEGER NOT NULL,
  total_eth             DECIMAL NOT NULL,
  qualification_time    TIMESTAMP NOT NULL,
  created_at            TIMESTAMP DEFAULT NOW()
);
```

### Tournament Phase Tables

```sql
-- Tournament matches (reuse existing matches table)
matches (
  id                    UUID PRIMARY KEY,
  match_number          INTEGER,
  team1_country_code    CHAR(2) REFERENCES qualified_countries,
  team2_country_code    CHAR(2) REFERENCES qualified_countries,
  contract_address      VARCHAR(42) UNIQUE,
  match_start_time      TIMESTAMP NOT NULL,
  voting_deadline       TIMESTAMP NOT NULL,
  status                VARCHAR(20), -- 'upcoming', 'active', 'finalized'
  winning_team          INTEGER, -- 0, 1, or NULL
  team1_votes           INTEGER DEFAULT 0,
  team2_votes           INTEGER DEFAULT 0,
  team1_eth             DECIMAL DEFAULT 0,
  team2_eth             DECIMAL DEFAULT 0,
  created_at            TIMESTAMP DEFAULT NOW()
);

-- Tournament votes (reuse existing votes table)
tournament_votes (
  id                UUID PRIMARY KEY,
  match_id          UUID REFERENCES matches,
  user_address      VARCHAR(42) NOT NULL,
  team              INTEGER NOT NULL, -- 0 or 1
  country_code      CHAR(2) NOT NULL,
  price             DECIMAL NOT NULL,
  phase             INTEGER NOT NULL, -- 1 or 2
  tx_hash           VARCHAR(66) NOT NULL,
  block_number      BIGINT NOT NULL,
  block_timestamp   TIMESTAMP NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);
```

## Data Flow

### Qualification Voting Flow

```
User → Frontend → Wallet → QualificationContract.vote()
                                        │
                                        ├─> VoteCast event emitted
                                        │
                                        ▼
                            Backend Event Indexer
                                        │
                                        ├─> Listens to VoteCast
                                        ├─> Indexes to qualification_votes table
                                        ├─> Updates qualification_standings
                                        │
                                        ▼
                            Database (Supabase)
                                        │
                                        ▼
                            Frontend queries standings
                                        │
                                        ▼
                            Live rankings displayed
```

### Tournament Voting Flow

```
User → Frontend → Wallet → TournamentMatch.vote()
                                        │
                                        ├─> VoteCast event emitted
                                        │
                                        ▼
                            Backend Event Indexer
                                        │
                                        ├─> Listens to VoteCast
                                        ├─> Indexes to tournament_votes table
                                        ├─> Updates matches table (vote counts, ETH totals)
                                        │
                                        ▼
                            Database (Supabase)
                                        │
                                        ▼
                            Frontend queries match state
                                        │
                                        ▼
                            Live match stats displayed
```

### Match Creation Flow

```
Admin/Script → MatchFactory.createMatch(teamA, teamB, startTime)
                                        │
                                        ├─> Deploys TournamentMatchContract
                                        ├─> Registers in MatchRegistry
                                        ├─> MatchCreated event emitted
                                        │
                                        ▼
                            Backend Event Indexer
                                        │
                                        ├─> Listens to MatchCreated
                                        ├─> Indexes to matches table
                                        │
                                        ▼
                            Database (Supabase)
                                        │
                                        ▼
                            Frontend displays match schedule
```

## Frontend Routing

### Qualification Phase Routes

```
/qualification
├── /               # Main qualification voting interface
│                   # - Display all countries
│                   # - Vote buttons (0.001 ETH each)
│                   # - Current fee percentage
│                   # - Time remaining
│
├── /standings      # Live qualification rankings
│                   # - Leaderboard of all countries
│                   # - Top 48 highlighted
│                   # - User's supported countries
│                   # - Projected rewards
│
└── /my-support     # User's qualification votes
                    # - Countries voted for
                    # - Total votes per country
                    # - ETH spent per country
                    # - Claimable rewards (after finalization)
```

### Tournament Phase Routes

```
/tournament
├── /               # Tournament bracket overview
│                   # - Group stage standings (if applicable)
│                   # - Knockout bracket
│                   # - Upcoming matches
│
├── /matches/:id    # Individual match voting
│                   # - Two teams
│                   # - Current price for each team
│                   # - Vote buttons
│                   # - Live stats (votes, ETH, phase)
│                   # - Countdown timer
│
└── /my-matches     # User's tournament votes
                    # - Active matches
                    # - Completed matches
                    # - Claimable winnings
                    # - Claim buttons
```

### Unified Routes

```
/
├── /               # Homepage (phase-aware)
│                   # - Shows qualification OR tournament based on current phase
│
├── /my-account     # User dashboard
│                   # - Qualification votes & rewards
│                   # - Tournament matches & winnings
│                   # - Overall stats
│
└── /claim          # Unified claim interface
                    # - Qualification rewards
                    # - Tournament match winnings
                    # - Claim all button
```

## API Endpoints

### Qualification Endpoints

```
GET  /api/qualification/standings
     Response: Array of {country_code, votes, eth, rank, is_qualified}

GET  /api/qualification/countries
     Response: All countries with vote stats

POST /api/qualification/vote
     Body: {txHash, countryCode}
     Action: Index vote transaction to database

GET  /api/qualification/user/:address
     Response: User's qualification votes and stats

GET  /api/qualification/rewards/:address
     Response: Claimable rewards for user

POST /api/qualification/snapshot
     Body: {txHash}
     Action: Admin finalizes top 48, indexes to database

GET  /api/qualification/qualified
     Response: Final top 48 countries (after finalization)
```

### Tournament Endpoints

```
GET  /api/matches
     Query: ?status=active|upcoming|completed
     Response: Array of matches

GET  /api/matches/:id
     Response: Match details (teams, votes, ETH, phase, time remaining)

POST /api/matches/:id/vote
     Body: {txHash, team}
     Action: Index vote transaction to database

GET  /api/matches/:id/user/:address
     Response: User's votes for this match

GET  /api/matches/:id/rewards/:address
     Response: Claimable winnings for this match

POST /api/matches/:id/finalize
     Body: {txHash}
     Action: Index match finalization

GET  /api/user/:address/matches
     Response: All matches user has voted on
```

## Event Indexing Strategy

### Qualification Events

```javascript
// Listen to QualificationContract
contract.on('VoteCast', async (voter, country, amount, fee, timestamp) => {
  // Index to qualification_votes table
  // Update qualification_standings
  // Emit real-time update to frontend
});

contract.on('QualificationSnapshot', async (qualifiedCountries, timestamp) => {
  // Index to qualified_countries table
  // Update qualification_standings (set is_qualified)
  // Notify users
});

contract.on('RewardClaimed', async (user, amount) => {
  // Update claim status
  // Track total rewards distributed
});
```

### Tournament Events

```javascript
// Listen to MatchFactory
factory.on('MatchCreated', async (matchId, matchContract, teamA, teamB, startTime) => {
  // Index to matches table
  // Set up listener for new match contract
});

// Listen to each TournamentMatchContract
match.on('VoteCast', async (voter, country, price, phase, totalVotes) => {
  // Index to tournament_votes table
  // Update matches table (vote counts, ETH totals)
  // Emit real-time update to frontend
});

match.on('MatchFinalized', async (winningTeam, teamAETH, teamBETH, timestamp) => {
  // Update matches table (status, winner)
  // Calculate user winnings
  // Notify voters
});
```

## Security Considerations

### Phase Isolation

- Qualification and tournament contracts are completely separate
- No cross-phase dependencies
- Failure in one phase doesn't affect the other

### Admin Controls

**Qualification:**
- Admin can finalize snapshot (after deadline)
- Cannot modify votes or standings
- Cannot change fee schedule after deployment

**Tournament:**
- Factory owner can create matches
- Cannot modify match outcomes
- Cannot withdraw user funds
- Platform wallet can only withdraw 10% fee (after finalization)

### Upgrade Path

Both contracts are immutable once deployed. For upgrades:

**Qualification:**
- Deploy new contract for next season
- Old contract remains accessible for claims

**Tournament:**
- Factory can deploy new match contract versions
- Old matches remain immutable
- Use different factory for different formats

## Testing Strategy

### Unit Tests

**Qualification Contract:**
- Vote with correct/incorrect payment
- Fee calculation over time
- Snapshot top 48 selection
- Reward calculation
- Claim prevention (double claim, early claim)

**Tournament Contract:**
- Vote in Phase 1 (linear pricing)
- Vote in Phase 2 (exponential pricing)
- Phase transition
- Match finalization
- Payout calculation (vote count based)
- Claim prevention

### Integration Tests

**Phase Transition:**
- Full qualification cycle → snapshot → tournament creation
- User claims qualification reward → votes on tournament match
- Database consistency across phases

**Event Indexing:**
- Qualification votes indexed correctly
- Tournament votes indexed correctly
- Real-time updates work
- Historical data accurate

### End-to-End Tests

- User journey: qualification voting → claim → tournament voting → claim
- Admin journey: deploy → manage qualification → create tournament
- Multi-user scenarios
- Edge cases (ties, late votes, etc.)

## Deployment Sequence

### Testnet Deployment

1. Deploy QualificationContract (with short durations for testing)
2. Test full qualification cycle
3. Deploy MatchFactory and MatchRegistry
4. Create test matches
5. Test tournament voting cycle
6. Verify event indexing
7. Test frontend integration

### Mainnet Deployment

1. Deploy QualificationContract
   - Set real start/end times (~6-8 weeks)
   - Set production fee schedule
   - Set platform wallet
   - Verify contract
2. Launch qualification phase
3. Monitor for 6-8 weeks
4. Finalize qualification (call snapshot())
5. Deploy MatchFactory and MatchRegistry
6. Create tournament matches (group stage or bracket)
7. Launch tournament phase
8. Monitor match-by-match for 6-8 weeks
9. Post-season cleanup and analytics

## Monitoring & Analytics

### Key Metrics

**Qualification Phase:**
- Total votes cast
- Total ETH in prize pool
- Fee revenue
- Active voters count
- Countries supported distribution
- Time-based participation patterns

**Tournament Phase:**
- Matches created
- Total votes per match
- Average vote price
- Phase 1 vs Phase 2 participation
- Match outcomes vs vote distribution
- Total ETH in tournament

**Cross-Phase:**
- User retention (qualification → tournament)
- Total platform revenue
- Total ETH distributed to users
- Gas costs per operation

## Related Documents

- [ROADMAP.md](../ROADMAP.md) - Official specification
- [QUALIFICATION_CONTRACT_SPEC.md](../contracts/QUALIFICATION_CONTRACT_SPEC.md) - Qualification contract
- [TOURNAMENT_CONTRACT_SPEC.md](../contracts/TOURNAMENT_CONTRACT_SPEC.md) - Tournament contract
- [TOURNAMENT_STRUCTURE.md](../database/TOURNAMENT_STRUCTURE.md) - Database design
- [PLAN.md](../planning/PLAN.md) - Implementation plan
