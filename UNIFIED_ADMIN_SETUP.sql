-- =============================================================================
-- UNIFIED ADMIN SETUP for HealTone™ Browser + Mobile Apps
-- Ensures origin@aeonmi.ai has full admin access in BOTH applications
-- =============================================================================
-- This migration applies to the SHARED Supabase database used by:
-- 1. Browser App: C:\Users\wlwil\Desktop\healtonefront
-- 2. Mobile App:  C:\Users\wlwil\Desktop\healtoneapp
--
-- Project: qdnijmpcedgrpalnlojp.supabase.co
-- =============================================================================

-- Step 1: Ensure is_admin column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx 
  ON public.profiles (is_admin) 
  WHERE is_admin = true;

-- Step 3: Create index for email lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx 
  ON public.profiles (email);

-- =============================================================================
-- Step 4: Grant admin privileges to origin@aeonmi.ai
-- =============================================================================

-- Update existing profile if it exists
UPDATE public.profiles
SET 
  is_admin = true,
  subscription_tier = 'lifetime',
  subscription_status = 'active',
  payment_provider = 'admin_grant',
  full_name = COALESCE(NULLIF(full_name, ''), 'Admin (Origin)'),
  updated_at = now()
WHERE LOWER(email) = 'origin@aeonmi.ai';

-- =============================================================================
-- Step 5: Create automatic admin privilege function
-- This ensures admin status is automatically granted when the account is created
-- =============================================================================

CREATE OR REPLACE FUNCTION auto_grant_admin_privileges()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is origin@aeonmi.ai (case-insensitive)
  IF LOWER(NEW.email) = 'origin@aeonmi.ai' THEN
    -- Grant full admin privileges
    NEW.is_admin := true;
    
    -- Grant lifetime subscription
    NEW.subscription_tier := 'lifetime';
    NEW.subscription_status := 'active';
    
    -- Mark as admin-granted
    NEW.payment_provider := 'admin_grant';
    
    -- Set default name if empty
    IF NEW.full_name IS NULL OR NEW.full_name = '' THEN
      NEW.full_name := 'Admin (Origin)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate triggers to ensure they're up to date
DROP TRIGGER IF EXISTS set_admin_privileges_on_insert ON public.profiles;
CREATE TRIGGER set_admin_privileges_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_admin_privileges();

DROP TRIGGER IF EXISTS set_admin_privileges_on_update ON public.profiles;
CREATE TRIGGER set_admin_privileges_on_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_admin_privileges();

-- =============================================================================
-- Step 6: Create RLS policies for admin access
-- These policies allow admins to manage users in both browser and mobile apps
-- =============================================================================

-- Policy: Admins can read all profiles
DROP POLICY IF EXISTS "admins_can_read_all_profiles" ON public.profiles;
CREATE POLICY "admins_can_read_all_profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Admins can update subscription tiers and admin status
DROP POLICY IF EXISTS "admins_can_update_profiles" ON public.profiles;
CREATE POLICY "admins_can_update_profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =============================================================================
-- Step 7: Create admin utility functions
-- =============================================================================

-- Function: Grant tier to any user (admin-only)
CREATE OR REPLACE FUNCTION admin_grant_tier(
  target_email TEXT,
  new_tier TEXT,
  new_status TEXT DEFAULT 'active'
)
RETURNS JSON AS $$
DECLARE
  target_user_id UUID;
  admin_user_id UUID;
  result JSON;
BEGIN
  -- Get the current user ID
  admin_user_id := auth.uid();
  
  -- Check if current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_user_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can grant tiers';
  END IF;
  
  -- Find the target user
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE LOWER(email) = LOWER(target_email);
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_email;
  END IF;
  
  -- Validate tier
  IF new_tier NOT IN ('free', 'weekly', 'lifetime') THEN
    RAISE EXCEPTION 'Invalid tier: %', new_tier;
  END IF;
  
  -- Update the user's subscription
  UPDATE public.profiles
  SET 
    subscription_tier = new_tier,
    subscription_status = new_status,
    payment_provider = 'admin_grant',
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'user_id', target_user_id,
    'email', target_email,
    'tier', new_tier,
    'status', new_status
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_grant_tier(TEXT, TEXT, TEXT) TO authenticated;

-- Function: Toggle admin status (super admin only - origin@aeonmi.ai)
CREATE OR REPLACE FUNCTION admin_toggle_admin_status(
  target_user_id UUID,
  should_be_admin BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  target_user_email TEXT;
  result JSON;
BEGIN
  -- Get the current user
  current_user_id := auth.uid();
  
  -- Get current user's email
  SELECT email INTO current_user_email
  FROM public.profiles
  WHERE id = current_user_id;
  
  -- Only origin@aeonmi.ai can manage admin status (super admin)
  IF LOWER(current_user_email) != 'origin@aeonmi.ai' THEN
    RAISE EXCEPTION 'Unauthorized: Only super admins can manage admin status';
  END IF;
  
  -- Prevent self-modification
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot modify your own admin status';
  END IF;
  
  -- Get target user email
  SELECT email INTO target_user_email
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF target_user_email IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;
  
  -- Update admin status
  UPDATE public.profiles
  SET 
    is_admin = should_be_admin,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'user_id', target_user_id,
    'email', target_user_email,
    'is_admin', should_be_admin
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_toggle_admin_status(UUID, BOOLEAN) TO authenticated;

-- =============================================================================
-- Step 8: Create admin dashboard view
-- =============================================================================

CREATE OR REPLACE VIEW admin_users AS
SELECT 
  id,
  email,
  full_name,
  is_admin,
  subscription_tier,
  subscription_status,
  payment_provider,
  created_at,
  updated_at
FROM public.profiles
WHERE is_admin = true
ORDER BY created_at ASC;

-- Grant access to the view
GRANT SELECT ON admin_users TO authenticated;

-- =============================================================================
-- Step 9: Create admin statistics view (for both apps)
-- =============================================================================

CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier IN ('weekly', 'lifetime') AND subscription_status = 'active') AS active_subscriptions,
  (SELECT COUNT(*) FROM public.profiles WHERE is_admin = true) AS total_admins,
  (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'lifetime') AS lifetime_users,
  (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'weekly') AS weekly_users,
  (SELECT COALESCE(SUM(total_sessions), 0) FROM public.user_stats) AS total_sessions;

-- Grant access to the view
GRANT SELECT ON admin_stats TO authenticated;

-- =============================================================================
-- Step 10: Verification
-- =============================================================================

DO $$
DECLARE
  admin_count INT;
  admin_data RECORD;
BEGIN
  -- Check if origin@aeonmi.ai exists and has proper setup
  SELECT COUNT(*) INTO admin_count
  FROM public.profiles
  WHERE LOWER(email) = 'origin@aeonmi.ai' 
    AND is_admin = true 
    AND subscription_tier = 'lifetime';
    
  IF admin_count = 0 THEN
    RAISE WARNING 'Admin account not found or not properly configured.';
    RAISE WARNING 'Please ensure origin@aeonmi.ai user has signed up in the app.';
  ELSE
    -- Get admin details
    SELECT email, full_name, subscription_tier, subscription_status, created_at
    INTO admin_data
    FROM public.profiles
    WHERE LOWER(email) = 'origin@aeonmi.ai';
    
    RAISE NOTICE '✅ SUCCESS! Admin account configured:';
    RAISE NOTICE '   Email: %', admin_data.email;
    RAISE NOTICE '   Name: %', COALESCE(admin_data.full_name, 'Not set');
    RAISE NOTICE '   Tier: %', admin_data.subscription_tier;
    RAISE NOTICE '   Status: %', admin_data.subscription_status;
    RAISE NOTICE '   Created: %', admin_data.created_at;
    RAISE NOTICE '';
    RAISE NOTICE '🌐 Browser App: Access admin dashboard at /admin.html';
    RAISE NOTICE '📱 Mobile App: Admin tab will appear in bottom navigation';
  END IF;
END $$;

-- =============================================================================
-- Final verification query - Run this to check setup
-- =============================================================================

SELECT 
  '✅ Admin Setup Complete' AS status,
  email,
  full_name,
  is_admin,
  subscription_tier,
  subscription_status,
  created_at
FROM public.profiles
WHERE LOWER(email) = 'origin@aeonmi.ai';
