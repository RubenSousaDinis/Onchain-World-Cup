-- Add onboarding tracking timestamp to user_stats table
-- NULL = onboarding not completed
-- NOT NULL = onboarding completed at this timestamp
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comment to document the field
COMMENT ON COLUMN user_stats.onboarding_completed_at IS 'Timestamp when the user completed the onboarding tour. NULL means not completed.';
