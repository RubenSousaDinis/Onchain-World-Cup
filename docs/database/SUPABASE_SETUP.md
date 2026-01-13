# Supabase Setup Guide

This guide walks you through setting up Supabase for the Crypto World Cup project.

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

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Never commit `.env.local` to git!

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**

2. Click **New Query**

3. Copy the entire contents of `docs/database/schema.sql`

4. Paste into the SQL editor

5. Click **Run** to execute

6. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `countries`, `matches`, `votes`, `user_stats`

## Step 5: (Optional) Add Sample Data

If you want to test with sample data:

1. In the SQL editor, uncomment the sample data INSERT statements at the bottom of `schema.sql`

2. Run the query

3. Verify data in Table Editor > `countries`

## Step 6: Test API Routes

1. Start the development server:

```bash
npm run dev
```

2. Test the API endpoints:

```bash
# Get all countries
curl http://localhost:3000/api/countries

# Create a country (you'll need to add this if you skipped sample data)
curl -X POST http://localhost:3000/api/countries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brazil",
    "code": "BRA",
    "flag_emoji": "🇧🇷",
    "fifa_rank": 1,
    "qualified": true
  }'

# Get matches
curl http://localhost:3000/api/matches
```

## Security Configuration (Optional but Recommended)

### Enable Row Level Security (RLS)

For production, enable RLS to add an extra security layer:

1. In Supabase dashboard, go to **Authentication** > **Policies**

2. For each table, create policies:

**Countries** - Public read:
```sql
CREATE POLICY "Public read access" ON countries
FOR SELECT TO anon USING (true);
```

**Matches** - Public read:
```sql
CREATE POLICY "Public read access" ON matches
FOR SELECT TO anon USING (true);
```

**Votes** - Public read:
```sql
CREATE POLICY "Public read access" ON votes
FOR SELECT TO anon USING (true);
```

**User Stats** - Public read:
```sql
CREATE POLICY "Public read access" ON user_stats
FOR SELECT TO anon USING (true);
```

For INSERT/UPDATE/DELETE, only allow service role (which we use in API routes).

## Architecture Overview

```
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
```

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

## Next Steps

1. ✅ Database schema created
2. ✅ API routes working
3. 🔲 Create event indexer to populate votes from blockchain
4. 🔲 Update frontend to fetch from API instead of mock data
5. 🔲 Add authentication for admin operations
6. 🔲 Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
