/*
  # StudyFlow Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `avatar` (text)
      - `focus_time` (integer, total seconds studied)
      - `current_streak` (integer, days)
      - `longest_streak` (integer, days)
      - `level` (integer)
      - `experience` (integer)
      - `sessions_completed` (integer)
      - `rooms_created` (integer)
      - `rooms_joined` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `study_rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `subject` (text)
      - `theme` (text)
      - `max_users` (integer)
      - `is_studying` (boolean)
      - `time_remaining` (integer, seconds)
      - `session_type` (text, 'study' or 'break')
      - `music_track` (text)
      - `creator_id` (uuid, references profiles)
      - `total_study_time` (integer, seconds)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `room_participants`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references study_rooms)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamptz)
      - `is_active` (boolean)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references study_rooms)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `is_ai` (boolean)
      - `created_at` (timestamptz)
    
    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `requirement` (integer)
      - `category` (text)
    
    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `achievement_id` (uuid, references achievements)
      - `earned_at` (timestamptz)
    
    - `study_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `room_id` (uuid, references study_rooms)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `focus_time` (integer, seconds)
      - `completed` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Profiles: users can read all, update own
    - Study rooms: users can read all, create own, update own rooms
    - Room participants: users can join/leave rooms
    - Chat messages: users can read room messages, send own messages
    - Achievements: public read, admin write
    - User achievements: users can read own
    - Study sessions: users can read/write own sessions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
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

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Study rooms are viewable by everyone"
  ON study_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create study rooms"
  ON study_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Room creators can update their rooms"
  ON study_rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

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

CREATE POLICY "Room participants are viewable by everyone"
  ON room_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join rooms"
  ON room_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON room_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "User achievements are viewable by everyone"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

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

CREATE POLICY "Users can view own study sessions"
  ON study_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study sessions"
  ON study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_rooms_updated_at
  BEFORE UPDATE ON study_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();