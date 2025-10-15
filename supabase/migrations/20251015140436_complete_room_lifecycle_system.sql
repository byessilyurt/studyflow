/*
  # Complete Room Lifecycle Management System

  1. RPC Functions
    - `create_room_with_join` - Atomic room creation + auto-join
    - `leave_room_cleanup` - Complete cleanup on leave
    - `remove_stale_participants` - Cron job cleanup

  2. Triggers
    - Auto-delete empty rooms
    - Prevent duplicate joins

  3. Indexes
    - Optimize participant queries
*/

-- RPC: Create room and auto-join creator in single transaction
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
  -- Insert room
  INSERT INTO study_rooms (name, subject, theme, max_users, music_track, creator_id)
  VALUES (p_name, p_subject, p_theme, p_max_users, p_music_track, p_creator_id)
  RETURNING id INTO v_room_id;

  -- Create room stats
  INSERT INTO room_stats (room_id)
  VALUES (v_room_id);

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
BEGIN
  -- Leave all other rooms first
  PERFORM leave_all_rooms(p_user_id);

  -- Check room capacity
  IF (SELECT COUNT(*) FROM room_participants WHERE room_id = p_room_id) >= 
     (SELECT max_users FROM study_rooms WHERE id = p_room_id) THEN
    RETURN json_build_object('success', false, 'error', 'Room is full');
  END IF;

  -- Join room
  INSERT INTO room_participants (room_id, user_id, is_active, last_activity)
  VALUES (p_room_id, p_user_id, true, now())
  ON CONFLICT DO NOTHING;

  -- Start session
  INSERT INTO study_sessions (user_id, room_id, start_time)
  VALUES (p_user_id, p_room_id, now());

  -- Update profile
  UPDATE profiles
  SET rooms_joined = rooms_joined + 1
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
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

-- Trigger: Delete empty rooms (already exists, but ensure it's correct)
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

DROP TRIGGER IF EXISTS cleanup_empty_rooms ON room_participants;
CREATE TRIGGER cleanup_empty_rooms
  AFTER DELETE ON room_participants
  FOR EACH ROW
  EXECUTE FUNCTION delete_empty_rooms();

-- Add index for faster participant queries
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_last_activity ON room_participants(last_activity);
CREATE INDEX IF NOT EXISTS idx_study_sessions_active ON study_sessions(user_id, room_id) WHERE end_time IS NULL;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_room_with_join TO authenticated;
GRANT EXECUTE ON FUNCTION leave_room_cleanup TO authenticated;
GRANT EXECUTE ON FUNCTION leave_all_rooms TO authenticated;
GRANT EXECUTE ON FUNCTION join_room_safe TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_stale_participants TO authenticated;
