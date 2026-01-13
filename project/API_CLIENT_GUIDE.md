# API Client & Data Fetching Guide

This guide explains how to use the API client, React hooks, and caching system in the Crypto World Cup application.

## Overview

The application uses a modern data fetching stack:

- **Server-side**: Next.js `unstable_cache` for API route caching
- **Client-side**: TanStack Query (React Query) for data fetching and caching
- **HTTP Client**: Axios for making API requests
- **Type Safety**: Full TypeScript support with typed hooks and API responses

## Two-Phase System

The Onchain World Cup has two phases with separate APIs:

1. **Qualification Phase**: Fixed-price voting, rankings-based
2. **Tournament Phase**: Match-based voting, dynamic pricing

## Architecture

\`\`\`
┌─────────────────────┐
│  React Components   │
│                     │
│  Use React Hooks    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Custom Hooks (TanStack Query)      │
│  Qualification:                      │
│  - useQualificationStandings()      │
│  - useQualificationCountries()      │
│  - useQualificationUserVotes()      │
│  - useQualificationRewards()        │
│  Tournament:                         │
│  - useMatches()                      │
│  - useMatch()                        │
│  - useLeaderboard()                  │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Axios Client      │
│   /lib/api-client   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   API Routes        │
│   /app/api/*        │
│   (unstable_cache)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Supabase DB       │
└─────────────────────┘
\`\`\`

## Client-Side Usage

### 1. Qualification Phase Hooks

#### Qualification Standings

\`\`\`tsx
import { useQualificationStandings } from '@/hooks/use-qualification'

function QualificationStandings() {
  // Fetch live standings
  const { data, isLoading, error } = useQualificationStandings()

  if (isLoading) return <div>Loading standings...</div>
  if (error) return <div>Error loading standings</div>

  return (
    <div>
      {data?.data.map((standing, index) => (
        <div key={standing.country_code}>
          <span>#{standing.rank}</span>
          <span>{standing.country_code}</span>
          <span>{standing.total_votes} votes</span>
          <span>{standing.total_eth} ETH</span>
          {standing.is_qualified && <span>✓ Qualified</span>}
        </div>
      ))}
    </div>
  )
}
\`\`\`

#### User's Qualification Votes

\`\`\`tsx
import { useQualificationUserVotes } from '@/hooks/use-qualification'

function MyQualificationVotes({ userAddress }: { userAddress: string }) {
  const { data } = useQualificationUserVotes(userAddress)

  return (
    <div>
      <h3>My Support</h3>
      {data?.data.map((vote) => (
        <div key={vote.country_code}>
          <span>{vote.country_code}</span>
          <span>{vote.vote_count} votes</span>
          <span>{vote.total_eth} ETH</span>
        </div>
      ))}
    </div>
  )
}
\`\`\`

#### Claimable Rewards

\`\`\`tsx
import { useQualificationRewards } from '@/hooks/use-qualification'

function ClaimRewards({ userAddress }: { userAddress: string }) {
  const { data, isLoading } = useQualificationRewards(userAddress)

  if (isLoading) return <div>Calculating rewards...</div>

  const claimable = data?.data.claimable_amount || 0

  return (
    <div>
      <h3>Qualification Rewards</h3>
      <p>Claimable: {claimable} ETH</p>
      {claimable > 0 && (
        <button onClick={() => claimReward()}>
          Claim {claimable} ETH
        </button>
      )}
    </div>
  )
}
\`\`\`

#### Qualified Countries

\`\`\`tsx
import { useQualifiedCountries } from '@/hooks/use-qualification'

function QualifiedList() {
  // Fetch final top 48 (only available after qualification ends)
  const { data } = useQualifiedCountries()

  return (
    <div>
      <h3>Qualified for Tournament</h3>
      {data?.data.map((country) => (
        <div key={country.country_code}>
          <span>#{country.final_rank}</span>
          <span>{country.country_code}</span>
          <span>{country.total_votes} votes</span>
        </div>
      ))}
    </div>
  )
}
\`\`\`

### 2. Tournament Phase Hooks

#### Matches

\`\`\`tsx
import { useMatches, useMatch } from '@/hooks/use-matches'

function MatchesList() {
  // Fetch all matches
  const { data, isLoading, error } = useMatches()

  // Fetch with filters
  const { data: votingMatches } = useMatches({ status: 'voting', limit: 10 })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading matches</div>

  return (
    <div>
      {data?.data.map((match) => (
        <div key={match.id}>{match.team1?.name} vs {match.team2?.name}</div>
      ))}
    </div>
  )
}

// Fetch single match
function MatchDetail({ matchId }: { matchId: string }) {
  const { data, isLoading } = useMatch(matchId)

  return <div>{data?.data.team1?.name} vs {data?.data.team2?.name}</div>
}
\`\`\`

#### Countries

\`\`\`tsx
import { useCountries } from '@/hooks/use-countries'

function CountriesList() {
  // All countries
  const { data } = useCountries()

  // Qualified countries only
  const { data: qualifiedCountries } = useCountries({ qualified: true })

  // Countries in Group A
  const { data: groupACountries } = useCountries({ group: 'A' })
}
\`\`\`

#### Leaderboard

\`\`\`tsx
import { useLeaderboard, useUserStats } from '@/hooks/use-leaderboard'

function Leaderboard() {
  // Top 10 users by ETH won
  const { data } = useLeaderboard({ limit: 10, sort_by: 'total_won_eth' })

  // User's stats
  const userAddress = '0x1234...'
  const { data: userStats } = useUserStats(userAddress)

  return (
    <div>
      <h2>Your Stats</h2>
      <p>Total Won: {userStats?.data.total_won_eth} ETH</p>
      <p>Win Rate: {userStats?.data.win_rate}%</p>
    </div>
  )
}
\`\`\`

#### Tournament Groups & Standings

\`\`\`tsx
import {
  useTournamentGroups,
  useGroupStandings,
} from '@/hooks/use-groups'

function TournamentView({ tournamentId }: { tournamentId: string }) {
  // Fetch all groups with standings
  const { data: groups } = useTournamentGroups(tournamentId)

  return (
    <div>
      {groups?.data.map((group) => (
        <div key={group.id}>
          <h3>{group.display_name}</h3>
          <GroupStandings groupId={group.id} />
        </div>
      ))}
    </div>
  )
}

function GroupStandings({ groupId }: { groupId: string }) {
  const { data } = useGroupStandings(groupId)

  return (
    <table>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Team</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {data?.data.map((standing) => (
          <tr key={standing.id}>
            <td>{standing.position}</td>
            <td>{standing.country?.name}</td>
            <td>{standing.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
\`\`\`

### 2. Mutations (Creating/Updating Data)

\`\`\`tsx
import { useCreateMatch, useUpdateMatch } from '@/hooks/use-matches'

function AdminPanel() {
  const createMatch = useCreateMatch()
  const updateMatch = useUpdateMatch()

  const handleCreateMatch = () => {
    createMatch.mutate({
      team1_id: 'team-1-id',
      team2_id: 'team-2-id',
      contract_address: '0x...',
      match_start_time: '2026-06-15T18:00:00Z',
    }, {
      onSuccess: () => {
        console.log('Match created!')
      },
      onError: (error) => {
        console.error('Failed to create match:', error)
      },
    })
  }

  const handleUpdateMatch = (matchId: string) => {
    updateMatch.mutate({
      id: matchId,
      status: 'completed',
      winner_team_id: 'team-1-id',
    })
  }

  return (
    <div>
      <button onClick={handleCreateMatch} disabled={createMatch.isPending}>
        {createMatch.isPending ? 'Creating...' : 'Create Match'}
      </button>
    </div>
  )
}
\`\`\`

### 3. Loading & Error States

TanStack Query provides helpful states:

\`\`\`tsx
function MyComponent() {
  const { data, isLoading, isFetching, error, isError } = useMatches()

  // isLoading: true on initial load
  // isFetching: true whenever data is being fetched (including background refetch)
  // error: Error object if request failed
  // isError: true if there was an error

  if (isLoading) return <Spinner />
  if (isError) return <ErrorMessage error={error} />

  return <MatchesList matches={data?.data} />
}
\`\`\`

### 4. Manual Refetching

\`\`\`tsx
function RefreshButton() {
  const { refetch, isFetching } = useMatches()

  return (
    <button onClick={() => refetch()} disabled={isFetching}>
      {isFetching ? 'Refreshing...' : 'Refresh'}
    </button>
  )
}
\`\`\`

### 5. Cache Invalidation

Mutations automatically invalidate related queries, but you can also manually invalidate:

\`\`\`tsx
import { useQueryClient } from '@tanstack/react-query'
import { matchesKeys } from '@/hooks/use-matches'

function MyComponent() {
  const queryClient = useQueryClient()

  const invalidateMatches = () => {
    // Invalidate all matches queries
    queryClient.invalidateQueries({ queryKey: matchesKeys.all })

    // Invalidate specific match
    queryClient.invalidateQueries({ queryKey: matchesKeys.detail('match-id') })
  }

  return <button onClick={invalidateMatches}>Refresh Data</button>
}
\`\`\`

## Server-Side Caching

API routes use Next.js `unstable_cache` for server-side caching:

### Cache Times

- **Countries**: 1 day (rarely change)
- **Matches**: 1 hour (static metadata, live results from blockchain)
- **Leaderboard**: 15 minutes (updates when matches complete)
- **Tournament Groups**: 1 hour (structural data)
- **Group Standings**: 15 minutes (updates when matches complete)

### Cache Tags

Each endpoint has tags for targeted invalidation:

\`\`\`ts
// In API routes
revalidateTag('matches')         // Invalidate all matches
revalidateTag('countries')       // Invalidate all countries
revalidateTag('group-standings') // Invalidate all standings
revalidateTag('group-123')       // Invalidate specific group
\`\`\`

## API Endpoints Reference

### Qualification Phase Endpoints

**GET `/api/qualification/standings`**
- Returns live qualification rankings for all countries
- Response: `{ data: QualificationStanding[] }`
- Cache: 1 minute (live data)

**GET `/api/qualification/countries`**
- Returns all countries with vote stats
- Response: `{ data: Country[] }`
- Cache: 5 minutes

**POST `/api/qualification/vote`**
- Index a qualification vote transaction
- Body: `{ txHash: string, countryCode?: string }`
- Returns: Vote details after indexing

**GET `/api/qualification/user/:address`**
- Returns user's qualification votes and stats
- Response: `{ data: UserQualificationStats }`
- Cache: 30 seconds

**GET `/api/qualification/rewards/:address`**
- Returns claimable rewards for user
- Response: `{ data: { claimable_amount: number, votes_on_qualified: number } }`
- Only available after qualification ends
- Cache: 1 minute

**POST `/api/qualification/snapshot`**
- Admin endpoint to finalize top 48
- Body: `{ txHash: string }`
- Only callable after qualification deadline
- Requires admin authentication

**GET `/api/qualification/qualified`**
- Returns final top 48 countries
- Response: `{ data: QualifiedCountry[] }`
- Only available after snapshot
- Cache: 1 hour

### Tournament Phase Endpoints

**GET `/api/matches`**
- Returns all tournament matches
- Query params: `status`, `phase_id`, `group_id`, `limit`, `offset`
- Response: `{ data: Match[], count: number }`
- Cache: 1 hour

**GET `/api/matches/:id`**
- Returns match details
- Response: `{ data: Match }`
- Cache: 1 hour

**POST `/api/matches/:id/vote`**
- Index a match vote transaction
- Body: `{ txHash: string, team: number }`
- Returns: Vote details after indexing

**GET `/api/matches/:id/user/:address`**
- Returns user's votes for this match
- Response: `{ data: UserMatchStats }`
- Cache: 30 seconds

**GET `/api/matches/:id/rewards/:address`**
- Returns claimable winnings for user
- Response: `{ data: { claimable_amount: number, vote_count: number } }`
- Only available after match finalized
- Cache: 1 minute

**POST `/api/matches/:id/finalize`**
- Index match finalization transaction
- Body: `{ txHash: string }`
- Returns: Match result after indexing

## Direct API Client Usage

For custom requests, use the axios client directly:

\`\`\`ts
import { api } from '@/lib/api-client'

// GET request
const matches = await api.get('/matches')

// POST request
const newMatch = await api.post('/matches', {
  team1_id: '...',
  team2_id: '...',
})

// With query parameters
const votingMatches = await api.get('/matches', {
  params: { status: 'voting' },
})
\`\`\`

## TypeScript Types

All API responses are fully typed:

\`\`\`ts
import type {
  Match,
  Country,
  UserStats,
  GroupStanding,
  ApiResponse,
} from '@/lib/api-types'

// API response wrapper
type MatchesResponse = ApiResponse<Match[]>
// { data: Match[], count?: number, limit?: number, offset?: number }

// Individual types
const match: Match = {
  id: '...',
  team1_id: '...',
  status: 'voting', // Type-safe: 'upcoming' | 'voting' | 'completed'
  // ...
}
\`\`\`

## React Query DevTools

In development, React Query DevTools are available at the bottom of the page:

1. Click the floating React Query icon
2. View all queries and their cached data
3. Manually trigger refetches
4. Inspect query states and timings

## Best Practices

1. **Always use hooks** instead of fetching directly in components
2. **Let TanStack Query handle caching** - don't add your own
3. **Use query keys consistently** - use the exported `*Keys` objects
4. **Handle loading and error states** for better UX
5. **Invalidate related queries** after mutations
6. **Use optimistic updates** for better perceived performance

## Example: Full CRUD Component

\`\`\`tsx
import {
  useMatches,
  useCreateMatch,
  useUpdateMatch,
} from '@/hooks/use-matches'

function MatchesManager() {
  const { data: matches, isLoading } = useMatches()
  const createMatch = useCreateMatch()
  const updateMatch = useUpdateMatch()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {/* List */}
      {matches?.data.map((match) => (
        <div key={match.id}>
          <span>{match.team1?.name} vs {match.team2?.name}</span>
          <button
            onClick={() => updateMatch.mutate({
              id: match.id,
              status: 'completed',
            })}
          >
            Mark Complete
          </button>
        </div>
      ))}

      {/* Create */}
      <button
        onClick={() => createMatch.mutate({
          team1_id: 'team-1',
          team2_id: 'team-2',
          contract_address: '0x...',
          match_start_time: new Date().toISOString(),
        })}
      >
        Create Match
      </button>
    </div>
  )
}
\`\`\`

## Troubleshooting

### Data not updating after mutation

Make sure the mutation invalidates the correct query keys:

\`\`\`ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: matchesKeys.lists() })
}
\`\`\`

### Too many requests

TanStack Query deduplicates requests automatically. Check DevTools to see actual network activity.

### Stale data

Adjust `staleTime` in the query options:

\`\`\`ts
useMatches({}, {
  staleTime: 5 * 60 * 1000, // 5 minutes
})
\`\`\`
