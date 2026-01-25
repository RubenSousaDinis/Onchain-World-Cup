# How to Find Your Supabase Service Role Key

## Step-by-Step Instructions

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on your project from the list

3. **Navigate to Settings**
   - Look for the ⚙️ **Settings** icon in the left sidebar
   - Click on it

4. **Go to API Section**
   - In the Settings menu, click on **API**
   - This should show you all your API keys

5. **Find the Service Role Key**
   - Scroll down on the API page
   - Look for a section labeled **"Project API keys"** or **"API Keys"**
   - You should see:
     - **anon** `public` - This is the public/anonymous key (starts with `eyJ...`)
     - **service_role** `secret` - This is the service role key (also starts with `eyJ...` but is much longer)
   
   **Important**: The service role key might be:
   - Hidden behind a "Reveal" button - click it to show the key
   - At the bottom of the page - scroll down
   - In a collapsed section - expand it
   - Labeled as "service_role" or "secret" key

6. **Copy the Service Role Key**
   - Click the "Copy" button next to the service_role key
   - Or manually select and copy the entire key (it's a long JWT token)

## Visual Guide

The API page should look something like this:

```
Settings > API

Project URL
https://xxxxx.supabase.co
[Copy]

Project API keys
┌─────────────────────────────────────────┐
│ anon public                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│ [Copy] [Reveal]                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ service_role secret                     │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← THIS ONE!
│ [Copy] [Reveal]                         │
└─────────────────────────────────────────┘
```

## If You Still Can't Find It

If the service role key is not visible:

1. **Check if you're the project owner**
   - Only project owners can see the service role key
   - If you're a collaborator, ask the project owner for the key

2. **Check your Supabase plan**
   - Some older projects might have it in a different location
   - Try looking in: Settings > General > API Keys

3. **Alternative: Use the anon key with RLS disabled**
   - We can modify the code to use the anon key
   - But this requires disabling Row Level Security (RLS) on your tables
   - This is less secure but works for development

## Still Having Issues?

If you absolutely cannot find the service role key, we can:
1. Use the anon key instead (requires RLS changes)
2. Create a new Supabase project and get fresh keys
3. Contact Supabase support

Let me know which option you prefer!
