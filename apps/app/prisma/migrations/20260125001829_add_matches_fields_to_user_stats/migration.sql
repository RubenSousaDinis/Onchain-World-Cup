-- Add matches_participated and matches_won columns to user_stats table
-- These columns were missing from the init_qualification_phase migration
ALTER TABLE "user_stats"
ADD COLUMN IF NOT EXISTS "matches_participated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "matches_won" INTEGER NOT NULL DEFAULT 0;
