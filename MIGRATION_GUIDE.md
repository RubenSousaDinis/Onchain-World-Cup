# Turborepo Migration Guide

This project has been restructured into a turborepo monorepo with two apps:

## Structure

```
onchain-world-cup-monorepo/
├── apps/
│   ├── landing/          # Landing page (onchainworldcup.xyz)
│   └── web/              # Main app (app.onchainworldcup.xyz)
├── packages/             # Shared packages (future)
├── package.json          # Root package.json with workspaces
└── turbo.json           # Turborepo configuration
```

## Required File Moves

All existing files from the root need to be moved into `apps/web/`:

### Move these directories:
- `app/` → `apps/web/app/`
- `components/` → `apps/web/components/`
- `hooks/` → `apps/web/hooks/`
- `lib/` → `apps/web/lib/`
- `providers/` → `apps/web/providers/`
- `public/` → `apps/web/public/`
- `scripts/` → `apps/web/scripts/`
- `styles/` → `apps/web/styles/`
- `test/` → `apps/web/test/`
- `contracts/` → `apps/web/contracts/` (if exists)

### Move these files:
- `hardhat.config.js` → `apps/web/hardhat.config.js`
- `components.json` → `apps/web/components.json`
- `.env.example` → `apps/web/.env.example`
- Any `.env` files → `apps/web/.env`

### Keep at root:
- `turbo.json` (already created)
- `package.json` (already updated)
- `.gitignore` (update if needed)
- `README.md` (update with new structure)

## Installation

After moving files:

```bash
# Install dependencies for all workspaces
npm install

# Run both apps in development
npm run dev

# Or run individually
cd apps/landing && npm run dev  # Port 3001
cd apps/web && npm run dev      # Port 3000

# Build all apps
npm run build

# Run tests
npm run test
```

## Deployment

### Landing Page (onchainworldcup.xyz)
- Deploy `apps/landing` to Vercel
- Set domain: `onchainworldcup.xyz`
- Root Directory: `apps/landing`

### Main App (app.onchainworldcup.xyz)
- Deploy `apps/web` to Vercel  
- Set domain: `app.onchainworldcup.xyz`
- Root Directory: `apps/web`
- Add all environment variables

## Environment Variables

Each app manages its own `.env` files:
- `apps/landing/.env` - Landing page env vars (if any)
- `apps/web/.env` - Main app env vars (Supabase, WalletConnect, etc.)

## Next Steps

1. Move all files as described above
2. Run `npm install` from root
3. Test both apps with `npm run dev`
4. Update deployment settings on Vercel
