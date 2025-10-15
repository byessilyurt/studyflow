/*
  # Enhanced Features Migration

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `study_duration` (integer, minutes, default 25)
      - `break_duration` (integer, minutes, default 5)
      - `music_volume` (numeric, 0-1, default 0.5)
      - `ambient_volumes` (jsonb, custom sound mix)
      - `theme_preference` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `message_reactions`
      - `id` (uuid, primary key)
      - `message_id` (uuid, references chat_messages)
      - `user_id` (uuid, references profiles)
      - `reaction` (text, emoji)
      - `created_at` (timestamptz)
    
    - `room_stats`
      - `room_id` (uuid, primary key, references study_rooms)
      - `total_sessions` (integer, default 0)
      - `total_focus_time` (integer, seconds, default 0)
      - `updated_at` (timestamptz)

  2. Updates
    - Add `xp` column to profiles
    - Add `last_activity` to room_participants for presence tracking

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  study_duration integer DEFAULT 25,
  break_duration integer DEFAULT 5,
  music_volume numeric DEFAULT 0.5,
  ambient_volumes jsonb DEFAULT '{"lofi": 0.5, "rain": 0, "cafe": 0, "fireplace": 0}'::jsonb,
  theme_preference text DEFAULT 'cozy-library',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON message_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON message_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create room_stats table
CREATE TABLE IF NOT EXISTS room_stats (
  room_id uuid PRIMARY KEY REFERENCES study_rooms(id) ON DELETE CASCADE,
  total_sessions integer DEFAULT 0,
  total_focus_time integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE room_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room stats"
  ON room_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can update room stats"
  ON room_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can modify room stats"
  ON room_stats FOR UPDATE
  TO authenticated
  USING (true);

-- Add XP column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'xp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN xp integer DEFAULT 0;
  END IF;
END $$;

-- Add last_activity to room_participants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'room_participants' AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE room_participants ADD COLUMN last_activity timestamptz DEFAULT now();
  END IF;
END $$;

-- Create function to auto-create user settings
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create settings when profile is created
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_settings();

-- Create function to auto-create room stats
CREATE OR REPLACE FUNCTION create_room_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO room_stats (room_id)
  VALUES (NEW.id)
  ON CONFLICT (room_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create stats when room is created
DROP TRIGGER IF EXISTS on_room_created ON study_rooms;
CREATE TRIGGER on_room_created
  AFTER INSERT ON study_rooms
  FOR EACH ROW
  EXECUTE FUNCTION create_room_stats();
