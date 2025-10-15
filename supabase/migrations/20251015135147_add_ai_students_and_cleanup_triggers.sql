/*
  # AI Students and Room Cleanup System

  1. New Tables
    - `ai_students`
      - `id` (uuid, primary key)
      - `name` (text)
      - `avatar_url` (text)
      - `personality` (text: focused, chatty, sleepy)
      - `created_at` (timestamptz)
    
    - `room_ai_students`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references study_rooms)
      - `ai_student_id` (uuid, references ai_students)
      - `assigned_at` (timestamptz)

  2. Triggers
    - Auto-delete empty rooms when last participant leaves
    - Auto-assign AI students to new rooms

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create ai_students table
CREATE TABLE IF NOT EXISTS ai_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text NOT NULL,
  personality text DEFAULT 'focused',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_students ENABLE ROW LEVEL SECURITY;

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
