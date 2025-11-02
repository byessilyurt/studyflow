/*
  # Comprehensive Mock Data for StudyFlow

  This script creates realistic test data covering all scenarios:
  - Multiple users with different levels and XP
  - Various study rooms (active, empty, full)
  - Room participants in different states
  - Chat messages with reactions
  - Study sessions with varying durations
  - User achievements
  - User settings variations
  - AI students in rooms
  - Room statistics

  Run this after COMPLETE_MIGRATION.sql
*/

-- ============================================================================
-- 1. CREATE TEST USERS (Profiles)
-- ============================================================================

-- Clear existing mock data (optional - comment out if you want to keep existing data)
-- TRUNCATE profiles, study_rooms, room_participants, chat_messages, message_reactions,
--          study_sessions, user_achievements, user_settings, room_stats CASCADE;

-- Create diverse test users
INSERT INTO profiles (id, name, email, avatar, level, xp, total_study_time, rooms_joined, created_at, updated_at)
VALUES
  -- Active power users
  ('00000000-0000-0000-0000-000000000001', 'Alex Chen', 'alex.chen@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 15, 7500, 86400, 45, NOW() - INTERVAL '6 months', NOW()),

  ('00000000-0000-0000-0000-000000000002', 'Maria Garcia', 'maria.garcia@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', 12, 5200, 64800, 38, NOW() - INTERVAL '4 months', NOW()),

  ('00000000-0000-0000-0000-000000000003', 'Kenji Tanaka', 'kenji.tanaka@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji', 20, 12000, 120000, 67, NOW() - INTERVAL '1 year', NOW()),

  -- Mid-level users
  ('00000000-0000-0000-0000-000000000004', 'Sarah Johnson', 'sarah.j@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 8, 2800, 36000, 22, NOW() - INTERVAL '2 months', NOW()),

  ('00000000-0000-0000-0000-000000000005', 'Mohammed Ali', 'mohammed.ali@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed', 10, 4000, 48000, 29, NOW() - INTERVAL '3 months', NOW()),

  ('00000000-0000-0000-0000-000000000006', 'Emma Wilson', 'emma.wilson@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 7, 2100, 28800, 18, NOW() - INTERVAL '1 month', NOW()),

  -- New users
  ('00000000-0000-0000-0000-000000000007', 'Liam Brown', 'liam.brown@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam', 3, 800, 10800, 8, NOW() - INTERVAL '2 weeks', NOW()),

  ('00000000-0000-0000-0000-000000000008', 'Priya Patel', 'priya.patel@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 5, 1500, 18000, 12, NOW() - INTERVAL '3 weeks', NOW()),

  ('00000000-0000-0000-0000-000000000009', 'Carlos Rodriguez', 'carlos.r@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 6, 1900, 21600, 15, NOW() - INTERVAL '1 month', NOW()),

  ('00000000-0000-0000-0000-000000000010', 'Yuki Yamamoto', 'yuki.y@example.com',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki', 4, 1200, 14400, 10, NOW() - INTERVAL '2 weeks', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  avatar = EXCLUDED.avatar,
  level = EXCLUDED.level,
  xp = EXCLUDED.xp,
  total_study_time = EXCLUDED.total_study_time,
  rooms_joined = EXCLUDED.rooms_joined,
  updated_at = NOW();

-- ============================================================================
-- 2. CREATE STUDY ROOMS (Various States)
-- ============================================================================

INSERT INTO study_rooms (id, name, subject, description, theme, music_track, max_users, is_public, creator_id, total_study_time, created_at, updated_at)
VALUES
  -- Active rooms with participants
  ('10000000-0000-0000-0000-000000000001',
   'Advanced Calculus Study Group',
   'Mathematics',
   'Tackling integration and differential equations together. All levels welcome!',
   'midnight', 'lofi', 8, true,
   '00000000-0000-0000-0000-000000000001',
   45600, NOW() - INTERVAL '3 hours', NOW()),

  ('10000000-0000-0000-0000-000000000002',
   'React & TypeScript Deep Dive',
   'Web Development',
   'Building production-ready React apps with TypeScript best practices',
   'ocean', 'rain', 6, true,
   '00000000-0000-0000-0000-000000000002',
   28800, NOW() - INTERVAL '2 hours', NOW()),

  ('10000000-0000-0000-0000-000000000003',
   'IELTS Preparation Marathon',
   'English Language',
   'Intensive IELTS prep - Reading, Writing, Listening, Speaking',
   'forest', 'nature', 10, true,
   '00000000-0000-0000-0000-000000000003',
   72000, NOW() - INTERVAL '5 hours', NOW()),

  ('10000000-0000-0000-0000-000000000004',
   'Organic Chemistry Lab',
   'Chemistry',
   'Working through lab reports and reaction mechanisms',
   'sunset', 'cafe', 5, true,
   '00000000-0000-0000-0000-000000000004',
   18000, NOW() - INTERVAL '1 hour', NOW()),

  -- Nearly full room
  ('10000000-0000-0000-0000-000000000005',
   'AWS Certification Study',
   'Cloud Computing',
   'Preparing for AWS Solutions Architect exam',
   'galaxy', 'study', 4, true,
   '00000000-0000-0000-0000-000000000005',
   36000, NOW() - INTERVAL '4 hours', NOW()),

  -- Empty but recently created rooms
  ('10000000-0000-0000-0000-000000000006',
   'Quiet Reading Time',
   'General Study',
   'Silent study room for focused reading',
   'library', 'ambient', 12, true,
   '00000000-0000-0000-0000-000000000006',
   0, NOW() - INTERVAL '30 minutes', NOW()),

  ('10000000-0000-0000-0000-000000000007',
   'Spanish Conversation Practice',
   'Languages',
   'Practicing conversational Spanish together',
   'desert', 'lofi', 6, true,
   '00000000-0000-0000-0000-000000000007',
   0, NOW() - INTERVAL '15 minutes', NOW()),

  -- Private rooms
  ('10000000-0000-0000-0000-000000000008',
   'Med School Finals Prep',
   'Medical Studies',
   'Private group for medical students',
   'midnight', 'rain', 5, false,
   '00000000-0000-0000-0000-000000000008',
   54000, NOW() - INTERVAL '6 hours', NOW()),

  -- Popular long-running room
  ('10000000-0000-0000-0000-000000000009',
   'The 24/7 Study Sanctuary',
   'Mixed Subjects',
   'Always-on study room. Drop in anytime!',
   'ocean', 'nature', 15, true,
   '00000000-0000-0000-0000-000000000003',
   432000, NOW() - INTERVAL '1 week', NOW()),

  -- Specialized subject rooms
  ('10000000-0000-0000-0000-000000000010',
   'Data Structures & Algorithms',
   'Computer Science',
   'LeetCode grinding and interview prep',
   'forest', 'study', 8, true,
   '00000000-0000-0000-0000-000000000009',
   21600, NOW() - INTERVAL '2 hours', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  updated_at = NOW();

-- ============================================================================
-- 3. ROOM PARTICIPANTS (Active Sessions)
-- ============================================================================

INSERT INTO room_participants (room_id, user_id, status, joined_at, last_seen)
VALUES
  -- Room 1: Advanced Calculus (4 participants)
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'focus', NOW() - INTERVAL '2 hours', NOW()),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'focus', NOW() - INTERVAL '1.5 hours', NOW()),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'break', NOW() - INTERVAL '45 minutes', NOW()),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'idle', NOW() - INTERVAL '30 minutes', NOW()),

  -- Room 2: React & TypeScript (3 participants)
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'focus', NOW() - INTERVAL '2 hours', NOW()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'focus', NOW() - INTERVAL '1 hour', NOW()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 'break', NOW() - INTERVAL '20 minutes', NOW()),

  -- Room 3: IELTS Preparation (5 participants)
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'focus', NOW() - INTERVAL '5 hours', NOW()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'focus', NOW() - INTERVAL '3 hours', NOW()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'focus', NOW() - INTERVAL '2 hours', NOW()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'break', NOW() - INTERVAL '1 hour', NOW()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'idle', NOW() - INTERVAL '30 minutes', NOW()),

  -- Room 4: Organic Chemistry (2 participants)
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'focus', NOW() - INTERVAL '1 hour', NOW()),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'focus', NOW() - INTERVAL '45 minutes', NOW()),

  -- Room 5: AWS Certification (3/4 participants - nearly full)
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'focus', NOW() - INTERVAL '4 hours', NOW()),
  ('10000000-0000-0000-0000-0000-000005', '00000000-0000-0000-0000-000000000001', 'focus', NOW() - INTERVAL '2 hours', NOW()),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'break', NOW() - INTERVAL '1 hour', NOW()),

  -- Room 8: Med School (Private, 2 participants)
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 'focus', NOW() - INTERVAL '6 hours', NOW()),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'focus', NOW() - INTERVAL '4 hours', NOW()),

  -- Room 9: 24/7 Study Sanctuary (6 participants)
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', 'focus', NOW() - INTERVAL '3 hours', NOW()),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'focus', NOW() - INTERVAL '2.5 hours', NOW()),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000004', 'focus', NOW() - INTERVAL '2 hours', NOW()),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000005', 'break', NOW() - INTERVAL '1 hour', NOW()),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000007', 'idle', NOW() - INTERVAL '30 minutes', NOW()),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000008', 'idle', NOW() - INTERVAL '15 minutes', NOW()),

  -- Room 10: DSA (4 participants)
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000009', 'focus', NOW() - INTERVAL '2 hours', NOW()),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'focus', NOW() - INTERVAL '1.5 hours', NOW()),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000006', 'break', NOW() - INTERVAL '45 minutes', NOW()),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', 'focus', NOW() - INTERVAL '30 minutes', NOW())
ON CONFLICT (room_id, user_id) DO UPDATE SET
  status = EXCLUDED.status,
  last_seen = EXCLUDED.last_seen;

-- ============================================================================
-- 4. CHAT MESSAGES (Diverse Conversations)
-- ============================================================================

INSERT INTO chat_messages (id, room_id, user_id, message, created_at)
VALUES
  -- Room 1: Calculus conversations
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001', 'Hey everyone! Ready to tackle these integrals?', NOW() - INTERVAL '2 hours'),

  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000004', 'Absolutely! Starting with u-substitution', NOW() - INTERVAL '1 hour 50 minutes'),

  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000007', 'Can someone explain integration by parts?', NOW() - INTERVAL '1 hour 30 minutes'),

  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001', 'Sure! Remember LIATE for choosing u and dv', NOW() - INTERVAL '1 hour 25 minutes'),

  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000010', 'Thanks! That helps a lot 🙏', NOW() - INTERVAL '1 hour 20 minutes'),

  -- Room 2: React discussion
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000002', 'Working on custom hooks today. Anyone else?', NOW() - INTERVAL '2 hours'),

  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005', 'Yes! Just finished a useLocalStorage hook', NOW() - INTERVAL '1 hour 45 minutes'),

  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000009', 'Nice! Share the code?', NOW() - INTERVAL '1 hour 30 minutes'),

  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005', 'Sure, will push to GitHub', NOW() - INTERVAL '1 hour 15 minutes'),

  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000002', 'TypeScript generics are tricky 😅', NOW() - INTERVAL '45 minutes'),

  -- Room 3: IELTS study
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000003', 'Starting reading section - aim for 8.5!', NOW() - INTERVAL '5 hours'),

  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000006', 'You got this! 💪', NOW() - INTERVAL '4 hours 30 minutes'),

  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000008', 'Writing task 2 is challenging. Any tips?', NOW() - INTERVAL '3 hours'),

  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000003', 'Structure is key: Intro, 2 body paragraphs, conclusion', NOW() - INTERVAL '2 hours 45 minutes'),

  -- Room 9: 24/7 Sanctuary (Most active)
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000003', 'Good morning everyone! ☀️', NOW() - INTERVAL '3 hours'),

  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000002', 'Morning! Coffee time ☕', NOW() - INTERVAL '2 hours 30 minutes'),

  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000004', 'Productive morning so far!', NOW() - INTERVAL '2 hours'),

  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000005', 'Break time! 25 min Pomodoro done', NOW() - INTERVAL '1 hour 30 minutes'),

  ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000007', 'Great job! Keep it up 🔥', NOW() - INTERVAL '1 hour'),

  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000008', 'Anyone studying for finals?', NOW() - INTERVAL '30 minutes'),

  -- Room 10: DSA grind
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000009', 'Starting with binary trees today', NOW() - INTERVAL '2 hours'),

  ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000001', 'DFS or BFS first?', NOW() - INTERVAL '1 hour 45 minutes'),

  ('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000009', 'DFS usually easier to implement recursively', NOW() - INTERVAL '1 hour 30 minutes'),

  ('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000006', 'Solved 3 mediums today! 🎉', NOW() - INTERVAL '45 minutes'),

  ('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000010', 'Awesome! Which ones?', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. MESSAGE REACTIONS
-- ============================================================================

INSERT INTO message_reactions (message_id, user_id, emoji, created_at)
VALUES
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', '👍', NOW() - INTERVAL '1 hour 20 minutes'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', '🙏', NOW() - INTERVAL '1 hour 15 minutes'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '❤️', NOW() - INTERVAL '1 hour 15 minutes'),
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', '👏', NOW() - INTERVAL '1 hour'),
  ('20000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000006', '💡', NOW() - INTERVAL '2 hours 30 minutes'),
  ('20000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000008', '🙏', NOW() - INTERVAL '2 hours 20 minutes'),
  ('20000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000002', '👋', NOW() - INTERVAL '2 hours 45 minutes'),
  ('20000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000003', '☕', NOW() - INTERVAL '2 hours 15 minutes'),
  ('20000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000005', '❤️', NOW() - INTERVAL '55 minutes'),
  ('20000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', '🎉', NOW() - INTERVAL '40 minutes'),
  ('20000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000009', '🔥', NOW() - INTERVAL '35 minutes'),
  ('20000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000010', '💪', NOW() - INTERVAL '30 minutes')
ON CONFLICT (message_id, user_id, emoji) DO NOTHING;

-- ============================================================================
-- 6. STUDY SESSIONS (Historical Data)
-- ============================================================================

INSERT INTO study_sessions (user_id, room_id, started_at, ended_at, duration_seconds, xp_earned, notes, created_at)
VALUES
  -- Recent sessions
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 7200, 12, 'Completed 5 calculus problems', NOW() - INTERVAL '1 hour'),

  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '30 minutes', 7200, 12, 'Built custom React hook', NOW() - INTERVAL '30 minutes'),

  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003',
   NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour', 18000, 30, 'IELTS reading practice - scored 8.0', NOW() - INTERVAL '1 hour'),

  -- Older sessions for history
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 3600, 6, NULL, NOW() - INTERVAL '23 hours'),

  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', 7200, 12, 'Organic chemistry mechanisms', NOW() - INTERVAL '2 days'),

  ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '4 hours', 14400, 24, 'AWS practice exams', NOW() - INTERVAL '3 days'),

  -- Long study sessions
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009',
   NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week' + INTERVAL '8 hours', 28800, 48, 'Deep work session - completed thesis chapter', NOW() - INTERVAL '1 week'),

  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '6 hours', 21600, 36, 'Full-stack project sprint', NOW() - INTERVAL '5 days'),

  -- Multiple short sessions
  ('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '12 hours', NOW() - INTERVAL '11.5 hours', 1800, 3, 'Quick review', NOW() - INTERVAL '11.5 hours'),

  ('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '8 hours', NOW() - INTERVAL '7.5 hours', 1800, 3, 'Pomodoro session', NOW() - INTERVAL '7.5 hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. USER ACHIEVEMENTS
-- ============================================================================

INSERT INTO user_achievements (user_id, achievement_id, earned_at, progress)
VALUES
  -- Alex Chen (Power user) - has many achievements
  ('00000000-0000-0000-0000-000000000001', 1, NOW() - INTERVAL '5 months', 1),
  ('00000000-0000-0000-0000-000000000001', 2, NOW() - INTERVAL '4 months', 1),
  ('00000000-0000-0000-0000-000000000001', 3, NOW() - INTERVAL '3 months', 1),
  ('00000000-0000-0000-0000-000000000001', 4, NOW() - INTERVAL '2 months', 1),
  ('00000000-0000-0000-0000-000000000001', 7, NOW() - INTERVAL '1 month', 1),

  -- Kenji Tanaka (Highest level) - all achievements
  ('00000000-0000-0000-0000-000000000003', 1, NOW() - INTERVAL '11 months', 1),
  ('00000000-0000-0000-0000-000000000003', 2, NOW() - INTERVAL '10 months', 1),
  ('00000000-0000-0000-0000-000000000003', 3, NOW() - INTERVAL '9 months', 1),
  ('00000000-0000-0000-0000-000000000003', 4, NOW() - INTERVAL '8 months', 1),
  ('00000000-0000-0000-0000-000000000003', 5, NOW() - INTERVAL '7 months', 1),
  ('00000000-0000-0000-0000-000000000003', 6, NOW() - INTERVAL '6 months', 1),
  ('00000000-0000-0000-0000-000000000003', 7, NOW() - INTERVAL '5 months', 1),
  ('00000000-0000-0000-0000-000000000003', 8, NOW() - INTERVAL '4 months', 1),
  ('00000000-0000-0000-0000-000000000003', 9, NOW() - INTERVAL '3 months', 1),
  ('00000000-0000-0000-0000-000000000003', 10, NOW() - INTERVAL '2 months', 1),

  -- Mid-level users with some achievements
  ('00000000-0000-0000-0000-000000000002', 1, NOW() - INTERVAL '3 months', 1),
  ('00000000-0000-0000-0000-000000000002', 2, NOW() - INTERVAL '2 months', 1),
  ('00000000-0000-0000-0000-000000000002', 3, NOW() - INTERVAL '1 month', 1),

  ('00000000-0000-0000-0000-000000000004', 1, NOW() - INTERVAL '1.5 months', 1),
  ('00000000-0000-0000-0000-000000000004', 2, NOW() - INTERVAL '2 weeks', 1),

  ('00000000-0000-0000-0000-000000000005', 1, NOW() - INTERVAL '2 months', 1),
  ('00000000-0000-0000-0000-000000000005', 2, NOW() - INTERVAL '1 month', 1),
  ('00000000-0000-0000-0000-000000000005', 3, NOW() - INTERVAL '2 weeks', 1),

  -- New users with first achievement
  ('00000000-0000-0000-0000-000000000007', 1, NOW() - INTERVAL '1 week', 1),
  ('00000000-0000-0000-0000-000000000008', 1, NOW() - INTERVAL '2 weeks', 1),
  ('00000000-0000-0000-0000-000000000009', 1, NOW() - INTERVAL '3 weeks', 1),
  ('00000000-0000-0000-0000-000000000010', 1, NOW() - INTERVAL '1 week', 1)
ON CONFLICT (user_id, achievement_id) DO UPDATE SET
  earned_at = EXCLUDED.earned_at,
  progress = EXCLUDED.progress;

-- ============================================================================
-- 8. USER SETTINGS (Diverse Preferences)
-- ============================================================================

INSERT INTO user_settings (user_id, study_duration, break_duration, notifications_enabled, sound_enabled, theme, ambient_volumes, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 45, 10, true, true, 'midnight',
   '{"lofi": 0.7, "rain": 0.3, "cafe": 0.0, "fireplace": 0.0}'::jsonb, NOW() - INTERVAL '6 months', NOW()),

  ('00000000-0000-0000-0000-000000000002', 25, 5, true, true, 'ocean',
   '{"lofi": 0.5, "rain": 0.5, "cafe": 0.2, "fireplace": 0.0}'::jsonb, NOW() - INTERVAL '4 months', NOW()),

  ('00000000-0000-0000-0000-000000000003', 60, 15, true, false, 'forest',
   '{"lofi": 0.0, "rain": 0.0, "cafe": 0.0, "fireplace": 0.0}'::jsonb, NOW() - INTERVAL '1 year', NOW()),

  ('00000000-0000-0000-0000-000000000004', 30, 5, true, true, 'sunset',
   '{"lofi": 0.4, "rain": 0.6, "cafe": 0.3, "fireplace": 0.1}'::jsonb, NOW() - INTERVAL '2 months', NOW()),

  ('00000000-0000-0000-0000-000000000005', 50, 10, false, true, 'galaxy',
   '{"lofi": 0.8, "rain": 0.0, "cafe": 0.0, "fireplace": 0.0}'::jsonb, NOW() - INTERVAL '3 months', NOW()),

  ('00000000-0000-0000-0000-000000000006', 25, 5, true, true, 'library',
   '{"lofi": 0.2, "rain": 0.8, "cafe": 0.4, "fireplace": 0.3}'::jsonb, NOW() - INTERVAL '1 month', NOW()),

  ('00000000-0000-0000-0000-000000000007', 20, 5, true, true, 'ocean',
   '{"lofi": 0.5, "rain": 0.5, "cafe": 0.5, "fireplace": 0.5}'::jsonb, NOW() - INTERVAL '2 weeks', NOW()),

  ('00000000-0000-0000-0000-000000000008', 25, 5, true, true, 'midnight',
   '{"lofi": 0.6, "rain": 0.4, "cafe": 0.0, "fireplace": 0.0}'::jsonb, NOW() - INTERVAL '3 weeks', NOW()),

  ('00000000-0000-0000-0000-000000000009', 30, 5, true, false, 'desert',
   '{"lofi": 0.0, "rain": 0.0, "cafe": 0.0, "fireplace": 0.0}'::jsonb, NOW() - INTERVAL '1 month', NOW()),

  ('00000000-0000-0000-0000-000000000010', 25, 5, true, true, 'forest',
   '{"lofi": 0.3, "rain": 0.7, "cafe": 0.2, "fireplace": 0.1}'::jsonb, NOW() - INTERVAL '2 weeks', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  study_duration = EXCLUDED.study_duration,
  break_duration = EXCLUDED.break_duration,
  updated_at = NOW();

-- ============================================================================
-- 9. ROOM STATS (Real-time Statistics)
-- ============================================================================

INSERT INTO room_stats (room_id, total_participants, active_participants, total_messages, avg_session_duration, last_activity, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 15, 4, 48, 5400, NOW(), NOW() - INTERVAL '3 hours', NOW()),
  ('10000000-0000-0000-0000-000000000002', 12, 3, 35, 6200, NOW(), NOW() - INTERVAL '2 hours', NOW()),
  ('10000000-0000-0000-0000-000000000003', 28, 5, 127, 8400, NOW(), NOW() - INTERVAL '5 hours', NOW()),
  ('10000000-0000-0000-0000-000000000004', 8, 2, 21, 4800, NOW(), NOW() - INTERVAL '1 hour', NOW()),
  ('10000000-0000-0000-0000-000000000005', 18, 3, 56, 7200, NOW(), NOW() - INTERVAL '4 hours', NOW()),
  ('10000000-0000-0000-0000-000000000006', 0, 0, 0, 0, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', NOW()),
  ('10000000-0000-0000-0000-000000000007', 0, 0, 0, 0, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes', NOW()),
  ('10000000-0000-0000-0000-000000000008', 6, 2, 18, 9600, NOW(), NOW() - INTERVAL '6 hours', NOW()),
  ('10000000-0000-0000-0000-000000000009', 142, 6, 892, 14400, NOW(), NOW() - INTERVAL '1 week', NOW()),
  ('10000000-0000-0000-0000-000000000010', 23, 4, 76, 5800, NOW(), NOW() - INTERVAL '2 hours', NOW())
ON CONFLICT (room_id) DO UPDATE SET
  total_participants = EXCLUDED.total_participants,
  active_participants = EXCLUDED.active_participants,
  total_messages = EXCLUDED.total_messages,
  avg_session_duration = EXCLUDED.avg_session_duration,
  last_activity = EXCLUDED.last_activity,
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show summary statistics
SELECT
  'Total Users' as metric, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Total Rooms', COUNT(*) FROM study_rooms
UNION ALL
SELECT 'Active Sessions', COUNT(*) FROM room_participants
UNION ALL
SELECT 'Total Messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'Total Reactions', COUNT(*) FROM message_reactions
UNION ALL
SELECT 'Study Sessions', COUNT(*) FROM study_sessions
UNION ALL
SELECT 'User Achievements', COUNT(*) FROM user_achievements;

-- Show most active rooms
SELECT
  sr.name,
  sr.subject,
  rs.active_participants as "Active Users",
  rs.total_messages as "Total Messages",
  sr.total_study_time / 3600 as "Study Hours"
FROM study_rooms sr
LEFT JOIN room_stats rs ON sr.id = rs.room_id
ORDER BY rs.active_participants DESC NULLS LAST
LIMIT 10;

-- Show top users by level
SELECT
  name,
  level,
  xp,
  total_study_time / 3600 as "Study Hours",
  rooms_joined as "Rooms Joined"
FROM profiles
ORDER BY level DESC, xp DESC
LIMIT 10;
