# Database Seed Scripts

Scripts for populating the Crypto World Cup database with initial data.

## Prerequisites

Before running any seed scripts, ensure you have:

1. **Supabase Project Set Up**
   - Create a Supabase project at https://supabase.com
   - Run the database migrations in `docs/database/`

2. **Environment Variables**

   Create a `.env.local` file in the root directory with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   ⚠️ **Important**: Use the **Service Role Key**, not the anon key. The service role key has full database access needed for seeding.

## Available Scripts

### Seed Countries

Populates the database with all 48 countries participating in the 2026 World Cup.

**Run:**
```bash
npm run seed:countries
```

**What it does:**
- Checks if countries already exist
- Prompts for confirmation before clearing existing data
- Inserts all 48 countries with:
  - Name and country code (ISO 3166-1 alpha-3)
  - Flag emoji
  - FIFA ranking
  - Qualification status

**Data included:**
- 3 CONCACAF host nations (USA, Canada, Mexico)
- 16 UEFA teams (Europe)
- 6 CONMEBOL teams (South America)
- 9 CAF teams (Africa)
- 8 AFC teams (Asia)
- 1 OFC team (Oceania)
- 5 remaining slots (subject to qualification)

**Example output:**
```
🌍 Starting countries seed...

📝 Inserting 48 countries...

✅ Countries inserted successfully!

📊 Summary:
   Total countries: 48
   Qualified: 45
   Not yet qualified: 3

🌎 By Confederation:
   CONCACAF (Hosts): 3
   UEFA (Europe): ~16
   CONMEBOL (South America): ~6
   CAF (Africa): ~9
   AFC (Asia): ~8
   OFC (Oceania): ~1
   Remaining slots: ~5

🎉 Seed completed successfully!
```

## Creating Additional Seed Scripts

To create a new seed script:

1. Create a new TypeScript file in `/scripts/`
2. Import the Supabase client:
   ```typescript
   import { getSupabaseClient } from '../lib/server/supabase'
   ```
3. Write your seed logic
4. Add a script to `package.json`:
   ```json
   "seed:your-script": "tsx scripts/your-script.ts"
   ```

### Example Seed Script Template

```typescript
import { getSupabaseClient } from '../lib/server/supabase'

async function seedData() {
  console.log('🌱 Starting seed...')

  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('your_table')
      .insert([
        { /* your data */ }
      ])

    if (error) throw error

    console.log('✅ Seed completed!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedData()
```

## Troubleshooting

### Error: Missing environment variables

Ensure `.env.local` exists with both:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Error: Permission denied

Make sure you're using the **Service Role Key**, not the anon key. The service role key can be found in:
- Supabase Dashboard → Settings → API → Service Role Key

### Error: Table does not exist

Run the database migrations first:
1. Go to Supabase SQL Editor
2. Run the SQL from `docs/database/schema.sql`
3. Run any additional migrations in `docs/database/migrations/`

### Script hangs on confirmation

If running in a non-interactive environment (CI/CD), you may need to:
- Delete existing data manually first
- Or modify the script to skip confirmation

## Next Steps

After seeding countries, you may want to:

1. **Seed Tournaments**
   - Create tournament for 2026 World Cup
   - Set up tournament phases

2. **Seed Groups**
   - Create 12 groups (A-L) for the group stage
   - Assign countries to groups

3. **Seed Matches**
   - Create all group stage matches
   - Create knockout stage brackets

These scripts can be created following the same pattern as `seed-countries.ts`.
