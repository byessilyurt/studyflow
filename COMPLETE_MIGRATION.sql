-- ============================================================================
-- STUDYFLOW COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Create Study Flow Schema
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  avatar text DEFAULT '',
  focus_time integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  sessions_completed integer DEFAULT 0,
  rooms_created integer DEFAULT 0,
  rooms_joined integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create study_rooms table
CREATE TABLE IF NOT EXISTS study_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  theme text DEFAULT 'cozy-library',
  max_users integer DEFAULT 8,
  is_studying boolean DEFAULT false,
  time_remaining integer DEFAULT 1500,
  session_type text DEFAULT 'study',
  music_track text DEFAULT 'lofi-study',
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  total_study_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Study rooms are viewable by everyone" ON study_rooms;
CREATE POLICY "Study rooms are viewable by everyone"
  ON study_rooms FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create study rooms" ON study_rooms;
CREATE POLICY "Users can create study rooms"
  ON study_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Room creators can update their rooms" ON study_rooms;
CREATE POLICY "Room creators can update their rooms"
  ON study_rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Room creators can delete their rooms" ON study_rooms;
CREATE POLICY "Room creators can delete their rooms"
  ON study_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create room_participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES study_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(room_id, user_id)
);

ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room participants are viewable by everyone" ON room_participants;
CREATE POLICY "Room participants are viewable by everyone"
  ON room_participants FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can join rooms" ON room_participants;
CREATE POLICY "Users can join rooms"
  ON room_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participation" ON room_participants;
CREATE POLICY "Users can update own participation"
  ON room_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;
CREATE POLICY "Users can leave rooms"
  ON room_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES study_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_ai boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chat messages are viewable by room participants" ON chat_messages;
CREATE POLICY "Chat messages are viewable by room participants"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = chat_messages.room_id
      AND room_participants.user_id = auth.uid()
      AND room_participants.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can send messages to joined rooms" ON chat_messages;
CREATE POLICY "Users can send messages to joined rooms"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = chat_messages.room_id
      AND room_participants.user_id = auth.uid()
      AND room_participants.is_active = true
    )
  );

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement integer NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON user_achievements;
CREATE POLICY "User achievements are viewable by everyone"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can earn achievements" ON user_achievements;
CREATE POLICY "Users can earn achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES study_rooms(id) ON DELETE CASCADE NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  focus_time integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own study sessions" ON study_sessions;
CREATE POLICY "Users can view own study sessions"
  ON study_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own study sessions" ON study_sessions;
CREATE POLICY "Users can create own study sessions"
  ON study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study sessions" ON study_sessions;
CREATE POLICY "Users can update own study sessions"
  ON study_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement, category) VALUES
  ('First Steps', 'Complete your first study session', '🎯', 1, 'focus'),
  ('Dedicated Learner', 'Study for 10 hours total', '📚', 36000, 'focus'),
  ('Marathon Student', 'Study for 50 hours total', '🏆', 180000, 'focus'),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', 7, 'streak'),
  ('Month Master', 'Maintain a 30-day streak', '⚡', 30, 'streak'),
  ('Social Butterfly', 'Join 10 different study rooms', '🦋', 10, 'social'),
  ('Room Creator', 'Create 5 study rooms', '🏗️', 5, 'social'),
  ('Night Owl', 'Study after midnight', '🦉', 1, 'special'),
  ('Early Bird', 'Study before 6 AM', '🐦', 1, 'special'),
  ('Focused Mind', 'Complete 100 study sessions', '🧠', 100, 'focus')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_room_id ON study_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_rooms_updated_at ON study_rooms;
CREATE TRIGGER update_study_rooms_updated_at
  BEFORE UPDATE ON study_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 2: Add User Settings and Enhanced Features
-- ============================================================================

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

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
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

DROP POLICY IF EXISTS "Anyone can view reactions" ON message_reactions;
CREATE POLICY "Anyone can view reactions"
  ON message_reactions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can add reactions" ON message_reactions;
CREATE POLICY "Users can add reactions"
  ON message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own reactions" ON message_reactions;
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

DROP POLICY IF EXISTS "Anyone can view room stats" ON room_stats;
CREATE POLICY "Anyone can view room stats"
  ON room_stats FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can update room stats" ON room_stats;
CREATE POLICY "System can update room stats"
  ON room_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can modify room stats" ON room_stats;
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

-- ============================================================================
-- MIGRATION 3: Add AI Students and Cleanup Triggers
-- ============================================================================

-- Create ai_students table
CREATE TABLE IF NOT EXISTS ai_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text NOT NULL,
  personality text DEFAULT 'focused',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view AI students" ON ai_students;
CREATE POLICY "Anyone can view AI students"
  ON ai_students FOR SELECT
  TO authenticated
  USING (true);

-- Create room_ai_students table
CREATE TABLE IF NOT EXISTS room_ai_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES study_rooms(id) ON DELETE CASCADE NOT NULL,
  ai_student_id uuid REFERENCES ai_students(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(room_id, ai_student_id)
);

ALTER TABLE room_ai_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view room AI students" ON room_ai_students;
CREATE POLICY "Anyone can view room AI students"
  ON room_ai_students FOR SELECT
  TO authenticated
  USING (true);

-- Seed AI students
INSERT INTO ai_students (name, avatar_url, personality) VALUES
  ('StudyBot Alex', 'https://api.dicebear.com/7.x/bottts/svg?seed=alex&backgroundColor=b6e3f4', 'focused'),
  ('Cram Wizard', 'https://api.dicebear.com/7.x/bottts/svg?seed=wizard&backgroundColor=c0aede', 'chatty'),
  ('Midnight Scholar', 'https://api.dicebear.com/7.x/bottts/svg?seed=midnight&backgroundColor=d1d4f9', 'focused'),
  ('Coffee Champion', 'https://api.dicebear.com/7.x/bottts/svg?seed=coffee&backgroundColor=ffd5a5', 'chatty'),
  ('Focus Master', 'https://api.dicebear.com/7.x/bottts/svg?seed=master&backgroundColor=b8f3d8', 'focused'),
  ('Study Buddy', 'https://api.dicebear.com/7.x/bottts/svg?seed=buddy&backgroundColor=ffc4d6', 'sleepy')
ON CONFLICT DO NOTHING;

-- Function to delete empty rooms
CREATE OR REPLACE FUNCTION delete_empty_rooms()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM room_participants WHERE room_id = OLD.room_id
  ) THEN
    DELETE FROM study_rooms WHERE id = OLD.room_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to cleanup empty rooms
DROP TRIGGER IF EXISTS cleanup_empty_rooms ON room_participants;
CREATE TRIGGER cleanup_empty_rooms
  AFTER DELETE ON room_participants
  FOR EACH ROW
  EXECUTE FUNCTION delete_empty_rooms();

-- Function to assign AI students to new rooms
CREATE OR REPLACE FUNCTION assign_ai_students_to_room()
RETURNS TRIGGER AS $$
DECLARE
  ai_student_record RECORD;
  assigned_count INTEGER := 0;
BEGIN
  FOR ai_student_record IN (
    SELECT id FROM ai_students ORDER BY random() LIMIT 2
  )
  LOOP
    INSERT INTO room_ai_students (room_id, ai_student_id)
    VALUES (NEW.id, ai_student_record.id)
    ON CONFLICT (room_id, ai_student_id) DO NOTHING;
    assigned_count := assigned_count + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign AI students
DROP TRIGGER IF EXISTS auto_assign_ai_students ON study_rooms;
CREATE TRIGGER auto_assign_ai_students
  AFTER INSERT ON study_rooms
  FOR EACH ROW
  EXECUTE FUNCTION assign_ai_students_to_room();

-- ============================================================================
-- MIGRATION 4: Complete Room Lifecycle System
-- ============================================================================

-- RPC: Create room and auto-join creator
CREATE OR REPLACE FUNCTION create_room_with_join(
  p_name text,
  p_subject text,
  p_theme text,
  p_max_users integer,
  p_music_track text,
  p_creator_id uuid
) RETURNS json AS $$
DECLARE
  v_room_id uuid;
  v_result json;
BEGIN
  -- Insert room (trigger will auto-create room_stats)
  INSERT INTO study_rooms (name, subject, theme, max_users, music_track, creator_id)
  VALUES (p_name, p_subject, p_theme, p_max_users, p_music_track, p_creator_id)
  RETURNING id INTO v_room_id;

  -- Auto-join creator as participant
  INSERT INTO room_participants (room_id, user_id, is_active, last_activity)
  VALUES (v_room_id, p_creator_id, true, now());

  -- Start study session
  INSERT INTO study_sessions (user_id, room_id, start_time)
  VALUES (p_creator_id, v_room_id, now());

  -- Update profile stats
  UPDATE profiles
  SET rooms_created = rooms_created + 1,
      rooms_joined = rooms_joined + 1
  WHERE id = p_creator_id;

  -- Return room data
  SELECT json_build_object(
    'id', v_room_id,
    'name', p_name,
    'subject', p_subject,
    'theme', p_theme,
    'max_users', p_max_users,
    'music_track', p_music_track,
    'creator_id', p_creator_id,
    'created_at', now()
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Complete leave cleanup
CREATE OR REPLACE FUNCTION leave_room_cleanup(
  p_room_id uuid,
  p_user_id uuid
) RETURNS json AS $$
DECLARE
  v_session_id uuid;
  v_start_time timestamptz;
  v_focus_time integer;
  v_result json;
BEGIN
  -- Get active session
  SELECT id, start_time INTO v_session_id, v_start_time
  FROM study_sessions
  WHERE room_id = p_room_id
    AND user_id = p_user_id
    AND end_time IS NULL
  ORDER BY start_time DESC
  LIMIT 1;

  -- End session if exists
  IF v_session_id IS NOT NULL THEN
    v_focus_time := EXTRACT(EPOCH FROM (now() - v_start_time))::integer;

    UPDATE study_sessions
    SET end_time = now(),
        focus_time = v_focus_time,
        completed = true
    WHERE id = v_session_id;

    -- Update profile stats
    UPDATE profiles
    SET focus_time = focus_time + v_focus_time,
        sessions_completed = sessions_completed + 1,
        xp = xp + 10
    WHERE id = p_user_id;

    -- Update room stats
    UPDATE room_stats
    SET total_sessions = total_sessions + 1,
        total_focus_time = total_focus_time + v_focus_time,
        updated_at = now()
    WHERE room_id = p_room_id;
  END IF;

  -- Delete from participants
  DELETE FROM room_participants
  WHERE room_id = p_room_id AND user_id = p_user_id;

  SELECT json_build_object(
    'success', true,
    'focus_time', COALESCE(v_focus_time, 0)
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Remove user from all rooms before joining new one
CREATE OR REPLACE FUNCTION leave_all_rooms(
  p_user_id uuid
) RETURNS void AS $$
DECLARE
  v_room record;
BEGIN
  FOR v_room IN (
    SELECT room_id FROM room_participants WHERE user_id = p_user_id
  ) LOOP
    PERFORM leave_room_cleanup(v_room.room_id, p_user_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Join room with duplicate prevention
CREATE OR REPLACE FUNCTION join_room_safe(
  p_room_id uuid,
  p_user_id uuid
) RETURNS json AS $$
DECLARE
  v_already_in_room boolean;
  v_max_users integer;
  v_current_count integer;
BEGIN
  -- Check if user is already in this room
  SELECT EXISTS(
    SELECT 1 FROM room_participants
    WHERE room_id = p_room_id AND user_id = p_user_id
  ) INTO v_already_in_room;

  -- If already in room, just return success
  IF v_already_in_room THEN
    RETURN json_build_object('success', true, 'already_joined', true);
  END IF;

  -- Leave all other rooms first
  PERFORM leave_all_rooms(p_user_id);

  -- Check room capacity
  SELECT max_users INTO v_max_users FROM study_rooms WHERE id = p_room_id;
  SELECT COUNT(*) INTO v_current_count FROM room_participants WHERE room_id = p_room_id;

  IF v_current_count >= v_max_users THEN
    RETURN json_build_object('success', false, 'error', 'Room is full');
  END IF;

  -- Join room
  INSERT INTO room_participants (room_id, user_id, is_active, last_activity)
  VALUES (p_room_id, p_user_id, true, now());

  -- Start session
  INSERT INTO study_sessions (user_id, room_id, start_time)
  VALUES (p_user_id, p_room_id, now());

  -- Update profile
  UPDATE profiles
  SET rooms_joined = rooms_joined + 1
  WHERE id = p_user_id;

  RETURN json_build_object('success', true, 'already_joined', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Clean up stale participants (for cron job)
CREATE OR REPLACE FUNCTION cleanup_stale_participants()
RETURNS json AS $$
DECLARE
  v_count integer;
BEGIN
  -- Delete participants inactive for > 2 minutes
  WITH deleted AS (
    DELETE FROM room_participants
    WHERE last_activity < now() - interval '2 minutes'
    RETURNING *
  )
  SELECT COUNT(*) INTO v_count FROM deleted;

  RETURN json_build_object('removed', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update last_activity on participant updates
CREATE OR REPLACE FUNCTION update_participant_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_participant_activity_trigger ON room_participants;
CREATE TRIGGER update_participant_activity_trigger
  BEFORE UPDATE ON room_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_activity();

-- Add index for faster participant queries
CREATE INDEX IF NOT EXISTS idx_room_participants_last_activity ON room_participants(last_activity);
CREATE INDEX IF NOT EXISTS idx_study_sessions_active ON study_sessions(user_id, room_id) WHERE end_time IS NULL;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_room_with_join TO authenticated;
GRANT EXECUTE ON FUNCTION leave_room_cleanup TO authenticated;
GRANT EXECUTE ON FUNCTION leave_all_rooms TO authenticated;
GRANT EXECUTE ON FUNCTION join_room_safe TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_stale_participants TO authenticated;

-- ============================================================================
-- MIGRATION 5: Add Social Auth Profile Creation
-- ============================================================================

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

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
