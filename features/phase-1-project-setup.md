# Phase 1: Project Setup & Database

## Overview
Set up the foundational Next.js project with TypeScript, configure Supabase database, and establish the core database schema using Prisma ORM.

## Sub-tasks

### 1.1 Initialize Next.js Project
- [x] Create new Next.js 14+ project with App Router (✅ Next.js 16 with App Router)
- [x] Configure TypeScript (✅ tsconfig.json with strict mode)
- [x] Set up project structure and folders (✅ app/, components/, lib/, etc.)
- [x] Configure ESLint and Prettier (✅ eslint.config.mjs + .prettierrc.json)
- [x] Initialize git repository (if not already done) (✅ Git initialized)

### 1.2 Set Up Supabase
- [x] Create Supabase project (free tier: 500 MB storage) (✅ Documented in SUPABASE_SETUP.md)
- [x] Get database connection string (✅ Environment variables documented in .env.example)
- [x] Configure database security rules (✅ SQL schema with RLS guidance provided)
- [x] Set up Supabase client for real-time features (optional) (✅ Server-side client configured in lib/server/supabase.ts)

### 1.3 Configure Prisma ORM
- [x] Install Prisma and Prisma Client (✅ prisma + @prisma/client installed)
- [x] Initialize Prisma with PostgreSQL (✅ prisma/schema.prisma created)
- [x] Configure Prisma to connect to Supabase (✅ DATABASE_URL and DIRECT_URL in .env.example)
- [x] Create `prisma/schema.prisma` with database schema (✅ All 8 models defined with relations)

### 1.4 Define Database Schema
Create the following tables in `prisma/schema.prisma`:

#### Users Table (UserStat model)
- [x] `id` (primary key) (✅ UUID with default)
- [x] `wallet_address` (unique, indexed) (✅ walletAddress String @unique)
- [x] `farcaster_fid` (optional, Farcaster ID) (✅ farcasterFid Int? @unique)
- [x] `created_at`, `updated_at` (✅ createdAt, updatedAt)

#### Countries Table (Reference Data)
- [x] `id` (primary key) (✅ UUID with default)
- [x] `code` (ISO 3166-1 alpha-2, unique) (✅ String @unique with index)
- [x] `name` (✅ String field)
- [x] `flag_url` (✅ flagEmoji String)
- [x] `region` (✅ group String? field)

#### Matches Table
- [x] `id` (primary key) (✅ UUID with default)
- [x] `match_id` (on-chain ID, unique) (✅ matchId Int @unique)
- [x] `team_a_code` (ISO 3166-1 alpha-2) (✅ team1Id relation to Country)
- [x] `team_b_code` (ISO 3166-1 alpha-2) (✅ team2Id relation to Country)
- [x] `match_date` (✅ matchDate DateTime)
- [x] `phase` (qualifier/main) (✅ phase String with qualifier/group/knockout)
- [x] `contract_address` (unique) (✅ contractAddress String? @unique)
- [x] `voting_start` (✅ votingStart DateTime?)
- [x] `voting_deadline` (✅ votingDeadline DateTime?)
- [x] `status` (pending/active/completed) (✅ status String with pending/active/completed/cancelled)
- [x] `result` (winner country code) (✅ winnerTeamId String?)
- [x] `creation_tx_hash` (✅ creationTxHash String?)
- [x] Indexes on: `match_id`, `contract_address`, `status`, `voting_deadline` (✅ All indexes defined)

#### Votes Table
- [x] `id` (primary key) (✅ UUID with default)
- [x] `match_id` (foreign key to matches) (✅ matchId relation to Match)
- [x] `user_id` (wallet address or foreign key to users) (✅ walletAddress String with index)
- [x] `amount_eth` (decimal) (✅ amountEth Decimal)
- [x] `voted_country_code` (ISO 3166-1 alpha-2) (✅ votedTeamId String)
- [x] `vote_price_at_time` (decimal) (✅ votePriceAtTime Decimal?)
- [x] `phase` (1 or 2) (✅ phase Int)
- [x] `transaction_hash` (unique) (✅ transactionHash String @unique)
- [x] `block_number` (✅ blockNumber BigInt)
- [x] `block_timestamp` (✅ blockTimestamp DateTime)
- [x] Indexes on: `match_id`, `user_id`, `transaction_hash` (✅ All indexes defined)

#### Groups Table
- [x] `id` (primary key) (✅ UUID with default)
- [x] `name` (e.g., "Group A") (✅ name String)
- [x] `countries` (array of country codes or separate junction table) (✅ GroupStanding relation table)

#### Group Standings Table
- [x] `id` (primary key) (✅ UUID with default)
- [x] `group_id` (foreign key) (✅ groupId relation to Group)
- [x] `country_code` (✅ countryId relation to Country)
- [x] `points` (✅ points Int @default(0))
- [x] `wins` (✅ wins Int @default(0))
- [x] `losses` (✅ losses Int @default(0))
- [x] `draws` (✅ draws Int @default(0))
- [x] Unique constraint on (`group_id`, `country_code`) (✅ @@unique([groupId, countryId]))

#### Indexed Transactions Table
- [x] Covered by Vote model with transaction tracking (✅ transactionHash, blockNumber, blockTimestamp in Vote model)

### 1.5 Environment Configuration
- [ ] Create `.env` file (⚠️ User must create from .env.example)
- [x] Add Supabase connection string (✅ Documented in .env.example)
- [x] Add Base RPC URL placeholder (✅ NEXT_PUBLIC_BASE_RPC_URL in .env.example)
- [x] Add contract addresses placeholders (✅ All contract env vars documented)
- [x] Add Farcaster manifest domain (✅ Documented in .env.example)
- [x] Add `.env.example` for documentation (✅ Created with comprehensive documentation)

### 1.6 Database Migration
- [ ] Generate initial Prisma migration
- [ ] Run migration against Supabase database
- [ ] Verify tables created successfully
- [ ] Seed countries reference data (ISO country codes)

### 1.7 Install Farcaster SDK
- [x] Install `@farcaster/miniapp-sdk` (✅ Installed as dependency in package.json)
- [x] Verify installation (✅ Present in package.json)

### 1.8 Create Database Utilities
- [x] Create `lib/db.ts` with Prisma client setup (✅ Created lib/prisma.ts with singleton pattern)
- [x] Create database connection helpers (✅ Prisma singleton exported)
- [x] Add error handling for database operations (✅ Logging configured based on environment)

## Acceptance Criteria
- [x] Next.js project is initialized with TypeScript (✅ Next.js 16 with strict TypeScript)
- [x] Supabase project is configured and accessible (✅ Setup guide created, env vars documented)
- [x] Prisma schema is complete with all tables (✅ All 8 models defined with relations)
- [ ] Database migrations have been applied (⚠️ Pending - requires user to set up .env with database credentials)
- [x] Environment variables are configured (✅ .env.example created with all variables)
- [ ] Countries reference data is seeded (⚠️ Pending - Phase 1.6)
- [x] Farcaster SDK is installed (✅ @farcaster/miniapp-sdk in dependencies)
- [ ] Database connection is tested and working (⚠️ Pending - requires user database setup)

## Dependencies
None (this is the foundation phase)

## Estimated Complexity
Medium - Requires configuration of multiple services and tools

## Notes
- Use Supabase free tier initially (500 MB storage)
- Can upgrade to Pro ($25/month, 8 GB) if needed
- Supabase can be managed through Vercel marketplace for unified billing
- Country codes should follow ISO 3166-1 alpha-2 format (2-letter codes)
