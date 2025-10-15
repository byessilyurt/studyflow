/*
  # Fix Room Stats Duplicate Key Issue

  1. Changes
    - Remove room_stats insertion from create_room_with_join RPC
    - The trigger on study_rooms already handles this automatically
*/

-- Updated RPC: Create room and auto-join creator (fixed)
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
