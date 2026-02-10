-- Add trial columns to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Create an index for checking trial status
CREATE INDEX IF NOT EXISTS idx_profiles_trial_status 
ON profiles(trial_started_at, trial_ends_at);

-- Optional: Add a check constraint to ensure valid tier values
ALTER TABLE profiles 
ADD CONSTRAINT valid_subscription_tier 
CHECK (subscription_tier IN ('free', 'weekly', 'lifetime', 'trial'))
;

-- View to check users with active trials
CREATE OR REPLACE VIEW active_trials AS
SELECT 
  id,
  email,
  full_name,
  trial_started_at,
  trial_ends_at,
  CURRENT_TIMESTAMP AT TIME ZONE 'UTC' as current_time,
  (trial_ends_at > CURRENT_TIMESTAMP AT TIME ZONE 'UTC') as is_active,
  EXTRACT(DAY FROM trial_ends_at - CURRENT_TIMESTAMP AT TIME ZONE 'UTC') as days_remaining
FROM profiles
WHERE trial_started_at IS NOT NULL;

-- View to check expired trials
CREATE OR REPLACE VIEW expired_trials AS
SELECT 
  id,
  email,
  full_name,
  trial_started_at,
  trial_ends_at,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - trial_ends_at) as days_expired
FROM profiles
WHERE trial_started_at IS NOT NULL 
  AND trial_ends_at < CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
  AND subscription_tier = 'trial';
