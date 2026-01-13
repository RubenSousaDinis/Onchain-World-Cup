# Phase 1: Project Setup & Database

## Overview
Set up the foundational Next.js project with TypeScript, configure Supabase database, and establish the core database schema. The database supports a **two-phase system**: Qualification (fixed-price support voting) and Tournament (match-based betting with dynamic pricing).

## Sub-tasks

### 1.1 Initialize Next.js Project
- [x] ✅ Create new Next.js 14+ project with App Router
- [x] ✅ Configure TypeScript
- [x] ✅ Set up project structure and folders
- [ ] Configure ESLint and Prettier
- [x] ✅ Initialize git repository (if not already done)

### 1.2 Set Up Supabase
- [ ] Create Supabase project (free tier: 500 MB storage)
- [ ] Get database connection string
- [ ] Configure database security rules
- [x] ✅ Set up Supabase client for real-time features (optional)

### 1.3 Configure Prisma ORM
- [ ] Install Prisma and Prisma Client
- [ ] Initialize Prisma with PostgreSQL
- [ ] Configure Prisma to connect to Supabase
- [ ] Create `prisma/schema.prisma` with database schema

### 1.4 Define Database Schema
Create the following tables in `prisma/schema.prisma`:

**Note**: The database has two distinct sections for the two-phase system:
- **Qualification Phase Tables**: Support voting (no matches)
- **Tournament Phase Tables**: Support match-based betting

#### Users Table (Shared)
- [ ] `id` (primary key)
- [ ] `wallet_address` (unique, indexed)
- [ ] `farcaster_fid` (optional, Farcaster ID)
- [ ] `created_at`, `updated_at`

#### Countries Table (Reference Data, Shared)
- [ ] `id` (primary key)
- [ ] `code` (ISO 3166-1 alpha-2, unique)
- [ ] `name`
- [ ] `flag_url`
- [ ] `region`

#### **QUALIFICATION PHASE TABLES**

#### Qualification Votes Table
- [ ] `id` (primary key, UUID)
- [ ] `user_address` (VARCHAR(42), wallet address)
- [ ] `country_code` (CHAR(2), ISO 3166-1 alpha-2)
- [ ] `amount_eth` (DECIMAL, amount paid)
- [ ] `fee_percent` (INTEGER, time-based fee percentage applied)
- [ ] `tx_hash` (VARCHAR(66), unique)
- [ ] `block_number` (BIGINT)
- [ ] `block_timestamp` (TIMESTAMP)
- [ ] `created_at` (TIMESTAMP)
- [ ] Indexes on: `user_address`, `country_code`, `tx_hash`

#### Qualification Standings Table
- [ ] `country_code` (CHAR(2), primary key)
- [ ] `total_votes` (INTEGER, number of votes received)
- [ ] `total_eth` (DECIMAL, total ETH after fees)
- [ ] `rank` (INTEGER, current rank)
- [ ] `is_qualified` (BOOLEAN, true if in top 48)
- [ ] `last_updated` (TIMESTAMP)
- [ ] Index on: `rank`

#### Qualified Countries Table
- [ ] `country_code` (CHAR(2), primary key)
- [ ] `final_rank` (INTEGER, final qualification rank 1-48)
- [ ] `total_votes` (INTEGER, final vote count)
- [ ] `total_eth` (DECIMAL, final ETH total)
- [ ] `qualification_time` (TIMESTAMP, when snapshot was taken)
- [ ] `created_at` (TIMESTAMP)
- [ ] Index on: `final_rank`

#### **TOURNAMENT PHASE TABLES**

#### Matches Table (Tournament only)
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

#### Tournament Votes Table (formerly "Votes")
- [ ] `id` (primary key)
- [ ] `match_id` (foreign key to matches)
- [ ] `user_id` (wallet address or foreign key to users)
- [ ] `amount_eth` (decimal)
- [ ] `voted_country_code` (ISO 3166-1 alpha-2)
- [ ] `vote_price_at_time` (decimal)
- [ ] `phase` (1 or 2, pricing phase for this specific match)
- [ ] `transaction_hash` (unique)
- [ ] `block_number`
- [ ] `block_timestamp`
- [ ] Indexes on: `match_id`, `user_id`, `transaction_hash`

#### Groups Table (Tournament only, after qualification)
- [ ] `id` (primary key)
- [ ] `name` (e.g., "Group A")
- [ ] `tournament_id` (foreign key, optional)
- [ ] `countries` (array of country codes or separate junction table)

#### Group Standings Table (Tournament only)
- [ ] `id` (primary key)
- [ ] `group_id` (foreign key)
- [ ] `country_code`
- [ ] `points`
- [ ] `wins`
- [ ] `losses`
- [ ] `draws`
- [ ] Unique constraint on (`group_id`, `country_code`)

#### Indexed Transactions Table (Shared)
- [ ] `id` (primary key)
- [ ] `transaction_hash` (unique)
- [ ] `block_number`
- [ ] `indexed_at` (timestamp)
- [ ] `event_type` (QualificationVoteCast, MatchCreated, TournamentVoteCast, PayoutClaimed)

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
- [x] ✅ Install `@farcaster/miniapp-sdk`
- [x] ✅ Verify installation

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
- **Two-Phase System**:
  - **Qualification**: Fixed-price voting (0.001 ETH), NO MATCHES, ranking-based, top 48 qualify
  - **Tournament**: Match-based betting with 2-phase dynamic pricing (linear → exponential)
- Qualification tables track support votes per country
- Tournament tables track votes per match
- See `/docs/ROADMAP.md` for complete two-phase system architecture
