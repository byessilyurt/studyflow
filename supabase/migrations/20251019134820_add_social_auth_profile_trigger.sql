/*
  # Add Social Auth Profile Creation

  1. Changes
    - Create trigger to auto-create profiles for OAuth users
    - Extract name and avatar from OAuth metadata
    - Handle duplicate profile creation gracefully

  2. Notes
    - OAuth providers (Google, GitHub, Discord) provide user metadata
    - This ensures all authenticated users have profiles
*/

-- Function to create profile from OAuth signup
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_oauth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_oauth_user_signup();
