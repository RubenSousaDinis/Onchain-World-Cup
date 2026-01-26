# Qualification API Documentation

This document describes the API endpoints for accessing blockchain-indexed qualification data.

## Overview

The qualification system indexes blockchain events from the `WorldCupQualification` contract and stores them in a PostgreSQL database. The API provides read access to this indexed data with caching for optimal performance.

## Architecture

```
┌─────────────┐
│  Blockchain │
│   (Base)    │
└──────┬──────┘
       │ Events
       ↓
┌─────────────┐
│   Indexer   │──→ /api/indexer/sync
│   Service   │
└──────┬──────┘
       │ Processes
       ↓
┌─────────────┐
│  PostgreSQL │
│  (Supabase) │
└──────┬──────┘
       │ Queries
       ↓
┌─────────────┐
│ API Routes  │──→ /api/qualification/*
└─────────────┘
```

## Endpoints

### 1. Indexer Sync

#### `POST /api/indexer/sync`

Trigger blockchain event indexing and database updates.

**Request Body:**
```json
{
  "chainId": 84532
}
```

**Parameters:**
- `chainId` (required): `84532` for Base Sepolia or `8453` for Base Mainnet

**Response:**
```json
{
  "success": true,
  "chainId": 84532,
  "blockRange": {
    "from": "10000",
    "to": "10100"
  },
  "processed": {
    "votes": 45,
    "qualifications": 0,
    "claims": 2,
    "countries": 0
  },
  "message": "Successfully indexed 47 events"
}
```

**Usage:**
- Can be triggered on-demand
- Can be called by Vercel cron job for automatic indexing
- Can be called by external monitoring services

#### `GET /api/indexer/sync?chainId=84532`

Get indexer status and last synced block.

**Response:**
```json
{
  "chainId": 84532,
  "lastIndexedBlock": "10100",
  "status": "ready",
  "message": "Indexer is ready. Call POST /api/indexer/sync to sync events."
}
```

---

### 2. Country Statistics

#### `GET /api/qualification/countries`

Fetch statistics for all countries.

**Query Parameters:**
- `qualified` (optional): `'true'` or `'false'` - Filter by qualification status
- `sort` (optional): `'votes'` (default), `'eth'`, or `'code'` - Sort field
- `order` (optional): `'desc'` (default) or `'asc'` - Sort order
- `limit` (optional): Number, default `50`, max `100`
- `offset` (optional): Number, default `0`

**Examples:**
```bash
# Get top 10 countries by votes
GET /api/qualification/countries?limit=10

# Get qualified countries
GET /api/qualification/countries?qualified=true

# Get countries sorted by ETH
GET /api/qualification/countries?sort=eth&order=desc
```

**Response:**
```json
{
  "data": [
    {
      "country_code": "US",
      "total_votes": 1234,
      "total_eth": "5.432",
      "qualified": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-20T15:45:00.000Z"
    }
  ],
  "count": 32,
  "limit": 50,
  "offset": 0
}
```

**Caching:** 5 minutes

---

#### `GET /api/qualification/countries/[code]`

Fetch detailed statistics for a specific country.

**Example:**
```bash
GET /api/qualification/countries/US
```

**Response:**
```json
{
  "data": {
    "country_code": "US",
    "total_votes": 1234,
    "total_eth": "5.432",
    "qualified": false,
    "rank": 3,
    "top_voters": [
      {
        "voter_address": "0x1234...5678",
        "total_votes": 150
      },
      {
        "voter_address": "0xabcd...ef01",
        "total_votes": 120
      }
    ],
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-20T15:45:00.000Z"
  }
}
```

**Caching:** 5 minutes

---

### 3. Vote History

#### `GET /api/qualification/votes`

Fetch vote history with filtering and pagination.

**Query Parameters:**
- `country` (optional): Country code (e.g., `'US'`) - Filter by country
- `voter` (optional): Wallet address - Filter by voter
- `sort` (optional): `'recent'` (default), `'oldest'`, `'votes'`, or `'cost'`
- `limit` (optional): Number, default `20`, max `100`
- `offset` (optional): Number, default `0`

**Examples:**
```bash
# Get recent votes
GET /api/qualification/votes?limit=10

# Get votes for a specific country
GET /api/qualification/votes?country=US

# Get votes by a specific user
GET /api/qualification/votes?voter=0x1234...5678

# Get largest votes
GET /api/qualification/votes?sort=votes&limit=5
```

**Response:**
```json
{
  "data": [
    {
      "id": "cm123abc",
      "country_code": "US",
      "voter_address": "0x1234...5678",
      "vote_count": 10,
      "total_cost_eth": "0.05",
      "tx_hash": "0xabcd...ef01",
      "block_number": 10050,
      "created_at": "2024-01-20T15:45:00.000Z"
    }
  ],
  "count": 145,
  "limit": 20,
  "offset": 0
}
```

**Caching:** 1 minute

---

### 4. Leaderboard

#### `GET /api/qualification/leaderboard`

Fetch top users by various metrics.

**Query Parameters:**
- `metric` (optional): `'votes'` (default), `'spent'`, or `'countries'`
  - `'votes'`: Sort by total qualification votes
  - `'spent'`: Sort by total ETH spent
  - `'countries'`: Sort by number of countries voted for
- `limit` (optional): Number, default `10`, max `100`
- `offset` (optional): Number, default `0`

**Examples:**
```bash
# Get top 10 voters
GET /api/qualification/leaderboard

# Get top users by ETH spent
GET /api/qualification/leaderboard?metric=spent

# Get most diverse voters (voted for most countries)
GET /api/qualification/leaderboard?metric=countries&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "rank": 1,
      "wallet_address": "0x1234...5678",
      "qualification_votes": 450,
      "qualification_spent_eth": "12.5",
      "qualification_won_eth": "0",
      "countries_voted_for": 8,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-20T15:45:00.000Z"
    }
  ],
  "count": 234,
  "limit": 10,
  "offset": 0,
  "metric": "votes"
}
```

**Caching:** 5 minutes

---

### 5. Summary

#### `GET /api/qualification/summary`

Fetch overall qualification statistics and highlights.

**Response:**
```json
{
  "data": {
    "total_votes": 12450,
    "total_eth": "345.678",
    "total_countries": 32,
    "total_voters": 234,
    "qualified_count": 0,
    "top_countries": [
      {
        "country_code": "US",
        "total_votes": 1234,
        "total_eth": "45.6",
        "qualified": false
      }
    ],
    "recent_votes": [
      {
        "id": "cm123abc",
        "country_code": "BR",
        "voter_address": "0x1234...5678",
        "vote_count": 5,
        "total_cost_eth": "0.025",
        "tx_hash": "0xabcd...ef01",
        "created_at": "2024-01-20T15:45:00.000Z"
      }
    ],
    "top_voters": [
      {
        "rank": 1,
        "wallet_address": "0x1234...5678",
        "qualification_votes": 450,
        "qualification_spent_eth": "12.5",
        "countries_voted_for": 8
      }
    ]
  }
}
```

**Caching:** 5 minutes

---

### 6. User Statistics

#### `GET /api/users/[address]`

Fetch statistics and vote history for a specific user (existing endpoint, includes qualification data).

**Example:**
```bash
GET /api/users/0x1234567890123456789012345678901234567890
```

**Response:**
```json
{
  "data": {
    "id": "cm123abc",
    "wallet_address": "0x1234...5678",
    "qualification_votes": 450,
    "qualification_spent_eth": "12.5",
    "qualification_won_eth": "0",
    "countries_voted_for": 8,
    "total_votes": 450,
    "total_spent_eth": "12.5",
    "total_won_eth": "0",
    "rank": 1,
    "onboarding_completed_at": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-20T15:45:00.000Z",
    "votes": [
      {
        "id": "cm456def",
        "country_code": "US",
        "voter_address": "0x1234...5678",
        "vote_count": 10,
        "total_cost_eth": "0.5",
        "tx_hash": "0xabcd...ef01",
        "block_number": 10050,
        "created_at": "2024-01-20T15:00:00.000Z"
      }
    ]
  }
}
```

---

## Caching Strategy

All endpoints implement a two-layer caching strategy:

1. **Next.js Data Cache** (`unstable_cache`):
   - In-memory cache with revalidation
   - Tagged for selective invalidation
   - Revalidation periods:
     - Countries: 5 minutes
     - Votes: 1 minute
     - Leaderboard: 5 minutes
     - Summary: 5 minutes

2. **HTTP Cache** (`Cache-Control` headers):
   - Browser and CDN caching
   - `stale-while-revalidate` for better UX
   - Configured per endpoint

## Error Responses

All endpoints use consistent error formatting:

**400 Bad Request:**
```json
{
  "error": "Invalid chainId. Must be 84532 (Base Sepolia) or 8453 (Base Mainnet)"
}
```

**404 Not Found:**
```json
{
  "error": "Country not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "details": "Detailed error message"
}
```

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production:

- User-specific limits: 100 requests/minute
- IP-based limits: 1000 requests/minute
- Indexer sync: 1 request/minute

## Monitoring

For production, implement monitoring for:

1. **Indexer Health:**
   - Last indexed block timestamp
   - Time since last successful sync
   - Number of failed sync attempts

2. **API Performance:**
   - Response times per endpoint
   - Cache hit rates
   - Error rates

3. **Database Load:**
   - Query execution times
   - Connection pool usage
   - Slow query alerts

## Usage Examples

### Frontend Integration

```typescript
// Fetch country statistics
const response = await fetch('/api/qualification/countries?limit=10')
const { data } = await response.json()

// Get specific country
const countryResponse = await fetch('/api/qualification/countries/US')
const { data: country } = await countryResponse.json()

// Get leaderboard
const leaderboardResponse = await fetch('/api/qualification/leaderboard?metric=votes')
const { data: leaders } = await leaderboardResponse.json()

// Get summary
const summaryResponse = await fetch('/api/qualification/summary')
const { data: summary } = await summaryResponse.json()
```

### Cron Job for Indexing

```typescript
// vercel.json or cron configuration
{
  "crons": [
    {
      "path": "/api/indexer/sync",
      "schedule": "*/5 * * * *" // Every 5 minutes
    }
  ]
}
```

## Related Documentation

- [Wallet Integration Guide](./WALLET_INTEGRATION.md) - How to connect wallets and interact with contracts
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration
- [Environment Variables](./.env.example) - Required configuration

## Support

For issues or questions:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Development: Check console logs with `[Indexer]` or `[API]` prefixes
