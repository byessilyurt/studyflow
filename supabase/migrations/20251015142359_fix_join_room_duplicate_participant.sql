/*
  # Fix Join Room Duplicate Participant Issue

  1. Changes
    - Update join_room_safe to handle case where user is already a participant
    - Skip join if user is already in the room (creator case)
*/

-- Updated RPC: Join room with duplicate prevention (fixed)
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
