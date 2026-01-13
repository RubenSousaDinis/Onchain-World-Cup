# Server-Side Utilities

⚠️ **WARNING: SERVER-SIDE ONLY** ⚠️

All files in this directory should **ONLY** be imported in:
- API routes (`app/api/**/route.ts`)
- Server components (React Server Components)
- Server actions

**DO NOT** import these files in:
- Client components (`"use client"`)
- Browser-side code
- Middleware that runs on the edge

## Files

### `supabase.ts`
Server-side Supabase client using the service role key.
- Has full admin access to the database
- Bypasses Row Level Security (RLS) policies
- Should only be used in trusted server environments

**Usage:**
```typescript
// ✅ CORRECT: In API route
// app/api/matches/route.ts
import { getSupabaseClient } from '@/lib/server/supabase'

export async function GET() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('matches').select('*')
  return Response.json({ data, error })
}
```

```typescript
// ❌ WRONG: In client component
// components/match-list.tsx
"use client"
import { getSupabaseClient } from '@/lib/server/supabase' // DON'T DO THIS!
```

## Security

- Service role keys have **full database access**
- Never expose service role keys to the client
- Use API routes as the security boundary
- Validate and sanitize all inputs in API routes
- Implement proper authorization checks

## Database Types

The `Database` interface in `supabase.ts` provides type safety for database queries.

To generate types from your Supabase schema:
```bash
npx supabase gen types typescript --project-id <your-project-id> > lib/server/database.types.ts
```
