-- Add onboarding tracking fields to user_stats table
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comment to document the fields
COMMENT ON COLUMN user_stats.onboarding_completed IS 'Whether the user has completed the onboarding tour';
COMMENT ON COLUMN user_stats.onboarding_completed_at IS 'Timestamp when the user completed the onboarding tour';
