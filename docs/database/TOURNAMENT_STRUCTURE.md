# Tournament Structure Documentation

This document explains how the World Cup tournament structure is modeled in the database.

## Overview

The Crypto World Cup supports the full tournament lifecycle:
1. **Qualification Phase** - Countries compete to qualify
2. **Group Stage** - 48 teams divided into 12 groups of 4
3. **Knockout Phase** - Round of 16, Quarter-finals, Semi-finals, Final

## Database Schema

### Tables

#### `tournaments`
Main tournament records (e.g., FIFA World Cup 2026).

```sql
- id: UUID (primary key)
- name: Tournament name
- year: Tournament year
- host_countries: Array of host country codes
- total_teams: Number of teams (48 for 2026)
- start_date: Tournament start date
- end_date: Tournament end date
- status: 'upcoming' | 'qualification' | 'group_stage' | 'knockout' | 'completed'
- current_phase: Current phase name
```

#### `tournament_phases`
Phases within a tournament (qualification, group stage, knockout rounds).

```sql
- id: UUID (primary key)
- tournament_id: References tournaments
- name: 'qualification' | 'group_stage' | 'round_of_16' | etc.
- display_name: Human-readable name
- phase_order: Sequential order (1, 2, 3...)
- start_date: Phase start date
- end_date: Phase end date
- status: 'upcoming' | 'active' | 'completed'
```

#### `groups`
Groups for the group stage (Group A, B, C, etc.).

```sql
- id: UUID (primary key)
- tournament_id: References tournaments
- name: 'A' | 'B' | 'C' | etc.
- display_name: 'Group A', 'Group B', etc.
- max_teams: Maximum teams per group (usually 4)
```

#### `group_standings`
Team standings within each group.

```sql
- id: UUID (primary key)
- group_id: References groups
- country_id: References countries
- matches_played: Total matches played
- wins: Number of wins
- draws: Number of draws
- losses: Number of losses
- votes_for: Votes received
- votes_against: Votes against
- vote_difference: Calculated field (votes_for - votes_against)
- points: Total points (3 per win, 1 per draw)
- position: Rank within group (1-4)
- qualified: Top 2 teams qualify for knockout
```

#### Updated `matches` Table
Extended to support tournament context.

```sql
-- New fields:
- tournament_id: References tournaments
- phase_id: References tournament_phases
- group_id: References groups (for group stage matches)
- match_number: Sequential number within phase
- is_qualification: Boolean flag for qualification matches
- team1_score: Actual match result (for standings calculation)
- team2_score: Actual match result (for standings calculation)
```

#### Updated `countries` Table
Extended to track tournament participation.

```sql
-- New fields:
- tournament_id: Which tournament they're participating in
- qualification_status: 'competing' | 'qualified' | 'eliminated' | 'host'
```

## Tournament Flow

### 1. Qualification Phase

```
qualification_matches
├── Match 1: Country A vs Country B
├── Match 2: Country C vs Country D
└── ... (hundreds of qualification matches)

After qualification:
└── 48 teams qualified → Assigned to groups
```

**API Flow:**
1. Create qualification phase
2. Create qualification matches (`is_qualification: true`)
3. Update countries with `qualification_status: 'qualified'`

### 2. Group Stage

```
World Cup 2026 (48 teams)
├── Group A (4 teams)
│   ├── Team 1 vs Team 2
│   ├── Team 1 vs Team 3
│   ├── Team 1 vs Team 4
│   ├── Team 2 vs Team 3
│   ├── Team 2 vs Team 4
│   └── Team 3 vs Team 4
├── Group B (4 teams)
│   └── ... (6 matches)
└── ... (Groups C-L)

After group stage:
└── Top 2 from each group (24 teams) → Knockout phase
```

**Group Stage Rules:**
- Each group has 4 teams
- Round-robin format (each team plays 3 matches)
- 3 points for win, 1 for draw, 0 for loss
- Top 2 teams from each group qualify
- Tiebreakers: Points → Vote Difference → Votes Received

**API Flow:**
1. Create groups (A-L)
2. Assign teams to groups via `group_standings`
3. Create group matches with `group_id`
4. Update match results (`team1_score`, `team2_score`)
5. Standings auto-calculate via trigger
6. Top 2 teams marked as `qualified: true`

### 3. Knockout Phase

```
Round of 16 (24 teams)
├── Match 1: 1A vs 2B
├── Match 2: 1C vs 2D
└── ... (12 matches)

Quarter Finals (8 teams)
├── Winner M1 vs Winner M2
└── ... (4 matches)

Semi Finals (4 teams)
├── Winner QF1 vs Winner QF2
└── ... (2 matches)

Third Place (2 teams)
└── Loser SF1 vs Loser SF2

Final (2 teams)
└── Winner SF1 vs Winner SF2
```

## Automatic Standings Calculation

The database includes a PostgreSQL function `calculate_group_standings(group_id)` that:

1. **Counts matches played** for each team in the group
2. **Calculates wins/draws/losses** from match results
3. **Sums votes received/against** for each team
4. **Computes vote difference** (generated column)
5. **Assigns points** (3 for win, 1 for draw)
6. **Ranks teams** by points, vote difference, votes received
7. **Marks top 2 as qualified**

This function is **automatically triggered** when match results are updated.

## API Endpoints

### Tournaments

```bash
# Get all tournaments
GET /api/tournaments

# Get tournaments by year
GET /api/tournaments?year=2026

# Create tournament
POST /api/tournaments
{
  "name": "FIFA World Cup 2026",
  "year": 2026,
  "host_countries": ["USA", "MEX", "CAN"],
  "total_teams": 48,
  "start_date": "2026-06-11",
  "end_date": "2026-07-19"
}
```

### Tournament Phases

```bash
# Get phases for a tournament
GET /api/tournaments/{id}/phases

# Create phase
POST /api/tournaments/{id}/phases
{
  "name": "group_stage",
  "display_name": "Group Stage",
  "phase_order": 2,
  "start_date": "2026-06-12",
  "end_date": "2026-06-26"
}

# Update phase status
PATCH /api/tournaments/{id}/phases?phaseId={id}
{
  "status": "active"
}
```

### Groups

```bash
# Get groups with standings
GET /api/tournaments/{id}/groups

# Create group
POST /api/tournaments/{id}/groups
{
  "name": "A",
  "max_teams": 4
}
```

### Group Standings

```bash
# Get standings for a group
GET /api/groups/{id}/standings

# Add team to group
POST /api/groups/{id}/standings
{
  "country_id": "uuid-of-brazil"
}

# Manually recalculate standings
PUT /api/groups/{id}/standings
```

### Matches (Extended)

```bash
# Create group stage match
POST /api/matches
{
  "team1_id": "uuid-brazil",
  "team2_id": "uuid-argentina",
  "tournament_id": "uuid-wc-2026",
  "phase_id": "uuid-group-stage",
  "group_id": "uuid-group-a",
  "match_number": 1,
  "contract_address": "0x...",
  "match_start_time": "2026-06-12T15:00:00Z"
}

# Update match result (triggers standings recalculation)
PATCH /api/matches/{id}
{
  "team1_score": 3,
  "team2_score": 1,
  "status": "completed",
  "winning_team": 0
}
```

## Example Workflow: Setting Up World Cup 2026

### Step 1: Create Tournament

```sql
INSERT INTO tournaments (name, year, host_countries, total_teams, start_date, end_date)
VALUES (
  'FIFA World Cup 2026',
  2026,
  ARRAY['USA', 'MEX', 'CAN'],
  48,
  '2026-06-11',
  '2026-07-19'
);
```

### Step 2: Create Phases

```sql
INSERT INTO tournament_phases (tournament_id, name, display_name, phase_order) VALUES
  (tournament_id, 'qualification', 'Qualification Phase', 1),
  (tournament_id, 'group_stage', 'Group Stage', 2),
  (tournament_id, 'round_of_16', 'Round of 16', 3),
  (tournament_id, 'quarter_final', 'Quarter Finals', 4),
  (tournament_id, 'semi_final', 'Semi Finals', 5),
  (tournament_id, 'final', 'Final', 7);
```

### Step 3: Create Groups

```sql
INSERT INTO groups (tournament_id, name, display_name) VALUES
  (tournament_id, 'A', 'Group A'),
  (tournament_id, 'B', 'Group B'),
  -- ... (Groups C-L)
  (tournament_id, 'L', 'Group L');
```

### Step 4: Assign Teams to Groups

```sql
-- Group A
INSERT INTO group_standings (group_id, country_id) VALUES
  (group_a_id, brazil_id),
  (group_a_id, mexico_id),
  (group_a_id, cameroon_id),
  (group_a_id, serbia_id);
```

### Step 5: Create Group Matches

```sql
INSERT INTO matches (
  tournament_id, phase_id, group_id,
  team1_id, team2_id,
  contract_address,
  match_start_time, match_number
) VALUES
  (tournament_id, group_stage_id, group_a_id,
   brazil_id, mexico_id,
   '0x...', '2026-06-12T15:00:00Z', 1);
```

### Step 6: Update Match Results

```sql
UPDATE matches
SET team1_score = 3, team2_score = 1, status = 'completed'
WHERE id = match_id;

-- Standings automatically recalculated via trigger!
```

### Step 7: Check Standings

```sql
SELECT
  c.name,
  gs.matches_played,
  gs.wins,
  gs.draws,
  gs.losses,
  gs.votes_for,
  gs.votes_against,
  gs.vote_difference,
  gs.points,
  gs.position,
  gs.qualified
FROM group_standings gs
JOIN countries c ON gs.country_id = c.id
WHERE gs.group_id = group_a_id
ORDER BY gs.position;
```

## Frontend Integration

### Display Group Standings

```typescript
// Fetch group standings
const response = await fetch('/api/groups/{groupId}/standings')
const { data } = await response.json()

// Display table
data.map(standing => ({
  position: standing.position,
  team: standing.country.name,
  flag: standing.country.flag_emoji,
  played: standing.matches_played,
  won: standing.wins,
  drawn: standing.draws,
  lost: standing.losses,
  gf: standing.votes_for,
  ga: standing.votes_against,
  gd: standing.vote_difference,
  points: standing.points,
  qualified: standing.qualified
}))
```

### Display Tournament Bracket

```typescript
// Fetch knockout phase matches
const response = await fetch('/api/matches?phase_id={roundOf16Id}')
const { data: matches } = await response.json()

// Render bracket
matches.map(match => ({
  matchNumber: match.match_number,
  team1: match.team1,
  team2: match.team2,
  score: `${match.team1_score} - ${match.team2_score}`,
  winner: match.winning_team === 0 ? match.team1 : match.team2
}))
```

## Database Migrations

Run migrations in order:

1. `schema.sql` - Base tables (countries, matches, votes, user_stats)
2. `002_add_tournament_structure.sql` - Tournament tables and functions

```bash
# In Supabase SQL Editor
# 1. Run schema.sql
# 2. Run 002_add_tournament_structure.sql
```

## Best Practices

1. **Always use transactions** when creating related records
2. **Let triggers handle standings** - don't manually update
3. **Validate match results** before updating scores
4. **Check qualification status** before assigning to groups
5. **Use phase_order** for sequential progression
6. **Mark phases as 'completed'** when finished
7. **Archive old tournaments** rather than deleting

## Future Enhancements

- [ ] Support for multiple concurrent tournaments
- [ ] Penalty shootout results tracking
- [ ] Player statistics per match
- [ ] Historical tournament data
- [ ] Advanced tiebreaker rules (head-to-head, fair play)
- [ ] Automatic bracket generation for knockout phase
- [ ] Tournament templates for quick setup
