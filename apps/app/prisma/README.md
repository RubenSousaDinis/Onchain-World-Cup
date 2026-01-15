# Prisma ORM for Onchain World Cup

This directory contains the Prisma schema and configuration for database access using Prisma ORM.

## Current Schema: Qualification Phase Only

The database schema is currently simplified for the **qualification phase** where users vote on which countries will qualify for the World Cup 2026. The schema will be expanded in later phases to include matches, tournaments, and group stages.

**Current tables:**
- `qualification_votes` - User votes on countries
- `user_stats` - Leaderboard and statistics

**Static data:**
- Countries are stored in `data/countries.json` (not in database)

## Overview

Prisma provides a type-safe database client for working with the Supabase PostgreSQL database. While the app also uses the Supabase client directly for some operations, Prisma offers:

- **Type safety** - Auto-generated types based on your schema
- **Better DX** - Intuitive query API with autocomplete
- **Migrations** - Database schema version control
- **Prisma Studio** - Visual database browser

## When to Use Prisma vs Supabase Client

### Use Prisma Client when:
- Building backend API routes with complex queries
- Need strong type safety for database operations
- Working with joins and relations
- Performing batch operations

### Use Supabase Client when:
- Need real-time subscriptions
- Using Supabase-specific features (Auth, Storage, RLS)
- Simple CRUD operations in client components (via API routes)

## Setup

### 1. Configure Environment Variables

Add these to your `.env.local`:

```bash
# Connection pooler URL (for general queries)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings → Database**
3. Scroll to **Connection String → Connection pooling**
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

**Important:**
- `DATABASE_URL` uses port `6543` (connection pooler) with `?pgbouncer=true`
- `DIRECT_URL` uses port `5432` (direct connection) without pgbouncer parameter

### 2. Generate Prisma Client

After setting up environment variables:

```bash
npm run prisma:generate
```

This creates the type-safe Prisma Client in `node_modules/@prisma/client`.

### 3. Push Schema to Database (Optional)

If you haven't created the tables via SQL yet:

```bash
npm run prisma:push
```

This will sync your Prisma schema to the Supabase database.

## Available Scripts

```bash
# Generate Prisma Client (auto-runs after npm install)
npm run prisma:generate

# Open Prisma Studio (visual database browser)
npm run prisma:studio

# Push schema changes to database (no migrations)
npm run prisma:push

# Pull schema from database (introspection)
npm run prisma:pull

# Create and apply migrations (recommended for production)
npm run prisma:migrate
```

## Usage Example

### Qualification Phase Schema

The current schema is simplified for the qualification phase only:
- **QualificationVote** - User votes on which countries will qualify
- **UserStat** - Leaderboard and user statistics

### Query Qualification Votes

```typescript
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Get all votes for a specific country
  const brazilVotes = await prisma.qualificationVote.findMany({
    where: {
      countryCode: 'BR'
    },
    orderBy: {
      blockTimestamp: 'desc'
    }
  })

  return Response.json({ votes: brazilVotes })
}
```

### Get User Votes

```typescript
// Get all votes by a specific user
const userVotes = await prisma.qualificationVote.findMany({
  where: {
    walletAddress: '0x123...'
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### Leaderboard Query

```typescript
// Get top 10 users by total ETH spent
const leaderboard = await prisma.userStat.findMany({
  orderBy: {
    totalSpentEth: 'desc'
  },
  take: 10
})
```

### Aggregate Votes by Country

```typescript
// Get total votes and ETH per country
const votesByCountry = await prisma.qualificationVote.groupBy({
  by: ['countryCode'],
  _count: {
    id: true
  },
  _sum: {
    amountEth: true
  },
  orderBy: {
    _sum: {
      amountEth: 'desc'
    }
  }
})
```

### Query Votes

```typescript
// Get all votes for a specific match
const matchVotes = await prisma.vote.findMany({
  where: {
    matchId: matchId
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### Get User Votes

```typescript
// Get all votes by a specific user
const userVotes = await prisma.vote.findMany({
  where: {
    voterAddress: '0x123...'
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### Leaderboard Query

```typescript
// Get top 10 users by total ETH spent
const leaderboard = await prisma.userStat.findMany({
  orderBy: {
    totalSpentEth: 'desc'
  },
  take: 10
})
```

### Best Practices

1. **Singleton Pattern** - Create a single Prisma Client instance

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

2. **Always Close Connections** - Though not required in serverless environments

```typescript
// Only needed in long-running processes
await prisma.$disconnect()
```

3. **Use Transactions for Multiple Operations**

```typescript
await prisma.$transaction([
  prisma.vote.create({ data: voteData }),
  prisma.userStat.update({
    where: { walletAddress },
    data: { totalVotes: { increment: 1 } }
  })
])
```

## Schema Management

The schema is defined in `schema.prisma` and matches the existing Supabase database structure. The schema includes models for the full tournament system: countries, tournaments, phases, groups, matches, votes, and user statistics.

### Making Schema Changes

1. Update `schema.prisma`
2. Push changes to database:
   ```bash
   npm run prisma:push
   ```
3. Regenerate client:
   ```bash
   npm run prisma:generate
   ```

### Creating Migrations (Recommended for Production)

```bash
npm run prisma:migrate
# Follow prompts to name your migration
```

## Troubleshooting

### Error: "Can't reach database server"

- Check your `DATABASE_URL` in `.env.local`
- Ensure Supabase project is active (not paused)
- Verify database password is correct

### Error: "Prepared statements not supported"

- Use `?pgbouncer=true` in your `DATABASE_URL`
- This disables prepared statements for connection pooling

### Schema Out of Sync

If the database schema diverges from Prisma schema:

```bash
# Pull current database schema
npm run prisma:pull

# This will overwrite your schema.prisma
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
