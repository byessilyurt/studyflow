import { supabase } from './supabase';
import type { StudyRoom, User } from '../types';
import { profileService } from './profileService';

export const roomService = {
  async getAllRooms() {
    const { data, error } = await supabase
      .from('study_rooms')
      .select(`
        *,
        creator:profiles!study_rooms_creator_id_fkey(*),
        participants:room_participants(
          user:profiles(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getRoomById(roomId: string) {
    const { data, error } = await supabase
      .from('study_rooms')
      .select(`
        *,
        creator:profiles!study_rooms_creator_id_fkey(*),
        participants:room_participants(
          user:profiles(*)
        )
      `)
      .eq('id', roomId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createRoom(room: {
    name: string;
    subject: string;
    theme: string;
    maxUsers: number;
    musicTrack: string;
    creatorId: string;
  }) {
    const { data, error } = await supabase.rpc('create_room_with_join', {
      p_name: room.name,
      p_subject: room.subject,
      p_theme: room.theme,
      p_max_users: room.maxUsers,
      p_music_track: room.musicTrack,
      p_creator_id: room.creatorId,
    });

    if (error) throw error;
    return data;
  },

  async joinRoom(roomId: string, userId: string) {
    const { data, error } = await supabase.rpc('join_room_safe', {
      p_room_id: roomId,
      p_user_id: userId,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || 'Failed to join room');
    }

    return data;
  },

  async leaveRoom(roomId: string, userId: string) {
    const { data, error } = await supabase.rpc('leave_room_cleanup', {
      p_room_id: roomId,
      p_user_id: userId,
    });

    if (error) throw error;

    if (data.focus_time > 60) {
      await profileService.checkAndAwardAchievements(userId);
    }

    return data;
  },

  async leaveAllRooms(userId: string) {
    const { error } = await supabase.rpc('leave_all_rooms', {
      p_user_id: userId,
    });

    if (error) throw error;
  },

  async updateParticipantActivity(roomId: string, userId: string) {
    const { error } = await supabase
      .from('room_participants')
      .update({ last_activity: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateRoomTimer(roomId: string, timeRemaining: number, isStudying: boolean, sessionType: 'study' | 'break') {
    const { error } = await supabase
      .from('study_rooms')
      .update({
        time_remaining: timeRemaining,
        is_studying: isStudying,
        session_type: sessionType,
      })
      .eq('id', roomId);

    if (error) throw error;
  },

  subscribeToRoom(roomId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_rooms',
          filter: `id=eq.${roomId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },

  subscribeToParticipants(roomId: string, callback: (participants: any[]) => void) {
    const loadParticipants = async () => {
      const { data, error } = await supabase
        .from('room_participants')
        .select('user:profiles(*)')
        .eq('room_id', roomId);

      if (!error && data) {
        callback(data.map(p => p.user));
      }
    };

    loadParticipants();

    const channel = supabase
      .channel(`participants:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },

  async deleteRoom(roomId: string) {
    await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId);

    await supabase
      .from('chat_messages')
      .delete()
      .eq('room_id', roomId);

    await supabase
      .from('study_sessions')
      .delete()
      .eq('room_id', roomId);

    const { error } = await supabase
      .from('study_rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;
  },
};
