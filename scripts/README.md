# Database Seed Scripts

Scripts for populating the Crypto World Cup database with initial data.

## Prerequisites

Before running any seed scripts, ensure you have:

1. **Supabase Project Set Up**
   - Create a Supabase project at https://supabase.com
   - Run the database migrations in `docs/database/`

2. **Environment Variables**

   Create a `.env.local` file in the root directory with:
   \`\`\`bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   \`\`\`

   ⚠️ **Important**: Use the **Service Role Key**, not the anon key. The service role key has full database access needed for seeding.

## Available Scripts

### Seed Countries

Populates the database with all 48 countries participating in the 2026 World Cup.

**Run:**
\`\`\`bash
npm run seed:countries
\`\`\`

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
\`\`\`
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
\`\`\`

## Creating Additional Seed Scripts

To create a new seed script:

1. Create a new TypeScript file in `/scripts/`
2. Import the Supabase client:
   \`\`\`typescript
   import { getSupabaseClient } from '../lib/server/supabase'
   \`\`\`
3. Write your seed logic
4. Add a script to `package.json`:
   \`\`\`json
   "seed:your-script": "tsx scripts/your-script.ts"
   \`\`\`

### Example Seed Script Template

\`\`\`typescript
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
\`\`\`

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

## Utility Scripts

### Create GitHub Issues from Task Files

Creates GitHub Issues from markdown task files in `project/tasks/`. Each phase file becomes a GitHub issue.

**Prerequisites:**

1. **GitHub Personal Access Token**
   - Create a token at https://github.com/settings/tokens
   - Required scopes: `repo` (full control of private repositories) or `public_repo` (if repository is public)

2. **Environment Variables**

   Set the following environment variables:
   \`\`\`bash
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_OWNER=your-github-username
   GITHUB_REPO=your-repository-name
   \`\`\`

   Or create a `.env.local` file:
   \`\`\`
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_OWNER=your-github-username
   GITHUB_REPO=your-repository-name
   \`\`\`

**Run:**
\`\`\`bash
npm run create:github-issues
\`\`\`

Or directly:
\`\`\`bash
GITHUB_TOKEN=ghp_xxx GITHUB_OWNER=owner GITHUB_REPO=repo tsx scripts/create-github-issues.ts
\`\`\`

**What it does:**
- Reads all `phase-*.md` files from `project/tasks/`
- Parses each file to extract:
  - Phase number and title
  - Overview section
  - Full task content
- Creates GitHub Issues with:
  - Title: Phase name (e.g., "Phase 1: Project Setup & Database")
  - Body: Full markdown content from the task file
  - Labels: `phase` and `phase-N` (e.g., `phase-1`)
- Adds a reference link back to the original markdown file

**Example output:**
\`\`\`
Reading task files from /path/to/project/tasks...
Found 9 task files

Processing phase-1-project-setup.md...
  Creating issue: Phase 1: Project Setup & Database
  ✅ Created: #1 - https://github.com/owner/repo/issues/1

Processing phase-2-ui-ux.md...
  Creating issue: Phase 2: UI/UX Foundation & App Initialization
  ✅ Created: #2 - https://github.com/owner/repo/issues/2

...

============================================================
Summary
============================================================
Created 9 issues:

  #1: Phase 1: Project Setup & Database
    https://github.com/owner/repo/issues/1

  #2: Phase 2: UI/UX Foundation & App Initialization
    https://github.com/owner/repo/issues/2
  ...
\`\`\`

**Notes:**
- Issues are created sequentially with a 1-second delay between requests to respect GitHub API rate limits
- Each issue includes the full markdown content from the task file
- Labels are automatically added (you may need to create them in your repository first, or GitHub will create them)
- The script references the original markdown file path in each issue

**Next Steps:**

After creating issues, you can:
1. Create a GitHub Project and add these issues
2. Organize issues into milestones
3. Assign issues to team members
4. Add additional labels or custom fields in GitHub Projects
