# Onchain World Cup API

Server-side API routes using Supabase for database access.

## Architecture

\`\`\`
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Client    │─────▶│  API Routes  │─────▶│   Supabase   │
│ (Frontend)  │      │  (Server)    │      │  (Database)  │
└─────────────┘      └──────────────┘      └──────────────┘
\`\`\`

**Important**:
- Database access is ONLY through API routes
- Service role key is ONLY used server-side
- Clients make HTTP requests to API routes
- API routes validate, authorize, and query Supabase

## Available Endpoints

### Matches

#### `GET /api/matches`
Fetch all matches with team information.

**Query Parameters:**
- `status` - Filter by status: `upcoming`, `voting`, or `completed`
- `limit` - Max results (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/matches?status=voting&limit=10"
\`\`\`

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "contract_address": "0x...",
      "match_start_time": "2026-06-12T15:00:00Z",
      "status": "voting",
      "team1": { "name": "Brazil", "flag_emoji": "🇧🇷" },
      "team2": { "name": "Argentina", "flag_emoji": "🇦🇷" }
    }
  ],
  "count": 42,
  "limit": 10,
  "offset": 0
}
\`\`\`

#### `POST /api/matches`
Create a new match (admin only).

**Body:**
\`\`\`json
{
  "team1_id": "uuid",
  "team2_id": "uuid",
  "contract_address": "0x...",
  "match_start_time": "2026-06-12T15:00:00Z"
}
\`\`\`

#### `GET /api/matches/[id]`
Fetch a single match with full details including votes.

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/matches/abc-123"
\`\`\`

#### `PATCH /api/matches/[id]`
Update a match (admin only).

**Body:**
\`\`\`json
{
  "status": "completed",
  "winning_team": 0
}
\`\`\`

### Countries

#### `GET /api/countries`
Fetch all countries.

**Query Parameters:**
- `qualified` - Filter by qualification: `true` or `false`
- `group` - Filter by group: `A`, `B`, `C`, etc.
- `limit` - Max results (default: 100)
- `offset` - Pagination offset (default: 0)

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/countries?qualified=true&group=A"
\`\`\`

#### `POST /api/countries`
Create a new country (admin only).

**Body:**
\`\`\`json
{
  "name": "Brazil",
  "code": "BRA",
  "flag_emoji": "🇧🇷",
  "fifa_rank": 1,
  "qualified": true
}
\`\`\`

### Votes

#### `GET /api/votes`
Fetch votes with optional filters.

**Query Parameters:**
- `match_id` - Filter by match UUID
- `voter_address` - Filter by wallet address
- `limit` - Max results (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/votes?voter_address=0x123..."
\`\`\`

#### `POST /api/votes`
Record a vote event from blockchain (called by event indexer).

**Body:**
\`\`\`json
{
  "match_id": "uuid",
  "voter_address": "0x...",
  "team_index": 0,
  "vote_count": 5,
  "total_cost_eth": "0.0055",
  "tx_hash": "0x...",
  "block_number": 12345
}
\`\`\`

### Users

#### `GET /api/users/[address]`
Fetch user statistics and voting history.

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/users/0x123..."
\`\`\`

**Response:**
\`\`\`json
{
  "data": {
    "wallet_address": "0x123...",
    "total_votes": 42,
    "total_spent_eth": "0.125",
    "total_won_eth": "0.200",
    "matches_participated": 10,
    "matches_won": 6,
    "rank": 15,
    "votes": [...]
  }
}
\`\`\`

### Leaderboard

#### `GET /api/leaderboard`
Fetch leaderboard of top users.

**Query Parameters:**
- `sort_by` - Sort field: `total_won_eth`, `total_votes`, or `matches_won` (default: `total_won_eth`)
- `limit` - Max results (default: 100)
- `offset` - Pagination offset (default: 0)

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/leaderboard?sort_by=total_votes&limit=10"
\`\`\`

## Using the API in Frontend

### Client-Side Fetching

\`\`\`typescript
// components/match-list.tsx
"use client"

import { useEffect, useState } from 'react'

export function MatchList() {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    fetch('/api/matches?status=voting')
      .then(res => res.json())
      .then(result => setMatches(result.data))
  }, [])

  return (
    <div>
      {matches.map(match => (
        <div key={match.id}>{match.team1.name} vs {match.team2.name}</div>
      ))}
    </div>
  )
}
\`\`\`

### Server Component Fetching

\`\`\`typescript
// app/matches/page.tsx
import { getSupabaseClient } from '@/lib/server/supabase'

export default async function MatchesPage() {
  // ✅ This is a server component - can use Supabase directly
  const supabase = getSupabaseClient()
  const { data } = await supabase.from('matches').select('*')

  return (
    <div>
      {data?.map(match => (
        <div key={match.id}>Match</div>
      ))}
    </div>
  )
}
\`\`\`

\`\`\`typescript
// components/match-card.tsx
"use client"

export function MatchCard() {
  // ❌ This is a client component - must use API route
  // import { getSupabaseClient } from '@/lib/server/supabase' // DON'T DO THIS

  // ✅ Use fetch instead
  const [match, setMatch] = useState(null)

  useEffect(() => {
    fetch('/api/matches/123')
      .then(res => res.json())
      .then(result => setMatch(result.data))
  }, [])

  return <div>{match?.team1.name}</div>
}
\`\`\`

## Error Handling

All API routes return consistent error format:

\`\`\`json
{
  "error": "Human-readable error message",
  "details": "Technical details (optional)"
}
\`\`\`

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

## Authentication

🚧 **TODO**: Implement authentication/authorization

Current routes marked with "admin only" need auth checks:
- `POST /api/matches`
- `PATCH /api/matches/[id]`
- `POST /api/countries`
- `POST /api/votes` (should only be called by trusted indexer)

Options:
1. API key authentication for admin operations
2. Wallet signature verification
3. OAuth/JWT tokens

## Security Best Practices

1. **Never expose service role key** - Only use in API routes
2. **Validate all inputs** - Check required fields, types, ranges
3. **Sanitize addresses** - Always lowercase and validate format
4. **Rate limiting** - Add rate limits to prevent abuse
5. **CORS** - Configure allowed origins in production
6. **SQL injection** - Use parameterized queries (Supabase does this automatically)

## Next Steps

1. Set up Supabase project and get credentials
2. Add credentials to `.env.local`
3. Run database migrations (see `/docs/database/`)
4. Test API routes with sample data
5. Implement authentication
6. Add rate limiting
7. Set up event indexer to populate votes
