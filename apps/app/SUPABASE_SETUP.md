# Supabase Setup Guide

This guide walks you through setting up Supabase for the Onchain World Cup application.

## Prerequisites

- A GitHub account (for Supabase authentication)
- Basic knowledge of PostgreSQL (helpful but not required)

## Step 1: Create a Supabase Project

1. **Go to [Supabase](https://supabase.com/)** and sign in with GitHub

2. **Click "New Project"**
   - Organization: Select or create an organization
   - Project Name: `onchain-world-cup` (or your preferred name)
   - Database Password: Generate a strong password and save it securely
   - Region: Choose the region closest to your users (e.g., US West, EU Central)
   - Pricing Plan: **Free tier** (500 MB database storage, perfect for getting started)

3. **Wait for project creation** (usually takes 1-2 minutes)

## Step 2: Get Your Environment Variables

1. **Navigate to Project Settings**
   - Click on the ⚙️ **Settings** icon in the left sidebar
   - Go to **API** section

2. **Copy the required credentials:**

   **Project URL:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   ```

   **Service Role Key** (⚠️ **Keep this secret!**):
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Create `.env.local` file**
   ```bash
   cd apps/app
   cp .env.example .env.local
   ```

4. **Add your credentials** to `.env.local`
   ```bash
   # Paste your actual values here
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 3: Create Database Tables

The application requires the following tables. You can create them using the Supabase SQL Editor.

### Option A: Using Supabase SQL Editor (Recommended)

1. **Navigate to SQL Editor**
   - Click on the 🔧 **SQL Editor** icon in the left sidebar

2. **Run the following SQL** to create all tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries table
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  flag_emoji TEXT NOT NULL,
  fifa_rank INTEGER,
  "group" TEXT,
  qualified BOOLEAN NOT NULL DEFAULT false,
  tournament_id UUID,
  qualification_status TEXT CHECK (qualification_status IN ('competing', 'qualified', 'eliminated', 'host')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  host_countries TEXT[] NOT NULL,
  total_teams INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'qualification', 'group_stage', 'knockout', 'completed')),
  current_phase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournament phases table
CREATE TABLE tournament_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  phase_order INTEGER NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  max_teams INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group standings table
CREATE TABLE group_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  vote_difference INTEGER GENERATED ALWAYS AS (votes_for - votes_against) STORED,
  points INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  qualified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, country_id)
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team1_id UUID NOT NULL REFERENCES countries(id),
  team2_id UUID NOT NULL REFERENCES countries(id),
  contract_address TEXT NOT NULL,
  match_start_time TIMESTAMPTZ NOT NULL,
  voting_end_time TIMESTAMPTZ NOT NULL,
  match_end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'voting', 'completed')),
  winning_team INTEGER CHECK (winning_team IN (0, 1)),
  tournament_id UUID REFERENCES tournaments(id),
  phase_id UUID REFERENCES tournament_phases(id),
  group_id UUID REFERENCES groups(id),
  match_number INTEGER,
  is_qualification BOOLEAN NOT NULL DEFAULT false,
  team1_score INTEGER,
  team2_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL,
  team_index INTEGER NOT NULL CHECK (team_index IN (0, 1)),
  vote_count INTEGER NOT NULL,
  total_cost_eth TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  block_number BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User stats table
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  total_votes INTEGER NOT NULL DEFAULT 0,
  total_spent_eth TEXT NOT NULL DEFAULT '0',
  total_won_eth TEXT NOT NULL DEFAULT '0',
  matches_participated INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_qualified ON countries(qualified);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_votes_match ON votes(match_id);
CREATE INDEX idx_votes_voter ON votes(voter_address);
CREATE INDEX idx_user_stats_wallet ON user_stats(wallet_address);
CREATE INDEX idx_group_standings_group ON group_standings(group_id);
CREATE INDEX idx_tournament_phases_tournament ON tournament_phases(tournament_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_phases_updated_at BEFORE UPDATE ON tournament_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_standings_updated_at BEFORE UPDATE ON group_standings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. **Click "Run"** to execute the SQL

### Option B: Using Supabase CLI (Alternative)

If you prefer using the CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Run migrations (if you create migration files)
supabase db push
```

## Step 4: Configure Row Level Security (RLS)

For production, you should enable Row Level Security to protect your data.

1. **Navigate to Authentication > Policies** in Supabase

2. **Enable RLS for sensitive tables** (optional for now, but recommended for production)

For development, you can leave RLS disabled since the app uses the service role key which bypasses RLS.

## Step 5: Seed Initial Data

Seed the countries table with initial data:

```bash
cd apps/app
npm run seed:countries
```

This will populate the `countries` table with all participating nations.

## Step 6: Verify Setup

1. **Check tables were created**
   - Go to **Table Editor** in Supabase
   - You should see all 8 tables listed

2. **Test the connection** by running the dev server:
   ```bash
   npm run dev
   ```

3. **Check API endpoints** work:
   - Visit http://localhost:3000/api/countries
   - You should see the seeded countries data

## Troubleshooting

### "Missing NEXT_PUBLIC_SUPABASE_URL" Error

Make sure your `.env.local` file exists in `apps/app/` directory and contains the correct URL.

### "Service role key" Error

Double-check you copied the **service role key**, not the anon/public key. The service role key is longer and starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`.

### Connection Timeout

Check your Supabase project is in the "Active" state in the Supabase dashboard.

### Tables Not Created

Make sure you ran the SQL in Step 3 successfully. Check the SQL Editor for any error messages.

## Next Steps

- ✅ Phase 1.2 Complete - Supabase is set up!
- 📝 Continue to Phase 1.3: Configure Prisma ORM (if using Prisma)
- 🚀 Start building features using Supabase

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
