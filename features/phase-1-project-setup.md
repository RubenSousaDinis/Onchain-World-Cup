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
- [ ] Install Prisma and Prisma Client
- [ ] Initialize Prisma with PostgreSQL
- [ ] Configure Prisma to connect to Supabase
- [ ] Create `prisma/schema.prisma` with database schema

### 1.4 Define Database Schema
Create the following tables in `prisma/schema.prisma`:

#### Users Table
- [ ] `id` (primary key)
- [ ] `wallet_address` (unique, indexed)
- [ ] `farcaster_fid` (optional, Farcaster ID)
- [ ] `created_at`, `updated_at`

#### Countries Table (Reference Data)
- [ ] `id` (primary key)
- [ ] `code` (ISO 3166-1 alpha-2, unique)
- [ ] `name`
- [ ] `flag_url`
- [ ] `region`

#### Matches Table
- [ ] `id` (primary key)
- [ ] `match_id` (on-chain ID, unique)
- [ ] `team_a_code` (ISO 3166-1 alpha-2)
- [ ] `team_b_code` (ISO 3166-1 alpha-2)
- [ ] `match_date`
- [ ] `phase` (qualifier/main)
- [ ] `contract_address` (unique)
- [ ] `voting_start`
- [ ] `voting_deadline`
- [ ] `status` (pending/active/completed)
- [ ] `result` (winner country code)
- [ ] `creation_tx_hash`
- [ ] Indexes on: `match_id`, `contract_address`, `status`, `voting_deadline`

#### Votes Table
- [ ] `id` (primary key)
- [ ] `match_id` (foreign key to matches)
- [ ] `user_id` (wallet address or foreign key to users)
- [ ] `amount_eth` (decimal)
- [ ] `voted_country_code` (ISO 3166-1 alpha-2)
- [ ] `vote_price_at_time` (decimal)
- [ ] `phase` (1 or 2)
- [ ] `transaction_hash` (unique)
- [ ] `block_number`
- [ ] `block_timestamp`
- [ ] Indexes on: `match_id`, `user_id`, `transaction_hash`

#### Groups Table
- [ ] `id` (primary key)
- [ ] `name` (e.g., "Group A")
- [ ] `countries` (array of country codes or separate junction table)

#### Group Standings Table
- [ ] `id` (primary key)
- [ ] `group_id` (foreign key)
- [ ] `country_code`
- [ ] `points`
- [ ] `wins`
- [ ] `losses`
- [ ] `draws`
- [ ] Unique constraint on (`group_id`, `country_code`)

#### Indexed Transactions Table
- [ ] `id` (primary key)
- [ ] `transaction_hash` (unique)
- [ ] `block_number`
- [ ] `indexed_at` (timestamp)
- [ ] `event_type` (MatchCreated, VoteCast, PayoutClaimed)

### 1.5 Environment Configuration
- [ ] Create `.env` file
- [ ] Add Supabase connection string
- [ ] Add Base RPC URL placeholder
- [ ] Add contract addresses placeholders
- [ ] Add Farcaster manifest domain
- [ ] Add `.env.example` for documentation

### 1.6 Database Migration
- [ ] Generate initial Prisma migration
- [ ] Run migration against Supabase database
- [ ] Verify tables created successfully
- [ ] Seed countries reference data (ISO country codes)

### 1.7 Install Farcaster SDK
- [ ] Install `@farcaster/miniapp-sdk`
- [ ] Verify installation

### 1.8 Create Database Utilities
- [ ] Create `lib/db.ts` with Prisma client setup
- [ ] Create database connection helpers
- [ ] Add error handling for database operations

## Acceptance Criteria
- [ ] Next.js project is initialized with TypeScript
- [ ] Supabase project is configured and accessible
- [ ] Prisma schema is complete with all tables
- [ ] Database migrations have been applied
- [ ] Environment variables are configured
- [ ] Countries reference data is seeded
- [ ] Farcaster SDK is installed
- [ ] Database connection is tested and working

## Dependencies
None (this is the foundation phase)

## Estimated Complexity
Medium - Requires configuration of multiple services and tools

## Notes
- Use Supabase free tier initially (500 MB storage)
- Can upgrade to Pro ($25/month, 8 GB) if needed
- Supabase can be managed through Vercel marketplace for unified billing
- Country codes should follow ISO 3166-1 alpha-2 format (2-letter codes)
