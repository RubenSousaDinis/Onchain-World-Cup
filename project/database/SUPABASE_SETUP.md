# Supabase Setup Guide

This guide walks you through setting up Supabase for the Onchain World Cup project.

## Overview

The Onchain World Cup has a **two-phase database structure**:
1. **Qualification Phase**: Rankings-based voting (no matches)
2. **Tournament Phase**: Match-based voting

Both phases require separate tables.

## Prerequisites

- Supabase account (https://supabase.com)
- Project repository cloned locally

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - **Name**: crypto-world-cup
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is sufficient for development

4. Wait for project to be provisioned (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**

2. Copy these values:
   - **Project URL** - Your Supabase URL
   - **anon public** key - Public API key (safe to expose)
   - **service_role** key - Secret key (NEVER expose in client!)

## Step 3: Configure Environment Variables

1. Create `.env.local` file in project root:

\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Edit `.env.local` and add your Supabase credentials:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

⚠️ **Important**: Never commit `.env.local` to git!

## Step 4: Create Database Tables

### Two-Phase Database Structure

The database requires tables for both qualification and tournament phases:

**Qualification Phase Tables:**
- `qualification_votes` - Votes cast during qualification
- `qualification_standings` - Live rankings
- `qualified_countries` - Final top 48

**Tournament Phase Tables:**
- `countries` - Country reference data
- `matches` - Tournament matches
- `tournament_votes` - Votes on matches (formerly `votes`)
- `groups` - Group stage groups
- `group_standings` - Group standings
- `user_stats` - User statistics

### Create Tables

1. In Supabase dashboard, go to **SQL Editor**

2. Click **New Query**

3. Copy the entire contents of `docs/database/schema.sql`

4. Paste into the SQL editor

5. Click **Run** to execute

6. Run the qualification tables migration:
   - Click **New Query**
   - Copy contents of `docs/database/migrations/001_qualification_tables.sql`
   - Click **Run**

7. Verify tables were created:
   - Go to **Table Editor**
   - You should see:
     - **Qualification**: `qualification_votes`, `qualification_standings`, `qualified_countries`
     - **Tournament**: `countries`, `matches`, `tournament_votes`, `groups`, `group_standings`
     - **Shared**: `user_stats`

## Step 5: (Optional) Add Sample Data

If you want to test with sample data:

1. In the SQL editor, uncomment the sample data INSERT statements at the bottom of `schema.sql`

2. Run the query

3. Verify data in Table Editor > `countries`

## Step 6: Test API Routes

1. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

2. Test the Qualification API endpoints:

\`\`\`bash
# Get qualification standings
curl http://localhost:3000/api/qualification/standings

# Get all countries
curl http://localhost:3000/api/qualification/countries

# Get qualified countries (only after qualification ends)
curl http://localhost:3000/api/qualification/qualified
\`\`\`

3. Test the Tournament API endpoints:

\`\`\`bash
# Get matches
curl http://localhost:3000/api/matches

# Get match by ID
curl http://localhost:3000/api/matches/[match-id]

# Get match votes
curl http://localhost:3000/api/matches/[match-id]/votes
\`\`\`

## Security Configuration (Optional but Recommended)

### Enable Row Level Security (RLS)

For production, enable RLS to add an extra security layer:

1. In Supabase dashboard, go to **Authentication** > **Policies**

2. For each table, create policies:

**Countries** - Public read:
\`\`\`sql
CREATE POLICY "Public read access" ON countries
FOR SELECT TO anon USING (true);
\`\`\`

**Matches** - Public read:
\`\`\`sql
CREATE POLICY "Public read access" ON matches
FOR SELECT TO anon USING (true);
\`\`\`

**Votes** - Public read:
\`\`\`sql
CREATE POLICY "Public read access" ON votes
FOR SELECT TO anon USING (true);
\`\`\`

**User Stats** - Public read:
\`\`\`sql
CREATE POLICY "Public read access" ON user_stats
FOR SELECT TO anon USING (true);
\`\`\`

For INSERT/UPDATE/DELETE, only allow service role (which we use in API routes).

## Architecture Overview

\`\`\`
┌─────────────────┐
│  Client (Web)   │
│   "use client"  │
└────────┬────────┘
         │ HTTP Requests
         │
         ▼
┌─────────────────┐
│   API Routes    │
│ /app/api/**/    │
│   (Server)      │
└────────┬────────┘
         │ Service Role Key
         │
         ▼
┌─────────────────┐
│   Supabase DB   │
│   PostgreSQL    │
└─────────────────┘
\`\`\`

**Key Points**:
- ✅ Clients call API routes via HTTP
- ✅ API routes use service role key
- ✅ Service role key NEVER exposed to client
- ✅ API routes validate inputs and enforce business logic

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"

- Make sure `.env.local` exists
- Make sure you copied the **service_role** key, not the anon key
- Restart dev server after adding env vars

### "Failed to fetch from Supabase"

- Check that Supabase project is active
- Verify URL is correct
- Check network/firewall settings

### "Relation does not exist"

- Make sure you ran the `schema.sql` script
- Check for SQL errors in the Supabase SQL Editor

### "Invalid API key"

- Regenerate keys in Supabase dashboard
- Update `.env.local` with new keys
- Restart dev server

## Database Migration Guide

### Adding Qualification Tables to Existing Database

If you already have tournament tables and need to add qualification tables:

1. Create migration file: `docs/database/migrations/001_qualification_tables.sql`

2. Add the following SQL:

\`\`\`sql
-- Qualification Votes Table
CREATE TABLE IF NOT EXISTS qualification_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42) NOT NULL,
  country_code CHAR(2) NOT NULL,
  amount_eth DECIMAL NOT NULL,
  fee_percent INTEGER NOT NULL,
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  block_number BIGINT NOT NULL,
  block_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qualification_votes_user ON qualification_votes(user_address);
CREATE INDEX idx_qualification_votes_country ON qualification_votes(country_code);
CREATE INDEX idx_qualification_votes_tx_hash ON qualification_votes(tx_hash);

-- Qualification Standings Table
CREATE TABLE IF NOT EXISTS qualification_standings (
  country_code CHAR(2) PRIMARY KEY,
  total_votes INTEGER DEFAULT 0 NOT NULL,
  total_eth DECIMAL DEFAULT 0 NOT NULL,
  rank INTEGER,
  is_qualified BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qualification_standings_rank ON qualification_standings(rank);

-- Qualified Countries Table
CREATE TABLE IF NOT EXISTS qualified_countries (
  country_code CHAR(2) PRIMARY KEY,
  final_rank INTEGER NOT NULL,
  total_votes INTEGER NOT NULL,
  total_eth DECIMAL NOT NULL,
  qualification_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qualified_countries_rank ON qualified_countries(final_rank);
\`\`\`

3. Run the migration in Supabase SQL Editor

### Updating Indexes

For optimal performance, ensure these indexes exist:

\`\`\`sql
-- Qualification phase indexes
CREATE INDEX IF NOT EXISTS idx_qualification_votes_user ON qualification_votes(user_address);
CREATE INDEX IF NOT EXISTS idx_qualification_votes_country ON qualification_votes(country_code);
CREATE INDEX IF NOT EXISTS idx_qualification_standings_rank ON qualification_standings(rank);

-- Tournament phase indexes
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_tournament_votes_match ON tournament_votes(match_id);
CREATE INDEX IF NOT EXISTS idx_tournament_votes_user ON tournament_votes(user_address);
\`\`\`

## Next Steps

1. ✅ Database schema created (both phases)
2. ✅ API routes working (qualification + tournament)
3. 🔲 Deploy QualificationContract to blockchain
4. 🔲 Create event indexer for qualification votes
5. 🔲 Create event indexer for tournament match votes
6. 🔲 Update frontend for two-phase UI
7. 🔲 Add authentication for admin operations (snapshot, match creation)
8. 🔲 Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
