# Frontend-Backend Architecture

This document explains how the frontend and backend interact securely without exposing API keys.

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (Browser)     │
└────────┬────────┘
         │
         │ ✅ Public GET requests (no API key)
         │ ❌ NEVER calls protected endpoints
         │
         ↓
┌─────────────────┐      ┌──────────────────┐
│  Public API     │      │  Protected API   │
│  Endpoints      │      │  Endpoints       │
│                 │      │                  │
│  GET /api/*     │      │  POST /api/*     │
│  Rate Limited   │      │  (Server-side    │
│  No Auth        │      │   only!)         │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         │                        │ ⚙️ Triggered by:
         │                        │ - Vercel Cron
         │                        │ - Admin tools
         │                        │ - Backend services
         │                        │
         ↓                        ↓
┌──────────────────────────────────┐
│        Database (Supabase)       │
│    Blockchain Data (Indexed)     │
└──────────────────────────────────┘
```

## ✅ Safe: Frontend Calls Public Endpoints

The frontend **NEVER needs API keys**. All data is accessed via public read endpoints:

### Example: React Component

```typescript
// components/CountryList.tsx
'use client'

import { useEffect, useState } from 'react'

export function CountryList() {
  const [countries, setCountries] = useState([])

  useEffect(() => {
    // ✅ SAFE - No API key needed
    fetch('/api/qualification/countries?limit=10&includeStats=true')
      .then(res => res.json())
      .then(data => setCountries(data.data))
  }, [])

  return (
    <div>
      {countries.map(country => (
        <div key={country.code}>
          {country.flag_emoji} {country.name} - {country.total_votes} votes
        </div>
      ))}
    </div>
  )
}
```

### Example: Vote Display

```typescript
// components/RecentVotes.tsx
'use client'

import { useEffect, useState } from 'react'

export function RecentVotes() {
  const [votes, setVotes] = useState([])

  useEffect(() => {
    // ✅ SAFE - Public endpoint, rate limited but no auth
    fetch('/api/qualification/votes?limit=5&sort=recent')
      .then(res => res.json())
      .then(data => setVotes(data.data))
  }, [])

  return (
    <div>
      <h2>Recent Votes</h2>
      {votes.map(vote => (
        <div key={vote.id}>
          {vote.voter_address} voted {vote.vote_count}x for {vote.country_code}
        </div>
      ))}
    </div>
  )
}
```

### Example: Leaderboard

```typescript
// app/leaderboard/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    // ✅ SAFE - No API key exposed
    fetch('/api/qualification/leaderboard?metric=votes&limit=100')
      .then(res => res.json())
      .then(data => setLeaders(data.data))
  }, [])

  return (
    <div>
      <h1>Top Voters</h1>
      {leaders.map(leader => (
        <div key={leader.wallet_address}>
          #{leader.rank} - {leader.wallet_address}: {leader.qualification_votes} votes
        </div>
      ))}
    </div>
  )
}
```

## ❌ Unsafe: What Frontend Should NEVER Do

```typescript
// ❌ NEVER DO THIS - Exposes API key to browser!
const API_KEY = process.env.NEXT_PUBLIC_API_KEY // BAD: NEXT_PUBLIC_ exposes to browser!

fetch('/api/indexer/sync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}` // ❌ Exposed in browser devtools!
  },
  body: JSON.stringify({ chainId: 84532 })
})
```

**Why this is dangerous:**
1. Anyone can open browser DevTools → Network tab
2. See the API key in request headers
3. Steal it and abuse your API
4. Cause unlimited costs by spamming indexer sync

## ⚙️ How Blockchain Indexing Works

### Automatic Syncing (Recommended)

**Vercel Cron Job** - Runs once daily at midnight UTC on the server (Hobby plan limitation):

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/indexer-sync",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Flow:**
```
1. Vercel Cron triggers (server-side, daily at midnight UTC)
2. Calls /api/cron/indexer-sync with CRON_SECRET
3. Fetches events from blockchain (RPC call)
4. Updates database with new votes/events
5. Frontend fetches fresh data from database (public endpoints)
```

**Security:**
- ✅ Runs server-side (never in browser)
- ✅ CRON_SECRET never exposed
- ✅ No API key needed for frontend
- ✅ Automatic, no manual intervention

### Manual Syncing (Admin Only)

For manual syncing (admin tools, debugging):

```typescript
// Server-side admin tool or API route
// This code runs on the server, NOT in browser

export async function POST(request: NextRequest) {
  // Verify admin authentication first
  const session = await getSession(request)
  if (!session?.isAdmin) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Now safe to call protected endpoint with API key from env
  const response = await fetch('http://localhost:3101/api/indexer/sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.API_SECRET_KEYS}`, // ✅ Server-side only
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chainId: 84532 })
  })

  return response
}
```

## 📊 Complete Data Flow

### 1. User Votes on Blockchain
```
User's Wallet
    ↓
Smart Contract (Base blockchain)
    ↓
VotePlaced Event Emitted
```

### 2. Indexer Syncs Events
```
Vercel Cron (every 5 min)
    ↓
/api/cron/indexer-sync (server-side)
    ↓
Fetches events from blockchain
    ↓
Updates database (Supabase)
```

### 3. Frontend Displays Data
```
React Component (browser)
    ↓
fetch('/api/qualification/votes')  ← Public endpoint, no auth
    ↓
Reads from database
    ↓
Returns cached data
    ↓
User sees recent votes
```

## 🔒 Security Model

### Public Endpoints (Frontend Safe)
```typescript
// All these are SAFE for frontend to call:
GET /api/countries
GET /api/qualification/countries
GET /api/qualification/countries/[code]
GET /api/qualification/votes
GET /api/qualification/leaderboard
GET /api/qualification/summary
GET /api/users/[address]
GET /api/indexer/sync  // Read-only status check
```

**Protection:**
- Rate limited (100-20 requests per minute)
- Cached responses (reduces database load)
- No authentication required
- No sensitive operations

### Protected Endpoints (Server-Side Only)
```typescript
// NEVER call from frontend:
POST /api/indexer/sync       // Requires API_SECRET_KEYS
POST /api/admin/*            // Requires API_SECRET_KEYS (future)
```

**Protection:**
- Requires API key in Authorization header
- Very strict rate limiting (5 requests per minute)
- Only accessible from:
  - Vercel Cron (via /api/cron/indexer-sync)
  - Server-side admin tools
  - Backend services

### Cron Endpoints (Vercel Only)
```typescript
// Called by Vercel Cron:
GET /api/cron/indexer-sync   // Requires CRON_SECRET
```

**Protection:**
- Requires CRON_SECRET in Authorization header
- Only Vercel Cron can call it
- Runs server-side
- No frontend access

## 🚀 Production Setup

### 1. Set Environment Variables in Vercel

```bash
# For manual admin syncing (optional)
API_SECRET_KEYS=<generated-key>

# For automatic cron syncing (recommended)
CRON_SECRET=<generated-key>

# Chain to index
INDEXER_CHAIN_ID=8453  # Base Mainnet
```

### 2. Configure Cron Job

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/indexer-sync",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add `CRON_SECRET` = `<your-generated-secret>`
3. Deploy
4. Cron will start running automatically

### 3. Frontend Deployment

**No special configuration needed!**
- Frontend just calls public API endpoints
- No environment variables needed
- No API keys to configure
- Works out of the box

## 🧪 Testing

### Test Frontend Access (Public)
```typescript
// This should work from browser console:
fetch('/api/qualification/countries?limit=5')
  .then(r => r.json())
  .then(console.log)

// Response:
// { data: [...], count: 192, limit: 5, offset: 0 }
```

### Test Protected Access (Should Fail from Browser)
```typescript
// This should fail from browser console:
fetch('/api/indexer/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chainId: 84532 })
})
  .then(r => r.json())
  .then(console.log)

// Response:
// { error: "Unauthorized", message: "Valid API key required..." }
```

### Test Cron Endpoint (Should Fail from Browser)
```typescript
// This should fail from browser:
fetch('/api/cron/indexer-sync')
  .then(r => r.json())
  .then(console.log)

// Response:
// { error: "Unauthorized", message: "Invalid cron secret" }
```

## 🎯 Best Practices

### ✅ DO:
- Call public read endpoints from frontend
- Use server-side rendering for sensitive data
- Let Vercel Cron handle automatic syncing
- Keep API keys in server environment variables only
- Use rate limit headers to avoid hitting limits
- Cache data on the frontend to reduce API calls

### ❌ DON'T:
- Expose API keys in frontend code
- Call protected endpoints from browser
- Use NEXT_PUBLIC_ prefix for secrets
- Store API keys in localStorage/cookies
- Bypass rate limiting with multiple accounts
- Call indexer sync from frontend

## 📚 Related Documentation

- [API Security](./API_SECURITY.md) - Rate limiting and authentication
- [API Documentation](./QUALIFICATION_API.md) - All endpoints
- [Wallet Integration](./WALLET_INTEGRATION.md) - Web3 integration

## ❓ FAQ

**Q: How does the frontend get fresh data after a vote?**
A: The frontend calls public endpoints every few seconds or uses polling. The cron job syncs blockchain events to the database automatically.

**Q: Can I call /api/indexer/sync from frontend?**
A: No! Use the cron job for automatic syncing. For manual syncing, create a server-side admin tool.

**Q: What if I need real-time updates?**
A: Use polling (fetch every 5-10 seconds) or WebSockets (future enhancement). The public endpoints are cached and fast.

**Q: How do I debug the indexer?**
A: Check Vercel logs for cron job output. You can also call GET /api/indexer/sync to see the last indexed block.

**Q: Can I disable rate limiting for my app?**
A: Rate limiting protects your costs. Instead of disabling it, increase limits in `lib/rate-limit.ts` if needed.
