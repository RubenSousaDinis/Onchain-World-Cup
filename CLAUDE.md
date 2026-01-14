# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Next.js application for ETH-based voting/betting on World Cup 2026 matches, powered by the Base network. The project uses a Turborepo monorepo structure with two apps: a main application (`app`) and a landing page (`landing`).

## Monorepo Structure

This is a Turborepo monorepo with the following workspace structure:
- `apps/app` - Main Next.js application with Web3 integration, smart contracts, and Supabase backend
- `apps/landing` - Marketing landing page (simpler Next.js app)
- Root `package.json` manages the monorepo with Turbo

## Common Commands

### Development
```bash
# Run all apps in development mode
npm run dev

# Run specific app only
npm run dev:app        # Main app on port 3000
npm run dev:landing    # Landing page on port 3001

# Build all apps
npm run build

# Lint all apps
npm run lint

# Run tests (app only)
npm run test

# Clean all build artifacts
npm run clean
```

### Smart Contract Development (in apps/app)
```bash
cd apps/app

# Compile contracts
npm run compile

# Run contract tests
npm run test

# Run tests with gas reporting
npm run test:gas

# Deploy contracts
npm run deploy:local      # Local Hardhat network
npm run deploy:sepolia    # Base Sepolia testnet
npm run deploy:mainnet    # Base mainnet

# Seed database with countries
npm run seed:countries
```

## Architecture

### Main App (`apps/app`)

**Tech Stack:**
- Next.js 16 with App Router
- wagmi v2 + viem v2 + Coinbase Wallet SDK for Web3
- Supabase (PostgreSQL) for indexed blockchain data
- Hardhat for smart contract development
- Tailwind CSS v4 with retro Championship Manager 01/02 theme
- Farcaster Mini App SDK integration

**Key Architectural Decisions:**

1. **Hybrid On-chain/Off-chain Architecture**
   - Smart contracts handle all voting logic and fund management
   - Supabase database indexes blockchain events for fast queries
   - Frontend reads from database but writes to blockchain
   - API routes (`app/api/**`) serve indexed data from Supabase

2. **Three Smart Contracts System**
   - `WorldCupMatch.sol` - Individual match voting contract with 2-phase pricing
   - `WorldCupEventHub.sol` - Centralized event logging hub
   - `WorldCupNFT.sol` - NFT rewards for participants
   - All contracts use OpenZeppelin v5.4.0

3. **Two-Phase Pricing Mechanism**
   - Phase 1 (0-2 hours): Linear pricing with 5% platform fee
   - Phase 2 (2-24 hours): Exponential pricing with 15% platform fee
   - Payouts based on vote count (not ETH amount) - early voters get more votes for less ETH
   - 90% to winners proportionally, 10% platform fee

4. **Database Schema**
   - Type-safe schema defined in `lib/server/supabase.ts`
   - Tables: countries, matches, votes, user_stats, tournaments, tournament_phases, groups, group_standings
   - Uses UUIDs for IDs, tracks blockchain transaction hashes
   - Server-side only with service role key (never exposed to client)

5. **Web3 Configuration**
   - wagmi config in `lib/wagmi-config.ts`
   - Supports Base (mainnet) and Base Sepolia (testnet)
   - Three wallet connectors: injected, Coinbase Smart Wallet, WalletConnect
   - Contract ABIs in `lib/contracts/`

### File Organization

**Frontend:**
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (UI patterns follow Championship Manager 01/02 aesthetic)
- `lib/` - Shared utilities, hooks, configs, and API clients
- `providers/` - React context providers (Web3, theme)
- `hooks/` - Custom React hooks

**Backend/Infrastructure:**
- `contracts/` - Solidity smart contracts
- `test/` - Hardhat contract tests
- `scripts/` - Deployment and seed scripts
- `lib/server/` - Server-only code (Supabase client, caching)

**Configuration:**
- `hardhat.config.js` - Hardhat networks and compiler settings
- `turbo.json` - Turborepo task pipeline configuration
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

### Critical Patterns

1. **Server vs Client Code**
   - `lib/server/supabase.ts` uses service role key - ONLY import in API routes/server components
   - Use `"use client"` directive for components with wagmi hooks or browser APIs
   - API routes in `app/api/` handle all database writes

2. **Smart Contract Interaction**
   - Read contract state via wagmi hooks (`useReadContract`)
   - Write to contracts via wagmi `useWriteContract` hook
   - Listen to events via EventHub for unified logging
   - Contract addresses come from environment variables

3. **Blockchain Event Indexing**
   - Events emitted by contracts are indexed into Supabase
   - Track indexed transactions to prevent duplicates
   - Block numbers and timestamps stored for historical queries

## Environment Variables

All environment variables are documented in `apps/app/.env.example`. Copy this file to `.env.local` and fill in your values:

```bash
cd apps/app
cp .env.example .env.local
```

### Required environment variables:

```bash
# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Deployment (for contract deployment)
PRIVATE_KEY=your_deployer_private_key
BASESCAN_API_KEY=your_basescan_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
REPORT_GAS=true  # Enable gas reporting in tests
```

## Setup Guides

Before development, ensure you have configured:

1. **Supabase** - Follow `apps/app/SUPABASE_SETUP.md` for:
   - Creating a Supabase project
   - Setting up environment variables
   - Creating database tables with SQL
   - Seeding initial data

2. **Environment Variables** - Copy `apps/app/.env.example` to `.env.local` and fill in:
   - Supabase credentials (URL and service role key)
   - WalletConnect project ID
   - Base network RPC URLs
   - (Optional) Deployment keys for smart contracts

## Documentation

Extensive planning and reference documentation in `/docs`:
- `/docs/planning/PLAN.md` - Comprehensive 9-phase implementation plan
- `/docs/planning/V0_CODE_REVIEW.md` - Code review and issues
- `/docs/planning/pricing_analysis.md` - Pricing mechanism details
- `/docs/reference/farcaster_docs.md` - Farcaster integration guide
- `/features` - Phase-by-phase implementation tasks

## Network Configuration

The app supports two Base networks:
- **Base Sepolia** (testnet) - Chain ID 84532
- **Base Mainnet** - Chain ID 8453

Hardhat is configured with both networks in `apps/app/hardhat.config.js`.

## Deployment

The main app is designed for Vercel deployment. The landing page can be deployed separately.

```bash
vercel deploy
```

Make sure all environment variables are set in Vercel project settings.

## Landing Page (`apps/landing`)

Simple marketing site built with Next.js 16 and Tailwind CSS v4. Runs on port 3001 in development. No Web3 or database dependencies.
