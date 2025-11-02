-- ============================================================================
-- AUTHENTICATION FIX - Run this in Supabase SQL Editor
-- This fixes the critical auth issues preventing signup/login
-- ============================================================================

-- 1. Add email column to profiles table (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;

    -- Create index for email lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

    -- Backfill email from auth.users for existing profiles
    UPDATE profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id AND p.email IS NULL;
  END IF;
END $$;

-- 2. Update the OAuth trigger to properly handle email
CREATE OR REPLACE FUNCTION handle_oauth_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_name text;
  v_avatar text;
BEGIN
  -- Extract name from metadata (different providers use different fields)
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- Extract avatar from metadata
  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || v_name
  );

  -- Insert profile if it doesn't exist
  INSERT INTO profiles (id, name, avatar, email)
  VALUES (NEW.id, v_name, v_avatar, NEW.email)
  ON CONFLICT (id) DO UPDATE
  SET
    name = COALESCE(profiles.name, v_name),
    avatar = COALESCE(profiles.avatar, v_avatar),
    email = COALESCE(profiles.email, NEW.email),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger is properly set up
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;
CREATE TRIGGER on_oauth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_oauth_user_signup();

-- 4. Add fallback trigger for email/password signups too
-- This ensures ALL auth signups create a profile automatically
CREATE OR REPLACE FUNCTION handle_all_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_name text;
  v_avatar text;
BEGIN
  -- Only proceed if profile doesn't exist yet
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Extract name from metadata or email
    v_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    );

    -- Extract avatar from metadata or generate default
    v_avatar := COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || v_name
    );

    -- Insert profile
    INSERT INTO profiles (id, name, avatar, email)
    VALUES (NEW.id, v_name, v_avatar, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace the OAuth-only trigger with comprehensive trigger
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_all_user_created ON auth.users;

CREATE TRIGGER on_all_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_all_user_signup();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if email column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'email';

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_all_user_created';

-- ============================================================================
-- FIX COMPLETE!
-- ============================================================================
