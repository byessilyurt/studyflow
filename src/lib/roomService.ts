import { supabase } from './supabase';
import type { StudyRoom, User } from '../types';

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
    const { data, error } = await supabase
      .from('study_rooms')
      .insert({
        name: room.name,
        subject: room.subject,
        theme: room.theme,
        max_users: room.maxUsers,
        music_track: room.musicTrack,
        creator_id: room.creatorId,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('profiles')
      .update({ rooms_created: supabase.raw('rooms_created + 1') })
      .eq('id', room.creatorId);

    return data;
  },

  async joinRoom(roomId: string, userId: string) {
    const { error: participantError } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: userId,
        is_active: true,
      });

    if (participantError) throw participantError;

    await supabase
      .from('profiles')
      .update({ rooms_joined: supabase.raw('rooms_joined + 1') })
      .eq('id', userId);

    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        room_id: roomId,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async leaveRoom(roomId: string, userId: string) {
    const { error } = await supabase
      .from('room_participants')
      .update({ is_active: false })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;

    const { data: session } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (session) {
      const endTime = new Date();
      const startTime = new Date(session.start_time);
      const focusTime = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          focus_time: focusTime,
          completed: true,
        })
        .eq('id', session.id);

      await supabase
        .from('profiles')
        .update({
          focus_time: supabase.raw(`focus_time + ${focusTime}`),
          sessions_completed: supabase.raw('sessions_completed + 1'),
        })
        .eq('id', userId);
    }
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
      .channel(`room:${roomId}`)
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
      supabase.removeChannel(channel);
    };
  },
};
